import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { GameList } from "../component/GameList";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

export const Home = () => {
    const { store, actions } = useContext(Context);
    const [screenshotView, setScreenshotView] = useState(null)
    const [hoveredGameId, setHoveredGameId] = useState(null);

    const navigate = useNavigate()

    const handleGameClick = (game) => {
        actions.setSpecificVideogameSteamId(game);
        navigate(`/game/${game.id}`);
    };

    return (
        <div className="home-container">
            <div className="carousel-wrapper position-relative">
                <div id="carouselExampleIndicators" className="carousel slide carousel-home m-auto">
                    <div className="carousel-indicators">
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="3" aria-label="Slide 4"></button>
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="4" aria-label="Slide 5"></button>
                    </div>
                    <div className="carousel-inner justify-content-center">
                        {store.carousel && store.carousel.relevant_games && store.carousel.relevant_games.length > 0 ? (
                            store.carousel.relevant_games.map((game, index) => (
                                <div key={game.app_id} className={`carousel-item carousel-home-item ${index === 0 ? 'active' : ''}`}>
                                    {game.detailed_info ? (
                                        <div className="d-flex">
                                            <div className="carousel-main-image-container" onMouseEnter={() => setHoveredGameId(game.app_id)} onMouseLeave={() => setHoveredGameId(null)}>
                                                <img src={`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/capsule_616x353.jpg`} alt={`${game.name}`} className={`carousel-main-image ${screenshotView || hoveredGameId === game.app_id ? 'hidden' : ''}`}/>
                                                {screenshotView && (
                                                    <img src={screenshotView} alt={`${game.name}`} className="carousel-main-image" />
                                                )}
                                                {hoveredGameId === game.app_id && (
                                                    <video autoPlay loop muted className="carousel-video">
                                                        <source src={game.detailed_info.movies[0].mp4.max.replace("http://", "https://")} type="video/mp4" />
                                                        <source src={game.detailed_info.movies[0].webm.max.replace("http://", "https://")} type="video/webm" />
                                                    </video>
                                                )}
                                            </div>
                                            <div className="carousel-info-panel position-relative">
                                                <span className="carousel-title" onClick={() => {handleGameClick(game)}}>{game.name}</span>
                                                <div className="d-flex flex-wrap carousel-screenshot-wrapper">
                                                    {game.detailed_info?.screenshots
                                                        ?.slice(0, 4)
                                                        .map((screenshot, index) => (
                                                            <div className="col-6" key={index}>
                                                                <img className="carousel-screenshot" src={screenshot.path_thumbnail} alt={`${game.name} Screenshot ${index}`} onMouseEnter={(e) => setScreenshotView(e.target.src)} onMouseLeave={() => setScreenshotView(null)}/>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                                <div className="d-flex justify-content-center my-auto flex-wrap">
                                                    <span className="d-flex gap-1 carousel-tags">
                                                        {game.game_tags ? game.game_tags.slice(0, 9).map((tag, index) => (
                                                            <button key={index} className="btn-green" onClick={() => {navigate("/allgames"), actions.updateSearchParameters(1, [tag.tag_name], 0, 90, 0, 100, 2000, 2025)}}>{tag.tag_name}</button>
                                                        )) : ""}
                                                    </span>
                                                </div>
                                                <p className="carousel-price">{game.steam_price > game.g2a_price ? game.g2a_price : game.steam_price} €</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No background image available.</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="carousel-home-item active d-flex m-auto">
                                <div className="d-flex m-auto p-5">
                                    <div className="loader d-flex"></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="carousel-control-prev carousel-wrapperhome-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon carousel-iconhome-prev" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next carousel-wrapperhome-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                        <span className="carousel-control-next-icon carousel-iconhome-next" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            <GameList />
        </div>
    );
};
