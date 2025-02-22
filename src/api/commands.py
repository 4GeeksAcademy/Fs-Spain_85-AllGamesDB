
import click
from api.models import db, User, Games, Tags
from sqlalchemy.sql import text
import json
from dotenv import load_dotenv
import requests
import os
import time
import json



load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL")

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""
def setup_commands(app):
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    # $ flask insert-game-data
    @app.cli.command("insert-game-data")
    def insert_game_data():
        added_games_counter = 0
        modified_games_counter = 0

        with open("src/api/scraping/matchedGames.json") as file:
            data = json.load(file)
            for game_data in data:
                game_name = game_data.get("name")
                game_tags = game_data.get("tags")

                existing_game = db.session.query(Games).filter_by(name=game_name).first()

                if existing_game:
                    print(f"Game '{game_name}' already exists")
                    updated = False
                    
                    if game_data.get("g2aPrice") != existing_game.g2a_price:
                        existing_game.g2a_price = game_data.get("g2aPrice")
                        updated = True

                    if game_data.get("steamPrice") != existing_game.steam_price:
                        existing_game.steam_price = game_data.get("steamPrice")
                        updated = True

                    if game_data.get("g2aUrl") != existing_game.g2a_url:
                        existing_game.g2a_url = game_data.get("g2aUrl")
                        updated = True

                    if game_tags != existing_game.game_tags:
                        tags_result = []
                        for tag in game_tags:
                            tag_result = Tags.query.filter_by(steam_id=tag).first()
                            tags_result.append(tag_result)
                            existing_game.game_tags = tags_result
                            updated = True    

                    if updated:
                        db.session.commit()
                        modified_games_counter += 1
                    
                    continue 

                game = Games()
                game.name = game_name
                game.app_id = game_data.get("appId")
                game.release = game_data.get("release")
                game.image_id = game_data.get("imageID")
                game.score = game_data.get("score")
                game.g2a_price = game_data.get("g2aPrice")
                game.g2a_url = game_data.get("g2aUrl")
                game.steam_price = game_data.get("steamPrice")
                game.g2a_url = game_data.get("g2aUrl")
                # game.game_tags = game_data.get("tags")
                # tags_data = game_data.get("tags", [])
                tags_result = []
                for tag in game_tags: 
                    # print(tag)
                    tag_result = Tags.query.filter_by(steam_id=tag).first()
                    # print(tag_result)
                    if not tag_result:
                        print("Missing tag in BBDD: ", tag)
                        # tag = Tags(tag_name=tag)
                        # db.session.add(tag)
                        # db.session.commit()
                    tags_result.append(tag_result)
                game.game_tags = tags_result
                # print (tags_result)
                print(game)
                added_games_counter+=1
                db.session.add(game)
                db.session.commit()
            print(f"Added {added_games_counter} games to the database")
            print(f"Modified {modified_games_counter} games to the database")
        


    # $ flask delete-all-game-data
    @app.cli.command("delete-all-game-data")
    def delete_all_game_data():
        try:
            num_deleted = db.session.query(Games).delete()
            db.session.commit()
            print(f"Deleted {num_deleted} games from the database.")
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting games: {e}")


    @app.cli.command("insert-game-tag-data")
    def insert_game_tag_data():
        try:
            with open("src/api/tags.json") as file:
                data = json.load(file)
                tags = data.get("tags")
                for tag_data in tags:
                    tag = Tags()
                    tag.tag_name = tag_data[0]
                    tag.steam_id = tag_data[1]
                    db.session.add(tag)
                    db.session.commit()
                print("Tags insertados")
        except Exception as e:
            print(f"Error adding tags: {e}")
    

    @app.cli.command("delete-all-tag-data")
    def delete_all_tag_data():
        try:
            db.session.execute(text('DELETE FROM tags_games_association_table')) 
            db.session.query(Tags).delete()
            db.session.commit()
            print("Tags y relaciones eliminados")
        except Exception as e:
            db.session.rollback()
            print(f"Error: {e}")

    @app.cli.command("get-carrousel-info")
    def get_carrousel_info():
        try:
            carrousel_games = f"{BACKEND_URL}/api/games/carrousel"
            response = requests.get(carrousel_games)
            response.raise_for_status()
            carrousel_json = response.json()

            all_games_carrousel = {
                "new_games": [],
                "relevant_games": []
            }

            for game in carrousel_json["new_games"]:
                try:
                    detailed_info_url = f"{BACKEND_URL}/api/steam/{game['app_id']}"
                    detailed_response = requests.get(detailed_info_url)

                    detailed_info = detailed_response.json()
                    game["detailed_info"] = detailed_info.get(str(game['app_id']), {}).get("data", {})
                    all_games_carrousel["new_games"].append(game)
                    print(f"New game added: {game['app_id']}")
                except Exception as e:
                    print(f"Error fetching detailed info for game {game['app_id']}: {e}")
                time.sleep(0.4)

            for game in carrousel_json["relevant_games"]:
                try:
                    detailed_info_url = f"{BACKEND_URL}/api/steam/{game['app_id']}"
                    detailed_response = requests.get(detailed_info_url)

                    detailed_info = detailed_response.json()
                    game["detailed_info"] = detailed_info.get(str(game['app_id']), {}).get("data", {})
                    all_games_carrousel["relevant_games"].append(game)
                    print(f"Relevant game added: {game['app_id']}")
                except Exception as e:
                    print(f"Error fetching detailed info for game {game['app_id']}: {e}")
                time.sleep(0.4)

            with open("all_games_carrousel.json", "w") as f:
                json.dump(all_games_carrousel, f, indent=4)

            print("Data saved to all_games_carrousel.json")

        except Exception as e:
            db.session.rollback()
            print(f"Error: {e}")
