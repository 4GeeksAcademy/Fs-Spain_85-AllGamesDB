import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/styles/navbar.css"
import { Context } from '../store/appContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
    const [query, setQuery] = useState("")
    const { store, actions } = useContext(Context);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleGameClick = (game) => {
        if (store.selectedGame.app_id == game.app_id && location.pathname == `/game/${game.id}`) {
            setQuery("")
            return;
        }
        actions.setSpecificVideogameSteamId(game)
        navigate(`/game/${game.id}`);
        setQuery("")
        actions.resetVideogameSearchNameResult()
    };

    useEffect(() => {
        if (query === "") {
            actions.resetVideogameSearchNameResult()
            return
        }
        const debounceAPI = setTimeout(() => {
            const handleQuery = async () => {
                if (query.trim() !== "") {
                    await actions.queryGameName(query)
                }
            }
            handleQuery()
        }, 400)
        return () => clearTimeout(debounceAPI)
    }, [query])


    const handlefavouriteClick = (favourite) => {
        if (store.selectedGame.app_id == favourite.app_id && location.pathname == `/game/${favourite.id}`) return;
        actions.setSpecificVideogameSteamId(favourite);
        navigate(`/game/${favourite.id}`);
    }

    let liFavouriteGames = store.favouriteGames != null
        ? store.favouriteGames.map((favourite) => {
            // console.log(favourite.favourite_game);
            return <li key={favourite.favourite_game.id}>
                <a className="dropdown-item" onClick={() => handlefavouriteClick(favourite.favourite_game)}>
                    <img src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${favourite.favourite_game.app_id}/capsule_184x69.jpg`}
                        alt={favourite.favourite_game.name} className="game-image-search my-auto" />
                    <p className="game-name my-auto me-2">{favourite.favourite_game.name} </p>
                    <p className="price my-auto">{favourite.favourite_game.steam_price > favourite.favourite_game.g2a_price ? favourite.favourite_game.g2a_price : favourite.favourite_game.steam_price} €</p>
                </a>
            </li>
        })
        : <li className="d-flex justify-content-center">No favourites yet</li>

    useState(() => {
        if (store.logedIn) actions.fetchFavourites();

    }, [store.logedIn])

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="logo">All <span>Games DB</span></Link>
                <div className="justify-content-center">
                    <input type="text" className="search-bar m-auto" placeholder="Search games" data-bs-toggle="dropdown" aria-expanded={isDropdownOpen ? "true" : "false"} value={query} onBlur={() => setTimeout(toggleDropdown, 100)} onFocus={toggleDropdown} onChange={e => setQuery(e.target.value)} />
                    <ul className={`dropdown-menu dropdown-menu-end d-flex flex-column ${isDropdownOpen ? "show" : "visually-hidden"}`}>
                        {store.videogameSearchNameResult && store.videogameSearchNameResult.length > 0 ?
                            store.videogameSearchNameResult.map((game) => (
                                <li key={game.id}>
                                    <a className="dropdown-item d-flex flex-row" onClick={() => handleGameClick(game)}>
                                        <img src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/capsule_184x69.jpg`} alt={game.name} className="game-image-search my-auto" />
                                        <p className="game-name my-auto me-2">{game.name} </p>
                                        <p className="price my-auto">{game.steam_price > game.g2a_price ? game.g2a_price : game.steam_price} €</p>
                                    </a>
                                </li>
                            ))
                            :
                            ""
                        }
                    </ul>
                </div>
                <div className="nav-buttons d-flex flex-row">
                    {store.favouriteGames.length > 0
                        ? <div className="dropdown">
                            <button className="favourites dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                ⭐ Favoritos
                            </button>
                            <ul className="dropdown-menu">
                                {/* <li><a className="dropdown-item" href="#">Action</a></li> */}
                                {liFavouriteGames}
                            </ul> 
                        </div>
                        : ""}
                    <button className="logout">🔴 Logout</button>
                </div>
            </div>
        </nav>
    );
};


// import React from "react";
// import { Link } from "react-router-dom";

// export const Navbar = () => {
// 	return (
// 		<nav className="navbar navbar-light bg-light">
// 			<div className="container">
// 				<Link to="/">
// 					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
// 				</Link>
// 				<div className="ml-auto">
// 					<Link to="/demo">
// 						<button className="btn btn-primary">Check the Context in action</button>
// 					</Link>
// 				</div>
// 			</div>
// 		</nav>
// 	);
// };
