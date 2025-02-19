import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Navbar } from "../component/navbar";
import { useNavigate } from 'react-router-dom';

import "/workspaces/Fs-Spain_85-AllGamesDB/src/front/styles/gamesearchlist.css";


export const GameSearchList = () => {
    const { store, actions } = useContext(Context);
    const [favouriteInStore, setfavouriteInStore] = useState([])
    const [numberOfTagsShown, setNumberOfTagsShown] = useState(20)
    const [activeTags, setActiveTags] = useState([]);

    const navigate = useNavigate();

    const toggleTag = (tag) => {
        setActiveTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    useEffect(() => {
        console.log("Updated queryParams.tags:", store.queryParams.tags);
    }, [store.queryParams.tags]);

    useEffect(() => {
        console.log(activeTags);
    }, [activeTags])

    useEffect(() => {
        console.log(store.queryParams.tags);
    }, [store])

    useEffect(() => {
        actions.fetchSearchGames(
            store.queryParams.search,
            store.queryParams.tags,
            store.queryParams.min_rating,
            store.queryParams.max_rating,
            store.queryParams.min_price,
            store.queryParams.max_price,
            store.queryParams.release_after,
            store.queryParams.release_before,
            store.currentSearchPage,
            store.queryParams.per_page,
            store.queryParams.order_by
        );
    }, [store.currentSearchPage]);

    const handleGameClick = (game) => {
        actions.setSpecificVideogameSteamId(game)
        navigate(`/game/${game.id}`);
    };


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
        <div className="d-flex">
            <div className="search-editor border d-flex row p-2">
                <h4>Tags: </h4>
                <div className="d-flex flex-wrap pe-0 gap-2">
                    {store.tags.length > 0 ?
                        <>
                            {store.tags
                                .sort((gameA, gameB) => gameB[1] - gameA[1])
                                .slice(0, numberOfTagsShown)
                                .map((tag, index) => (
                                    <div key={index} className={`my-1 align-content-center`} onClick={() => toggleTag(tag[0])}>
                                        <button className={`m-auto p-1 ${activeTags.includes(tag[0]) ? "btn-green" : "btn-gray"}`}>{tag[0]} ({tag[1]})</button>
                                    </div>
                                ))
                            }
                            <div className="d-flex my-1 justify-content-center col-12" >
                                <button className="m-auto btn-more-tags" onClick={() => setNumberOfTagsShown(numberOfTagsShown + 20)}>Show More Tags ({store.tags.length - numberOfTagsShown})...</button>
                            </div>
                        </>
                        :
                        <div className="d-flex m-auto">
                            <div className="loader d-flex"></div>
                        </div>}
                </div>
                <h4>Price: </h4>

                <button className="btn-search-green" onClick={() => actions.updateSearchParameters(activeTags)}>Search</button>
            </div>
            {/* Responsive Off Canvas */}
            <button className="btn p-4 m-0 d-lg-none btn-offcanvas" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasLeft" aria-controls="offcanvasLeft">
                <i className="fa-solid fa-bars fa-2x"></i>
            </button>

            <div className="offcanvas offcanvas-start" tabindex="-1" id="offcanvasLeft" aria-labelledby="offcanvasLeftLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title fs-1" id="offcanvasLeftLabel">Advanced Search</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body d-lg-none d-flex flex-column">
                <h4>Tags: </h4>
                <div className="d-flex flex-wrap pe-0 gap-2">
                    {store.tags.length > 0 ?
                        <>
                            {store.tags
                                .sort((gameA, gameB) => gameB[1] - gameA[1])
                                .slice(0, numberOfTagsShown)
                                .map((tag, index) => (
                                    <div key={index} className={`my-1 align-content-center`} onClick={() => toggleTag(tag[0])}>
                                        <button className={`m-auto p-1 ${activeTags.includes(tag[0]) ? "btn-green" : "btn-gray"}`}>{tag[0]} ({tag[1]})</button>
                                    </div>
                                ))
                            }
                            <div className="d-flex my-1 justify-content-center col-12" >
                                <button className="m-auto btn-more-tags" onClick={() => setNumberOfTagsShown(numberOfTagsShown + 20)}>Show More Tags ({store.tags.length - numberOfTagsShown})...</button>
                            </div>
                        </>
                        :
                        <div className="d-flex m-auto">
                            <div className="loader d-flex"></div>
                        </div>}
                </div>
                    <a className="dropdown-item fs-3" href="#">
                        <div className="d-flex align-items-center bg-body-tertiary p-3 border border-bottom-1">
                            <i className="fa-solid fa-circle-question mx-2"></i>
                            <p className="mb-0"> Accessibility </p>
                        </div>
                    </a>
                    <a className="dropdown-item fs-3" href="#">
                        <div className="d-flex align-items-center bg-body-tertiary p-3 border border-bottom-1">
                            <i className="fa-solid fa-lock mx-2 "></i>
                            <p className="mb-0"> Privacy and data </p>
                        </div>
                    </a>
                    <a className="dropdown-item text-danger fs-3 text-center" href="#">Log out</a>
                </div>
            </div>

            {/* Game search table start */}

            <div className="games-search-table">
                {Array.isArray(store.videogamesSearch) && store.videogamesSearch.length > 0 ? (
                    store.videogamesSearch.map((game) => (
                        <div key={game.id} className="game-row" onClick={() => handleGameClick(game)}>
                            <img src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/capsule_231x87.jpg`} alt={game.name} className="game-image" />
                            <div className="game-info">
                                <h4 className='game-title'>{game.name}</h4>
                                <p className='tags'>{game.game_tags.slice(0, 3).map((tag) => tag.tag_name).join(', ')}</p>
                            </div>
                            {store.favouriteGames.some((fav) => fav.favourite_game.app_id === game.app_id)
                                ? <button className="favourite-btn me-3 fs-5" onClick={(e) => {
                                    e.stopPropagation(),
                                        deletefavouriteClick(game)
                                }}>
                                    💔
                                </button>
                                : <button className="favourite-btn me-3 fs-5" onClick={(e) => {
                                    e.stopPropagation(),
                                        addfavouriteClick(game)
                                }}>
                                    ❤️
                                </button>

                            }
                            <button className="price-btn">{game.steam_price > game.g2a_price ? game.g2a_price : game.steam_price} €</button>
                        </div>
                    ))

                ) : (
                    <p>No hay videojuegos disponibles</p>
                )}
                <nav aria-label="..." className="float-end ">
                    <ul className="pagination align-middle my-2">
                        <li className={`page-item ${store.currentSearchPage <= 1 ? "disabled" : ""}`} >
                            <a className="page-link" onClick={() => actions.handlePagination(store.currentSearchPage - 1)} href="#">Previous</a>
                        </li>

                        {store.currentSearchPage > 5 && (
                            <li className="page-item" onClick={() => actions.handlePagination(1)}>
                                <a className="page-link" href="#">1</a>
                            </li>
                        )}

                        {store.currentSearchPage > 6 && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        )}

                        {Array.from(
                            { length: 8 },
                            (_, index) => store.currentSearchPage - 4 + index)
                            .filter(page => page >= 1 && page <= store.numberOfPagesFromSearch)
                            .map(page => (
                                <li key={page} className={`page-item ${store.currentSearchPage === page ? "active" : ""}`} onClick={() => actions.handlePagination(page)}>
                                    <a className="page-link" href="#">{page}</a>
                                </li>
                            ))}

                        {store.currentSearchPage < store.numberOfPagesFromSearch - 4 && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        )}

                        {store.currentSearchPage < store.numberOfPagesFromSearch - 3 && (
                            <li className="page-item" onClick={() => actions.handlePagination(store.numberOfPagesFromSearch)}>
                                <a className="page-link" href="#">{store.numberOfPagesFromSearch}</a>
                            </li>
                        )}
                        <li className={`page-item ${store.currentSearchPage >= store.numberOfPagesFromSearch ? "disabled" : ""}`}>
                            <a className="page-link" onClick={() => actions.handlePagination(store.currentSearchPage + 1)} href="#">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
};
