import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../store/appContext';
import { useNavigate } from "react-router-dom";
import '../../styles/GameDetails.css';


export const GameDetails = () => {
    const { store, actions } = useContext(Context);
    const { id } = useParams();
    const navigate = useNavigate()

    const getRatingColor = (rating) => {
        if (rating >= 80) return "success"
        if (rating >= 60) return "warning"
        if (rating < 60) return "danger"
    }

    useEffect(() => {
        actions.fetchGameDetails(store.selectedGame["app_id"]);
    }, [id]);

    const game = store.selectedGame;

    if (!game) {
        return <div>Cargando...</div>;
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
        <>
        <div className='row w-100 mx-auto text-center justify-content-center game-details-container'>
            <div className="parallax-background">
                <img src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/library_hero.jpg`} className="parallax-image"/>                   
            </div>
            <div className='m-2'>
                <button className='btn btn-green-back' onClick={() => navigate("/allgames")}>Go Back</button>
            </div>
            <div className='top-details-container d-flex flex-row mb-4'>
                <div className='carousel-details-wrapper m-auto d-flex align-items-center'>
                    <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="">
                        <div className="carousel-indicators carousel-details-indicators">
                            {game.detailedInfo && (game.detailedInfo.screenshots.length > 0 || game.detailedInfo.movies.length > 0) ? (
                                <>
                                    {game.detailedInfo.movies.slice(0, 2).map((_, index) => (
                                        <button
                                            key={`movie-${index}`}
                                            type="button"
                                            data-bs-target="#carouselExampleIndicators"
                                            data-bs-slide-to={index}
                                            className={index === 0 ? "active" : ""}
                                            aria-current={index === 0 ? "true" : undefined}
                                            aria-label={`Movie ${index + 1}`}
                                        ></button>
                                    ))}
                                    {game.detailedInfo.screenshots.map((_, index) => (
                                        <button
                                            key={`screenshot-${index}`}
                                            type="button"
                                            data-bs-target="#carouselExampleIndicators"
                                            data-bs-slide-to={game.detailedInfo.movies.slice(0, 2).length + index}
                                            aria-label={`Screenshot ${index + 1}`}
                                        ></button>
                                    ))}
                                </>
                            ) : (
                                <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                            )}
                        </div>
                        <div className="carousel-inner carousel-details-image-wrapper">
                            {game.detailedInfo ? (
                                <>
                                    {game.detailedInfo.movies.slice(0, 2).map((movie, index) => (
                                        <div
                                            key={`movie-${movie.id || index}`}
                                            className={`carousel-item ${index === 0 ? 'active' : ''}`}
                                        >
                                            <video controls className="d-block w-100 carousel-details-video">
                                                <source src={movie.mp4["max"].replace("http://", "https://")} type="video/mp4" />
                                            </video>
                                        </div>
                                    ))}
                                    {game.detailedInfo.screenshots.length > 0 ? (
                                        game.detailedInfo.screenshots.map((item, index) => (
                                            <div
                                                key={`screenshot-${item.id || index}`}
                                                className="carousel-item"
                                            >
                                                <img src={item.path_full} className="d-block w-100 carousel-details-image" alt={`Screenshot ${index + 1}`} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="carousel-item">
                                            <p>No screenshots available.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="carousel-item active d-flex m-auto">
                                    <div className="d-flex m-auto p-5 wrapper-loader-carousel-details">
                                        <div className="loader-carousel-details d-flex"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="carousel-control-prev carousel-wrapperdetails-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon carousel-icondetails-prev" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next carousel-wrapperdetails-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                            <span className="carousel-control-next-icon carousel-icondetails-next" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
                <div className='game-details-box m-auto d-flex flex-column'>
                    <div className='d-flex flex-row justify-content-around align-items-center'>
                        <div className=''>
                            <img className='image-details-header' src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/header.jpg`} />
                        </div>
                    </div>
                    <table className='table table-bordered table-border-background my-2 mx-auto'>
                        <thead className='table-head'>
                            <tr>
                                <th scope="col">Steam</th>
                                <th scope="col">G2A</th>
                            </tr>
                        </thead>
                        <tbody className='table-body'>
                            <tr>
                                <td>{game.steam_price} €</td>
                                <td>{game.g2a_price} €</td>
                            </tr>
                            <tr>
                                <td>
                                    <a className='btn btn-orange' href={`https://store.steampowered.com/app/${store.selectedGame.app_id}`} role="button" target="_blank">Visit store</a>
                                </td>
                                <td>
                                    <a className='btn btn-orange' href={`https://www.g2a.com/es/${store.selectedGame.g2a_url}`} role="button" target="_blank">Visit store</a>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2">Tags:
                                    <div className='tags d-flex flex-wrap gap-2 mb-2 justify-content-center'>
                                        {game.game_tags.map((tag, index) => (
                                            <button key={index} className="btn-all-green-tags"onClick={() => {navigate("/allgames"), actions.updateSearchParameters(1, [tag.tag_name], 0, 90, 0, 100, 2000, 2025)}}>{tag.tag_name}</button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    <div className={`d-flex justify-content-center align-items-center mx-auto border border-${getRatingColor(game.score)} border-4 rounded-circle fluid-ratio`}>
                                        {game.score}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {store.logedIn == true
                                ? store.favouriteGames.some((fav) => fav.favourite_game.app_id === game.app_id)
                                ? <button className="favourite-details-btn fa-solid fa-heart-crack" onClick={(e) => {
                                    e.stopPropagation(),
                                    deletefavouriteClick(game)}}>
                               </button>
                               : <button className="favourite-details-btn fa-regular fa-heart" onClick={(e) => {
                                     e.stopPropagation(),
                                    addfavouriteClick(game)}}>
                                </button>
                                : ""}
                </div>
            </div>
            <div className="detailed-information mb-4" dangerouslySetInnerHTML={{__html: game.detailedInfo ? game.detailedInfo.detailed_description : "loading",}}/>

        </div>
        </>
    );
};
//mapear videogames