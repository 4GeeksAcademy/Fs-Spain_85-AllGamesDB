import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../../styles/GameDetails.css';

export const GameDetails = () => {
    const { store, actions } = useContext(Context);
    const { id } = useParams();
    const [gameTags, setGameTags] = useState("");
    const [colorRatingCircle, setColorRatingCircle] = useState(null)

    const getRatingColor = (rating) => {
        if (rating >= 80) return "success"
        if (rating >= 60) return "warning"
        if (rating < 60) return "danger"
    }

    useEffect(() => {
        actions.fetchGameDetails(store.selectedGame["app_id"]);
        console.log(store.videogames);
        prepareTags()
    }, [id]);

    const game = store.selectedGame;

    if (!game) {
        return <div>Cargando...</div>;
    }

    function prepareTags() {
        let resultantTags = store.selectedGame.game_tags.map((tag) => {
            return " " + tag.tag_name
        })
        setGameTags(resultantTags.toString())
        return
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
        <div className='row w-100 mx-auto text-center justify-content-center game-details-container'>
                <div className="parallax-background">
                    <img src={`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/library_hero.jpg`} className="parallax-image"/>                   
                </div>
            <div className='mt-5 d-flex flex-column col-lg-5 col-11 mx-auto d-none d-lg-block '>
                <img src={game.image} alt={game.name} className='mb-2'/>
                {/* Details*/}
            </div>
            <div className='game-details-box mt-5 d-flex flex-column mx-auto'>
                <div className='d-flex flex-rowd-flex flex-row justify-content-around align-items-center'>
                    <h1>{game.name}</h1>
                    {store.logedIn == true 
                            ? store.favouriteGames.some((fav) => fav.favourite_game.app_id === game.app_id) 
                            ? <button className="favourite-btn fa-solid fa-heart-crack" onClick={(e) => {
                                e.stopPropagation(),
                                deletefavouriteClick(game)}}>
                           </button> 
                           : <button className="favourite-btn fa-regular fa-heart" onClick={(e) => {
                                 e.stopPropagation(),
                                addfavouriteClick(game)}}>
                            </button> 
                            : ""}
                </div>
                <table className='table table-bordered table-border-background mt-3'>
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
                                <div className='tags d-flex flex-wrap gap-2 mb-2'>{game.game_tags.map((tag, index) =>
                                    <button key={index} className="btn-all-green-tags">{tag.tag_name}</button>
                                 )}
                                </div>
                            </td>
                        </tr>
                    </tbody>

                </table>
                <div className={`d-flex justify-content-center align-items-center  mx-auto border border-${getRatingColor(game.score)} border-4 rounded-circle fluid-ratio`}>
                    {game.score} %
                </div>
            </div>
            <div className='mt-5 d-flex flex-column col-lg-5 col-11 mx-auto d-block d-lg-none'>
                <img src={game.image} alt={game.name} />
                <p>{game.shortDescription}</p>
            </div>
            <div className="detailed-information" dangerouslySetInnerHTML={{__html: game.detailedInfo ? game.detailedInfo.detailed_description : "loading",}}/>
        </div>
    );
};
//mapear videogames