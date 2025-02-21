import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Navbar } from "../component/navbar";
import { useNavigate } from 'react-router-dom';
import Slider from 'rc-slider';
import "/workspaces/Fs-Spain_85-AllGamesDB/src/front/styles/gamesearchlist.css";


export const GameSearchList = () => {
    const { store, actions } = useContext(Context);
    const [favouriteInStore, setfavouriteInStore] = useState([])
    const [numberOfTagsShown, setNumberOfTagsShown] = useState(20)
    const [activeTags, setActiveTags] = useState(store.queryParams.tags || []);
    const [priceValue, setPriceValue] = useState([store.queryParams.min_price || 0, store.queryParams.max_price || 90]);
    const [ratingValue, setRatingValue] = useState([store.queryParams.min_rating || 0, store.queryParams.max_rating || 100]);
    const [yearValue, setYearValue] = useState([parseInt(store.queryParams.release_after.substring(0, 4), 10), parseInt(store.queryParams.release_before.substring(0, 4), 10)]);
    const [orderBy, setSetOrderBy] = useState(store.queryParams.order_by || "relevant:asc");

    // Slider change handlers
    const handleYearChange = (newYearValue) => {
        setYearValue(newYearValue);
    };

    const handlePriceChange = (newPriceValue) => {
        setPriceValue(newPriceValue);
    };

    const handleRatingChange = (newRatingValue) => {
        setRatingValue(newRatingValue);
    };
    
    const navigate = useNavigate();

    // Save and delete new added tags in state
    const toggleTag = (tag) => {
        setActiveTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    // Updates store.currentSearchPage => which updates the current viewed page whn clicking the page buttons
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

    // Resets the store and states on button press
    const resetParameters = () => {
        setActiveTags([]);
        setPriceValue([0, 90]);
        setRatingValue([0, 100]);
        setYearValue([2000, 2025]);
        setSetOrderBy("relevant:asc");
        setNumberOfTagsShown(20)
        actions.updateSearchParameters(
            1,
            [],
            0,
            90,
            0,
            100,
            2000,
            2025,
            "relevant:asc"
        );
        console.log(activeTags);
        
    };

    // Handles navigation for clicked games
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
            <div className="search-editor border d-flex row pt-2">
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

                <div className="mb-5 p-0">
                    <h4 className="ps-2">Price:</h4>
                    <div className="m-auto d-flex">
                        <input className="slider-input" value={`${priceValue[0]}€`} readOnly ></input>
                        <div className="slider-container">
                            <Slider
                                range
                                value={priceValue}
                                onChange={handlePriceChange}
                                min={0}
                                max={90}
                            />
                        </div>
                        <input className="slider-input" value={`${priceValue[1]}€`} readOnly ></input>
                    </div>
                </div>

                <div className="mb-5 p-0">
                    <h4 className="ps-2">Rating:</h4>
                    <div className="m-auto d-flex">
                        <input className="slider-input" value={ratingValue[0]} readOnly ></input>
                        <div className="slider-container">
                            <Slider
                                range
                                value={ratingValue}
                                onChange={handleRatingChange}
                                min={0}
                                max={100}
                            />
                        </div>
                        <input className="slider-input" value={ratingValue[1]} readOnly ></input>
                    </div>
                </div>

                <div className="mb-5 p-0">
                    <h4 className="ps-2">Year:</h4>
                    <div className="m-auto d-flex">
                        <input className="slider-input" value={yearValue[0]} readOnly ></input>
                        <div className="slider-container">
                            <Slider
                                range
                                value={yearValue}
                                onChange={handleYearChange}
                                min={2000}
                                max={2025}
                            />
                        </div>
                        <input className="slider-input" value={yearValue[1]} readOnly ></input>
                    </div>
                </div>

                <div className="mb-5 p-2">
                    <h4>Order By:</h4>
                    <select onChange={(e) => setSetOrderBy(e.target.value)} value={orderBy} className="select-container">
                            <option value="relevant:asc">Most Relevant</option>
                            <option value="relevant:desc">Least Relevant</option>
                            <option value="price:asc">Lowest Price</option>
                            <option value="price:desc">Highest Price</option>
                            <option value="release:asc">Oldest Releases</option>
                            <option value="release:desc">Newest Releases</option>
                            <option value="rating:asc">Lowest Rated</option>
                            <option value="rating:desc">Highest Rated</option>
                    </select>
                </div>   

                <div className="d-flex gap-2 justify-content-center mb-3">
                    <button className="btn-search-green col-5" onClick={() => actions.updateSearchParameters(1, activeTags, priceValue[0], priceValue[1], ratingValue[0], ratingValue[1], yearValue[0], yearValue[1], orderBy)}>Search</button>
                    <button className="btn-reset-orange col-5" onClick={resetParameters}>Reset Parameters</button>
                </div>

            </div>

            {/* Responsive OffCanvas Start*/}

            <button className="btn m-0 d-lg-none btn-offcanvas position-fixed ps-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasLeft" aria-controls="offcanvasLeft">
                <i className="fa-solid fa-sliders fa-2x"></i>
            </button>

            <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasLeft" aria-labelledby="offcanvasLeftLabel">
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

                <div className="mb-5">
                    <h4>Price:</h4>
                    <div className="m-auto d-flex">
                        <input className="slider-input" value={`${priceValue[0]}€`} readOnly ></input>
                        <div className="slider-container">
                            <Slider
                                range
                                value={priceValue}
                                onChange={handlePriceChange}
                                min={0}
                                max={90}
                            />
                        </div>
                        <input className="slider-input" value={`${priceValue[1]}€`} readOnly ></input>
                    </div>
                </div>

                <div className="mb-5">
                    <h4>Rating:</h4>
                    <div className="m-auto d-flex">
                        <input className="slider-input" value={ratingValue[0]} readOnly ></input>
                        <div className="slider-container">
                            <Slider
                                range
                                value={ratingValue}
                                onChange={handleRatingChange}
                                min={0}
                                max={100}
                            />
                        </div>
                        <input className="slider-input" value={ratingValue[1]} readOnly ></input>
                    </div>
                </div>

                <div className="mb-5">
                    <h4>Year:</h4>
                    <div className="m-auto d-flex">
                        <input className="slider-input" value={yearValue[0]} readOnly ></input>
                        <div className="slider-container">
                            <Slider
                                range
                                value={yearValue}
                                onChange={handleYearChange}
                                min={2000}
                                max={2025}
                            />
                        </div>
                        <input className="slider-input" value={yearValue[1]} readOnly ></input>
                    </div>
                </div>

                <div className="mb-5">
                    <h4>Order By:</h4>

                    <select onChange={(e) => setSetOrderBy(e.target.value)} value={orderBy} className="select-container">
                            <option value="relevant:asc">Most Relevant</option>
                            <option value="relevant:desc">Least Relevant</option>
                            <option value="price:asc">Lowest Price</option>
                            <option value="price:desc">Highest Price</option>
                            <option value="release:asc">Oldest Releases</option>
                            <option value="release:desc">Newest Releases</option>
                            <option value="rating:asc">Lowest Rated</option>
                            <option value="rating:desc">Highest Rated</option>
                    </select>
                </div>   

                <div className="d-flex gap-2 justify-content-center">
                    <button className="btn-search-green col-5" onClick={() => actions.updateSearchParameters(1, activeTags, priceValue[0], priceValue[1], ratingValue[0], ratingValue[1], yearValue[0], yearValue[1], orderBy)}>Search</button>
                    <button className="btn-reset-orange col-5" data-bs-dismiss="offcanvas" aria-label="Close" onClick={resetParameters}>Reset Parameters</button>
                </div>
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
                            {store.logedIn == true 
                            ? store.favouriteGames.some((fav) => fav.favourite_game.app_id === game.app_id) 
                            ? <button className="favourite-btn me-3 fs-5" onClick={(e) => {
                                e.stopPropagation(),
                                deletefavouriteClick(game)}}>
                                   💔
                           </button> 
                           : <button className="favourite-btn me-3 fs-5" onClick={(e) => {
                                 e.stopPropagation(),
                                addfavouriteClick(game)}}>
                                    ❤️
                            </button> 
                             
                            : ""}
                            <button className="price-btn">{game.steam_price > game.g2a_price ? game.g2a_price : game.steam_price} €</button>
                        </div>
                    ))

                ) : (
                    <p>No games found!</p>
                )}

                {/* Pagination 1024px - 1440px*/}

                <nav aria-label="..." className="float-end d-none d-md-block">
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

                {/* Pagination 425px - 320px*/}

                <div className="d-flex d-md-none">
                    <nav aria-label="..." className="m-auto">
                        <ul className="pagination align-middle my-2">

                            <li className="page-item" onClick={() => actions.handlePagination(1)}>
                                <a className="page-link" href="#">{"<<"}</a>
                            </li>

                            <li className={`page-item ${store.currentSearchPage <= 1 ? "disabled" : ""}`} >
                                <a className="page-link" onClick={() => actions.handlePagination(store.currentSearchPage - 1)} href="#">{"<"}</a>
                            </li>
                            {Array.from(
                                { length: 3 },
                                (_, index) => store.currentSearchPage - 1 + index)
                                .filter(page => page >= 1 && page <= store.numberOfPagesFromSearch)
                                .map(page => (
                                    <li key={page} className={`page-item ${store.currentSearchPage === page ? "active" : ""}`} onClick={() => actions.handlePagination(page)}>
                                        <a className="page-link" href="#">{page}</a>
                                    </li>
                                ))}
                            <li className={`page-item ${store.currentSearchPage >= store.numberOfPagesFromSearch ? "disabled" : ""}`}>
                                <a className="page-link" onClick={() => actions.handlePagination(store.currentSearchPage + 1)} href="#">{">"}</a>
                            </li>
                            <li className="page-item" onClick={() => actions.handlePagination(store.numberOfPagesFromSearch)}>
                                <a className="page-link" href="#">{">>"}</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    )
};
