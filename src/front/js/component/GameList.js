import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../../styles/styles/gameList.css';

export const GameList = () => {
    const { store, actions } = useContext(Context);
    const [activeTab, setActiveTab] = useState("Relevance");

    const navigate = useNavigate();

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleFilterChange = (tab) => {
        handleTabClick(tab);
    
        if (tab === "Relevance") {
            actions.fetchGames();
        } else if (tab === "Rating") {
            actions.fetchGames(1, "rating");
        } else if (tab === "Price") {
            actions.fetchGames(1, "price");
        } else if (tab === "Release") {
            actions.fetchGames(1, "release");
        } else {
            actions.fetchGames();
        }
    };

    useEffect(() => {
        actions.fetchGames()
    }, [])

    const handleGameClick = (game) => {
        actions.setSpecificVideogameSteamId(game);
        navigate(`/game/${game.id}`);
    };

    const handleRandomGame = async() => {
        let randomGame = Math.floor(Math.random()* store.numberOfPagesFromSearch * 10 - 10)
        await actions.fetchGameById(randomGame)
        navigate(`/game/${randomGame}`);
    }

    const handleViewMore = () => {
        if(activeTab === "Relevance") {
            actions.updateSearchParameters(1, [], 0, 90, 0, 100, 2000, 2025)
        }
        if(activeTab === "Rating") {
            actions.updateSearchParameters(1, [], 0, 90, 0, 100, 2000, 2025, "rating:desc")
        }
        if(activeTab === "Price") {
            actions.updateSearchParameters(1, [], 0, 90, 0, 100, 2000, 2025, "price:asc")
        }
        if(activeTab === "Release") {
            actions.updateSearchParameters(1, [], 0, 90, 0, 100, 2000, 2025, "release:desc")
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate("/allgames");
      }

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
            <div className="filters game-list-nav-big-screen">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === "Relevance" ? "active" : ""}`} onClick={() => {handleTabClick("Relevance"), handleFilterChange("Relevance")}}>Relevance</a>    
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === "Rating" ? "active" : ""}`} onClick={() => {handleTabClick("Rating"), handleFilterChange("Rating")}}>Rating</a>  
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === "Price" ? "active" : ""}`} onClick={() => {handleTabClick("Price"), handleFilterChange("Price")}}>Price</a>      
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === "Release" ? "active" : ""}`} onClick={() => {handleTabClick("Release"), handleFilterChange("Release")}}>Release</a>      
                    </li>
                </ul>
                <div className="surprise-wrapper">
                        <button className="btn-surprise-green" onClick={() => {handleRandomGame()}}>Surprise me!</button>
                </div>
            </div>
            <div className="filters game-list-nav-small-screen">
                <select className="form-select m-0" onChange={(e) => {handleTabClick(e.target.value), handleFilterChange(e.target.value)}}>
                    <option value="Relevance">Relevance</option>
                    <option value="Rating">Rating</option>
                    <option value="Price">Price</option>
                    <option value="Release">Release</option>
                </select>
                <div className="surprise-wrapper">
                    <button className="btn-surprise-green" onClick={() => handleRandomGame()}>Surprise me!</button>
                </div>
            </div>
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
                                <div className='tags d-flex gap-2'>{game.game_tags.slice(0, 3).map((tag, index) =>
                                    <button key={index} className="btn-green-tags">{tag.tag_name}</button>
                                 )}
                                </div>
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
                <button className='mt-3 btn btn-orange-vmore' onClick={() => handleViewMore()} role="button">View more!</button>
            </div>
        </div>
    );
};
