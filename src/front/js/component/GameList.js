import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../../styles/styles/gameList.css';

export const GameList = () => {
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

    const addfavouriteClick = async (game) => {
        actions.addLocalFavourite(game)
        actions.addFavourite(game.id)
        return
    }

    const deletefavouriteClick = async (game) => {
        actions.deleteLocalFavourite(game)
        actions.deleteFavourite(game.id);
        return
    }


    return (
        <div className="game-list-container d-flex flex-column">
            {/* <div className="filters">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">Rating</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Relevance</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Price</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Surprise me</a>
                    </li>
                </ul>
                <button className="btn btn-secondary advanced-search">Advance search</button>
            </div> */}

            <div className="games-table">
                {Array.isArray(store.videogames) && store.videogames.length > 0 ? (
                    store.videogames.map((game) => (
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
                            {store.logedIn == true
                                ? store.favouriteGames.some((fav) => fav.favourite_game.app_id === game.app_id)
                                    ? <div>

                                        <button className="favourite-btn px-3 fa-solid fa-heart-crack" onClick={(e) => {
                                            e.stopPropagation(),
                                                deletefavouriteClick(game)
                                        }}>
                                        </button>
                                        <button className="price-btn">{gamePriceComparer(game)}</button>
                                    </div>
                                    : <div>

                                        <button className="favourite-btn px-3 fa-regular fa-heart" onClick={(e) => {
                                            e.stopPropagation(),
                                                addfavouriteClick(game)
                                        }}>
                                        </button>
                                        <button className="price-btn">{gamePriceComparer(game)}</button>
                                    </div>
                                :
                                <button className="price-btn">{gamePriceComparer(game)}</button>
                            }
                        </div>
                    ))
                ) : (
                    <p>No hay videojuegos disponibles</p>
                )}
            </div>
            <div className='m-auto mt-2'>
                <button className='mt-3 btn btn-orange' onClick={() => navigate("/allgames")} role="button">View more!</button>
            </div>
        </div>
    );
};
