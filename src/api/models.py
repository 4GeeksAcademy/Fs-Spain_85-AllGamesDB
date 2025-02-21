from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, Table, String, DateTime, Integer, Float
from sqlalchemy.orm import Mapped, relationship, mapped_column 
from typing import List
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash



db = SQLAlchemy()

tags_games_association_table = db.Table(
    "tags_games_association_table",
    db.Model.metadata,
    db.Column("games_id", ForeignKey("games.id"), primary_key=True),
    db.Column("tags_id", ForeignKey("tags.id"), primary_key=True),
)

class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(254), nullable=False)
    # relación con favourites
    favourites: Mapped[List["Favourites"]] = relationship()
    # last_login: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "favourites": [favourite.serialize() for favourite in self.favourites] if self.favourites else None
            # do not serialize the password, its a security breach
        }

class Favourites(db.Model):
    __tablename__ = "favourites"
    id: Mapped[int] = mapped_column(primary_key=True)
    # name: Mapped[str] = mapped_column(String(250), nullable=False)
    # relación con user
    user_favourites_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    # relación con Games
    favourite_game_id: Mapped[int] = mapped_column(ForeignKey("games.id"))
    favourite_game: Mapped["Games"] = relationship(back_populates="favourited")

    def serialize(self):
        return {
            "id": self.id,
            # "name": self.name,
            "favourite_game": self.favourite_game.serialize() if self.favourite_game else None,
        }

class Tags(db.Model):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    tag_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    steam_id: Mapped[int] = mapped_column(nullable=True)
    # relación con games
    games: Mapped[List["Games"]] = relationship(secondary=tags_games_association_table, back_populates="game_tags")

    def serialize(self):
        return {
            "id": self.id,
            "tag_name": self.tag_name,
            "steam_id": self.steam_id,
            "games": [game.games_serialize() for game in self.games] if self.games else None
        }

    def game_tag_serialize(self):
        return {
            "tag_name": self.tag_name,
        }
    
    def tag_serialize(self):
         return {
            "id": self.id,
            "tag_name": self.tag_name,
            "steam_id": self.steam_id
        }

class Games(db.Model):
    __tablename__ = "games"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    app_id: Mapped[int] = mapped_column(Integer, nullable=True)
    release: Mapped[str] = mapped_column(String(100), nullable=True)
    image_id: Mapped[str] = mapped_column(String(255), nullable=True)
    score: Mapped[float] = mapped_column(Float, nullable=True)
    g2a_price: Mapped[float] = mapped_column(Float, nullable=True)
    g2a_url: Mapped[str] = mapped_column(String(250), nullable=True)
    steam_price: Mapped[float] = mapped_column(Float, nullable=True)
    # tags: Mapped[List[String]] = mapped_column(nullable=True)
    # relación con favoritos
    favourited: Mapped[List["Favourites"]] = relationship(back_populates="favourite_game")
    # relación con tags
    game_tags: Mapped[List["Tags"]] = relationship(secondary=tags_games_association_table, back_populates="games")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "app_id": self.app_id,
            "release": self.release,
            "image_id": self.image_id,
            "score": self.score,
            "g2a_price": self.g2a_price,
            "g2a_url": self.g2a_url,
            "steam_price": self.steam_price,
            "game_tags": [tag.game_tag_serialize() for tag in self.game_tags] if self.game_tags else None
        }

    def games_serialize(self):
        return{
            "name": self.name
        }