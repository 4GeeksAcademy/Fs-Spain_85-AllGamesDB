"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, abort
from api.models import db, User, Games, Tags, Favourites, tags_games_association_table
from api.utils import generate_sitemap, APIException
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
from flask_cors import CORS
import requests
from math import ceil
from sqlalchemy import func, asc, desc, cast, DateTime
from sqlalchemy.orm import aliased
import re
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_bcrypt import Bcrypt
from app import jwt
from datetime import datetime
from dotenv import load_dotenv
import os, json

api = Blueprint('api', __name__)
bcrypt = Bcrypt()



# Allow CORS requests to this API
CORS(api)#proteccion solo cuando permito

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL")

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    data = db.session.scalars(db.select(User)).all()
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

# endpoints de juegos
# @api.route("/games", methods=['GET'])
# def get_all_games():
#     data = db.session.scalars(db.select(Games)).all()
#     results = list(map(lambda item: item.serialize(), data))
#     response_body = {
#         "results": results
#     }
#     return jsonify(response_body), 200


# Example link using all arguments
# https://reimagined-chainsaw-jjgpw9qgvjjh79-3001.app.github.dev/api/games?search=lies&filter=action,rpg&min_rating=78&max_rating=95&min_price=20&max_price=60&release_after=2023-01-01T00:00:00.000Z&release_before=2023-12-31T23:59:59.999Z&order_by=rating:asc&page=1&per_page=10
# Break down
# /api/games?
# search=lies
# filter=action,rpg
# min_rating=78
# max_rating=95
# min_price=20
# max_price=60
# release_after=2023-01-01T00:00:00.000Z
# release_before=2023-12-31T23:59:59.999Z
# page=1
# per_page=10
# order_by=rating:asc

@api.route("/games", methods=['GET'])
def get_page_games():

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    min_rating = request.args.get('min_rating', default=None, type=float)
    max_rating = request.args.get('max_rating', default=None, type=float)
    min_price = request.args.get('min_price', default=None, type=float)
    max_price = request.args.get('max_price', default=None, type=float)
    release_after = request.args.get('release_after', default=None, type=str)
    release_before = request.args.get('release_before', default=None, type=str)
    order_by = request.args.get('order_by', default=None, type=str)
    search = request.args.get('search', default=None, type=str)

    filter_param = request.args.get('filter', default='', type=str)
    tag_names = [tag.strip().lower() for tag in filter_param.split(',') if tag.strip()]

    query = Games.query

    if search:
        query = query.filter(Games.name.ilike(f'%{search}%'))
    
    if tag_names:
        for tag in tag_names:
            subq = (
                db.session.query(tags_games_association_table.c.games_id)
                .join(Tags, Tags.id == tags_games_association_table.c.tags_id)
                .filter(Tags.tag_name.ilike(tag))
                .filter(Games.id == tags_games_association_table.c.games_id)
                .exists()
            )
            query = query.filter(subq)

    if min_rating:
        query = query.filter(Games.score >= min_rating)
    if max_rating:
        query = query.filter(Games.score <= max_rating)
    if min_price or max_price:
        lower_price = func.least(Games.steam_price, Games.g2a_price)
        if min_price:
            query = query.filter(lower_price >= min_price)
        if max_price:
            query = query.filter(lower_price <= max_price)

    if release_after:
        try:
            release_after_date = datetime.fromisoformat(release_after.replace('Z', '+00:00'))
            query = query.filter(cast(Games.release, DateTime) >= release_after_date)
        except ValueError:
            return jsonify({"error": "Invalid date format for release_after"}), 400

    if release_before:
        try:
            release_before_date = datetime.fromisoformat(release_before.replace('Z', '+00:00'))
            query = query.filter(cast(Games.release, DateTime) <= release_before_date)
        except ValueError:
            return jsonify({"error": "Invalid date format for release_before"}), 400
        
    if order_by:
        order_field, order_direction = order_by.split(':')
        if order_field == 'price':
            order_column = func.least(Games.steam_price, Games.g2a_price)
        elif order_field == 'release':
            order_column = Games.release
        elif order_field == 'rating':
            order_column = Games.score
        elif order_field == 'relevant':
            pass
        else:
            order_column = None

        if order_field != 'relevant' and order_column is not None:
            if order_direction.lower() == 'asc':
                query = query.order_by(asc(order_column))
            elif order_direction.lower() == 'desc':
                query = query.order_by(desc(order_column))

    total_pages = query.paginate(page=1, per_page=per_page, error_out=False).pages

    if order_by and order_field == 'relevant' and order_direction.lower() == 'desc':
        page = total_pages - page + 1

    per_page = min(per_page, 10)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    result_data = {
        "result": [game.serialize() for game in pagination.items],
        "total_pages": total_pages
    }

    if not result_data["result"]:
        return jsonify({"Error": "No data in the page"}), 404

    return jsonify(result_data), 200

@api.route("games/carrousel", methods=["GET"])
def get_info_carrousel():
    relevant_games_url = f"{BACKEND_URL}/api/games"
    new_games_url = f"{BACKEND_URL}/api/games?order_by=release:desc"

    try:
        relevant_games_response = requests.get(relevant_games_url)
        relevant_games = relevant_games_response.json()["result"][:5]

        new_games_response = requests.get(new_games_url)
        new_games = new_games_response.json()["result"]

        relevant_game_ids = {game["id"] for game in relevant_games}

        filtered_new_games = []
        for game in new_games:
            if game["id"] not in relevant_game_ids:
                filtered_new_games.append(game)
                if len(filtered_new_games) >= 5:
                    break
        result_data = {
            "relevant_games": relevant_games,
            "new_games": filtered_new_games
        }

        return jsonify(result_data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api.route("/carrousel", methods=["GET"])
def get_carrousel_data():
    try:
        with open("all_games_carrousel.json", "r") as f:
            carrousel_data = json.load(f)
        return jsonify(carrousel_data), 200
    except FileNotFoundError:
        abort(404, description="Carrousel data not found. Please run the 'flask get-carrousel-info' command first.")
    except json.JSONDecodeError:
        abort(500, description="Invalid JSON data in the carrousel file.")

@api.route("/games", methods=['POST'])
def post_game():
    request_data = request.json
    name = request_data.get('name')
    tags_id = request_data.get('tags')
    try:
        game = db.session.execute(db.select(Games).filter_by(name=name)).scalar_one()
        if game:
            return jsonify({"msg": "game already exists, did you mean to do a PUT?"}), 400
    except NoResultFound:
        pass
    except MultipleResultsFound:
        return jsonify({"msg": "game already exists, did you mean to do a PUT?"}), 400
    except Exception as e:
        print("Error al intentar postear juego: ", e)
        return jsonify({"msg": "Algo no ha salido como debería"}), 400
    tags = []
    if not isinstance(tags_id, list):
            return jsonify({"error": "tags must be a list"}), 400
    for tag_id in tags_id:
        try:
            db.session.execute(db.select(Tags).filter_by(steam_id=tag_id)).scalar_one()
        except NoResultFound:
            print(f"tag_id not found in database {tag_id}")
        except:
            pass  
    try:
        tags = db.session.scalars(db.select(Tags).filter(Tags.steam_id.in_(tags_id))).all()
        print(tags)
    except Exception as e:
        print("Error al intentar postear juego: ", e)
        pass
    result = Games(
        name = request_data.get('name'),
        app_id = request_data.get('appId'),
        release = request_data.get('release'),
        image_id = request_data.get('imageID'),
        score = request_data.get('score'),
        g2a_price = request_data.get('g2aPrice'),
        g2a_url = request_data.get('g2aUrl'),
        steam_price = request_data.get('steamPrice'),
        game_tags = tags
    )
    db.session.add(result)
    db.session.commit()
    return jsonify(result.serialize()), 201


# endpoints de tags
@api.route("/tags", methods=['GET'])
def get_all_tags():
    data = db.session.scalars(db.select(Tags)).all()
    results = list(map(lambda item: {
        **item.serialize(),
        "number_of_games": len(item.games) if hasattr(item, "games") else 0
    }, data))
    if len(results) < 1:
        return jsonify({"msg": "No available tags"}), 200
    response_body = {
        "results": results
    }
    return jsonify(response_body), 200

@api.route("/tags/names", methods=['GET'])
def get_tag_names():
    data = db.session.scalars(db.select(Tags)).all()
    results = list(map(lambda item: {
        "tag_name": item.tag_name,
        "number_of_games": len(item.games) if hasattr(item, "games") else 0
    }, data))
    
    if not results:
        return jsonify({"msg": "No available tags"}), 200

    return jsonify({"results": results}), 200

@api.route("/tags", methods=['POST'])
def post_tag():
    request_data=request.json
    tags = request_data.get("tags")
    if not isinstance(tags, list):
            return jsonify({"error": "tags must be a list"}), 400
    added_tags = []
    for tag in tags:
        try:
            if not isinstance(tag[0], str):
                return jsonify({"error": "The first value of each array needs to be a string"}), 400
            if str(tag[0]).isnumeric():
                return jsonify({"error": "The first value of each array can not be a number"}), 400
            tag_name = db.session.execute(db.select(Tags).filter_by(tag_name=tag[0])).scalar_one()
            if tag_name:
                return jsonify({"msg": f"tag with same name already exists {tag_name.tag_serialize()}"}), 400
        except NoResultFound:
            pass
        try:
            if not str(tag[1]).isnumeric():
                return jsonify({"error": "The second value of each array needs to be a number"}), 400
            tag_steam_id = db.session.execute(db.select(Tags).filter_by(steam_id=tag[1])).scalar_one()
            if tag_steam_id:
                return({"msg": f"tag with same steam_id already exists {tag_steam_id.tag_serialize()}"}), 400
        except NoResultFound:
            pass

        new_tag = Tags(
            tag_name = tag[0],
            steam_id = tag[1]
        )
        added_tags.append(new_tag.tag_serialize())
        print(new_tag.tag_serialize())
        db.session.add(new_tag)
        db.session.commit()
        
    return jsonify({"Added tags": added_tags})

def fetch_steam_data(appId):
    url = f"https://store.steampowered.com/api/appdetails?appids={appId}"
    response = requests.get(url)  
    if response.status_code == 200:
        return response.json()
    return None

@api.route('/steam/<int:appId>', methods=['GET'])
def get_steam_data(appId):
    data = fetch_steam_data(appId)
    if data:
        response = jsonify(data)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        print("Sending response...")
        return response
    else:
        print("Failed to fetch data from Steam API")
        return jsonify({"error": "Failed to fetch data from Steam API"}), 500
    
# @api.route('/games', methods=['PUT'])
# def change_all_game_data():

# /search?filter=example
@api.route("/search", methods=['GET'])
def get_search_request():
    game_name = request.args.get('filter', default='', type=str).strip()
    
    # Query the database with a limit of 5 results
    query = db.select(Games).limit(5)  # Always limit to 5 games
    
    if game_name:
        query = query.where(Games.name.ilike(f"%{game_name}%"))

    games = db.session.scalars(query).all()
    # Format the response with only required fields
    search_output = [game.serialize() for game in games]


    response = jsonify(search_output)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"

    return response, 200


@api.route('/signup', methods=['POST'])
def signup():
    request_data = request.get_json()
    required_data = ["email", "password"]
    for item in required_data:
        if item not in request_data:
            return jsonify({"error": f"Missing information: {item}"}), 400
    email = request_data.get("email").lower()
    password = request_data.get("password")
    # validar el email
    email_regex = re.compile(r'^[[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$')
    if not bool(email_regex.match(email)):
        return jsonify({"error": "the email is not valid"}), 400
    # Verificar si el email ya está registrado
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "El usuario ya existe"}), 400
    # Validar longitud de contraseña
    password_regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$'
    if not re.fullmatch(password_regex, password):
        return jsonify({"error": "password isn't valid"}), 400

    # Crear nuevo usuario
    new_user = User(email=email)
    new_user.set_password(password)  # Hashear contraseña
    
    response = jsonify({"msg": "Usuario registrado con éxito"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    db.session.add(new_user)
    db.session.commit()

    return response, 201

#login modificado el login 
@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email").lower()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Wrong credentials"}), 401
    
    # Creamos el token de acceso
    access_token = create_access_token(identity=user.email)
    response = jsonify({"token": access_token, "user": user.serialize()})
    # response.headers["Access-Control-Allow-Origin"] = "*"
    # response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    # response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200




#profile, obtenemos usuario y favoritos
@api.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    email = get_jwt_identity()
    try:
        user = db.session.execute(db.select(User).filter_by(email=email)).scalar_one()
    except NoResultFound:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    response = jsonify(user.serialize())
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200

# endpoint para añadir favoritos al usuario
@api.route('/profile/favourites', methods=['POST'])
@jwt_required()
def post_favourite():
    request_data = request.json
    print(request_data)
    email = get_jwt_identity()
    if not request_data or not "game_id" in request_data or not email:
        return jsonify({"error": "missing game_id or auth token"}), 400
    game_id = request_data.get('game_id')
    try:
        user = db.session.execute(db.select(User).filter_by(email=email)).scalar_one()
    except NoResultFound:
        return jsonify({"error": "Usuario no encontrado"}), 404
    try:
        game = db.session.execute(db.select(Games).filter_by(id=game_id)).scalar_one()
    except NoResultFound:
        return jsonify({"error": "Game not found"}), 404
    try:
        favourites = db.session.execute(db.select(Favourites).filter_by(favourite_game=game, user_favourites_id=user.id)).scalar_one()
        if favourites:
            return jsonify({"error": "favourite already exist"}), 400
    except NoResultFound:
        pass
    except:
        return jsonify({"error": "Something went wrong while trying to post new favourite"}), 500
    new_favourite = Favourites(
        user_favourites_id = user.id,
        favourite_game = game
    )
    
    response = jsonify({"msg": new_favourite.serialize()})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    db.session.add(new_favourite)
    db.session.commit()
    return response, 201

# endpoint delete favourites
@api.route('/profile/favourites', methods=['Delete'])
@jwt_required()
def delete_favourite():
    request_data = request.json
    email = get_jwt_identity()
    if not request_data or not "game_id" in request_data or not email:
        return jsonify({"error": "missing game_id or auth token"}), 400
    game_id = request_data.get('game_id')
    try:
        user = db.session.execute(db.select(User).filter_by(email=email)).scalar_one()
    except NoResultFound:
        return jsonify({"error": "Usuario no encontrado"}), 404
    try:
        favourite = db.session.execute(db.select(Favourites).filter_by(favourite_game_id=game_id, user_favourites_id=user.id)).scalar_one()
    except NoResultFound:
        return jsonify({"error": "The favourite you are trying to delete doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": f"something went wrong {e}"}), 500
    
    response = jsonify({"msg": "favourite game deleted"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    db.session.delete(favourite)
    db.session.commit()
    return response, 200

@api.route("/update-password", methods=["PUT"])
@jwt_required()
def update_password():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "New and old passwords are required"}), 400

    if not user.check_password(old_password):
        return jsonify({"error": "Wrong password"}), 401
    
    if old_password == new_password:
        return jsonify({"error": "New password can't be your actual password"})
    
    password_regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$'
    if not re.fullmatch(password_regex, new_password):
        return jsonify({"error": "Invalid password, it must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."}), 400

    user.set_password(new_password)
    db.session.commit()
    
    response = jsonify({"msg": "Password updated"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"

    return response, 200



#enpoint para validación de token
@api.route("/token-verify", methods=['GET'])
@jwt_required()
def token_verify():
    email = get_jwt_identity()
    try:
        user = db.session.execute(db.select(User).filter_by(email=email)).scalar_one()
    except NoResultFound:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    response = jsonify({"msg": "valid token"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200


    