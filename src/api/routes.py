"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Games, Tags, Favourites
from api.utils import generate_sitemap, APIException
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
from flask_cors import CORS
import requests
from math import ceil

from flask import request, jsonify, Blueprint
import subprocess
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_bcrypt import Bcrypt
from app import jwt


api = Blueprint('api', __name__)
bcrypt = Bcrypt()
blacklist = set()


# Allow CORS requests to this API
CORS(api)#proteccion solo cuando permito


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


@api.route("/games", methods=['GET'])
def get_page_games():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    if per_page > 10:
        per_page = 10
    pagination = Games.query.paginate(page=page, per_page=per_page, error_out=False)
    total_pages = ceil(pagination.total / per_page)
    result_data = {
        "result": [game.serialize() for game in pagination.items],
        "total_pages": total_pages
    }
    # print(result_data[re])
    if len(result_data["result"]) < 1:
        response = jsonify({"Error": "no data in the page"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response, 404
    response = jsonify(result_data)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200


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
    results = list(map(lambda item: item.serialize(), data))
    if len(results) < 1:
        return jsonify({"msg": "No available tags"}), 200
    response_body = {
        "results": results
    }
    return jsonify(response_body), 200


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


#registro 
# @api.route('/register', methods=['POST'])
# def register():
#     data = request.json
#     email = data.get("email")
#     password = data.get("password")

#     if not email or not password:
#         return jsonify({"error": "Faltan datos"}), 400

#     existing_user = User.query.filter_by(email=email).first()
#     if existing_user:
#         return jsonify({"error": "El usuario ya existe"}), 400

#     new_user = User(email=email)
#     new_user.set_password(password)
#     db.session.add(new_user)
#     db.session.commit()

#     return jsonify({"message": "Usuario registrado exitosamente"}), 201

@api.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    # Verificar si el email ya está registrado
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"msg": "El usuario ya existe"}), 400

    # Crear nuevo usuario
    new_user = User(email=data["email"])
    new_user.set_password(data["password"])  # Hashear contraseña
    
    response = jsonify({"msg": "Usuario registrado con éxito"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    db.session.add(new_user)
    db.session.commit()

    return response, 201

#login
@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"msg": "Wrong credentials"}), 401
    
    # Creamos el token de acceso
    access_token = create_access_token(identity=user.email)
    response = jsonify({"token": access_token, "user": user.serialize()})
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200


#logout
@api.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]  # Identificador único del token
    blacklist.add(jti)  # Agregar a la lista negra
    return jsonify({"msg": "Cierre de sesión exitoso"}), 200

@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    return jwt_payload["jti"] in blacklist

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
    