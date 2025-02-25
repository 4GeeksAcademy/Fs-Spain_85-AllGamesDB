import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../../styles/styles/gameList.css';




export const Favorites = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    const handleGameClick = (game) => {
        actions.setSpecificVideogameSteamId(game);
        navigate(`/game/${game.id}`);
    };

    function gamePriceComparer(game) {
        if (game.steam_price > game.g2a_price) return game.g2a_price + " €";
        else return game.steam_price + ` €`;
    }

    const deletefavouriteClick = async (game) => {
        actions.deleteLocalFavourite(game);
        actions.deleteFavourite(game.id);
        return;
    };

    return (
        <div className="game-list-container d-flex flex-column">
            <h2 className="favorites-title">Your Favorites</h2>
            <div className="games-table">
                {Array.isArray(store.favouriteGames) && store.favouriteGames.length > 0 ? (
                    store.favouriteGames.map((fav) => {
                        const game = fav.favourite_game;
                        return (
                            <div key={game.id} className="game-row" onClick={() => handleGameClick(game)}>
                                <img
                                    src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/capsule_231x87.jpg`}
                                    alt={game.name}
                                    className="game-image hover-effect"
                                />
                                <div className="game-info">
                                    <h4 className='game-title'>{game.name}</h4>
                                    <p className='tags'>{game.game_tags.slice(0, 3).map((tag) => tag.tag_name).join(', ')}</p>
                                </div>
                                <button className="favourite-btn me-3 fa-solid fa-heart-crack" onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    deletefavouriteClick(game);
                                }}>
                                </button>
                                <button className="price-btn">{gamePriceComparer(game)}</button>
                            </div>
                        );
                    })
                ) : (
                    <p>No favorite games yet!</p>
                )}
            </div>
        </div>
    );
};