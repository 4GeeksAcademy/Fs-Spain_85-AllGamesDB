import React, { useState, useContext, useEffect, act } from "react";
import { Link } from "react-router-dom";
import "../../styles/styles/navbar.css";
import { Context } from '../store/appContext';
import { useNavigate, useLocation } from 'react-router-dom';
import "/workspaces/Fs-Spain_85-AllGamesDB/src/front/img/allgames_transparent.png"


export const Navbar = () => {
    const [query, setQuery] = useState("");
    const { store, actions } = useContext(Context);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: ""
    });
    const [isFavouritesOpen, setIsFavouritesOpen] = useState(false)
    const [favouriteOverflowClass, setFavouriteOverflowClass] = useState("")
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const navigate = useNavigate();
    const location = useLocation();
    // hook para el mensaje del signup
    const [signupMessage, setSignupMessage] = useState({ type: "", text: "" });
    // hook para el mensaje del login
    const [loginMessage, setLoginMessage] = useState({ type: "", text: "" })
    // hook para el manejo de enseñar o no contraseña
    const [signupInputType, setSignupInputType] = useState("password");

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Manejo de todo lo relacionado con signup y login
    const toggleSignup = () => {
        setIsSignupOpen(!isSignupOpen);
        setIsLoginOpen(false);
    };

    const toggleLogin = () => {
        setIsLoginOpen(!isLoginOpen);
        setIsSignupOpen(false);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        const result = await actions.signup(formData.email, formData.password);
        if (result.error === "the email is not valid") {
            setSignupMessage({ type: "error", text: "Invalid email!" })
        }
        else if (result.error === "password isn't valid") {
            setSignupMessage({ type: "error", text: "Password must have: a letter, a capital letter and be, at least 8 characters long." })
        }
        else if (result.msg === "El usuario ya existe") {
            setSignupMessage({ type: "error", text: "User already exists!" })
        }
        else if (result === 201) {
            setSignupMessage({ type: "msg", text: "User created! Login in..." })
        }
        else setSignupMessage({ type: "error", text: "An error ocurred" })

    };

    useEffect(() => {
        if (signupMessage.type == "msg") {
            const signupToLoginTimer = setTimeout(async () => {
                const login = await actions.login(formData.email, formData.password);
                if (login) actions.setLogedInTrue()
                else alert("something unespected ocurred when trying to automaticly log you in, please log in manually.");
                setFormData({
                    email: "",
                    username: "",
                    password: ""
                })
                setSignupMessage({ type: "", text: "" });
                setIsSignupOpen(false);
            }, 2000);
            return () => clearTimeout(signupToLoginTimer);
        }
        else {
            const signupToLoginTimer = setTimeout(() => {
                setSignupMessage({ type: "", text: "" })
            }, 5000);
            return () => clearTimeout(signupToLoginTimer)
        }
    }, [signupMessage.text])

    const handleloginSubmit = async (e) => {
        e.preventDefault();
        const result = await actions.login(formData.email, formData.password);
        // if (result) navigate("/dashboard");
        if (result.error === "Email and password are required") {
            setLoginMessage({ type: "error", text: result.error });
        }
        else if (result.error === "Wrong credentials") {
            setLoginMessage({ type: "error", text: result.error });
        }
        else if (result === 200) {
            setLoginMessage({ type: "msg", text: "Successfull login!" });
            setIsLoginOpen(true);
        }
        else setLoginMessage({ type: "error", text: "An error ocurred" });
    };

    useEffect(() => {
        if (loginMessage.type === "msg") {
            const loginTimer = setTimeout(async () => {
                actions.setLogedInTrue();
                setFormData({
                    email: "",
                    username: "",
                    password: ""
                });
                setLoginMessage({ type: "", text: "" });
                setIsLoginOpen(false);
            }, 500);
            return () => clearTimeout(loginTimer);
        }
        else {
            const loginTimer = setTimeout(() => {
                setLoginMessage({ type: "", text: "" });
            }, 5000)
            return () => clearTimeout(loginTimer)
        }
    }, [loginMessage.text])

    // manejo del logout
    const handleLogout = () => {
        actions.logout(),
            navigate("/")
    }

    // manejo de clic en listado de barra de búsqueda
    const handleGameClick = (game) => {
        if (store.selectedGame.app_id == game.app_id && location.pathname == `/game/${game.id}`) {
            setQuery("")
            return;
        }
        actions.setSpecificVideogameSteamId(game);
        navigate(`/game/${game.id}`);
        setQuery("");
        actions.resetVideogameSearchNameResult();
    };

    useEffect(() => {
        if (query === "") {
            actions.resetVideogameSearchNameResult();
            return;
        }
        const debounceAPI = setTimeout(() => {
            const handleQuery = async () => {
                if (query.trim() !== "") {
                    await actions.queryGameName(query);
                }
            };
            handleQuery();
        }, 400);
        return () => clearTimeout(debounceAPI);
    }, [query]);

    // manejo de favoritos
    const handlefavouriteClick = (favourite) => {
        if (store.selectedGame.app_id == favourite.app_id && location.pathname == `/game/${favourite.id}`) return;
        actions.setSpecificVideogameSteamId(favourite);
        navigate(`/game/${favourite.id}`);
    }

    const deletefavouriteClick = async (game) => {
        actions.deleteLocalFavourite(game.favourite_game)
        actions.deleteFavourite(game.favourite_game.id);
        return
    }

    let liFavouriteGames = store.favouriteGames.map((favourite) => {
        // console.log(favourite.favourite_game);
        return <li key={favourite.favourite_game.id}>
            <a className="dropdown-item" onClick={() => handlefavouriteClick(favourite.favourite_game)}>
                <img data-bs-dismiss="offcanvas" aria-label="Close" src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${favourite.favourite_game.app_id}/capsule_184x69.jpg`}
                    alt={favourite.favourite_game.name} className="game-image-search my-auto" />
                <p data-bs-dismiss="offcanvas" aria-label="Close" className="game-name my-auto me-2">{favourite.favourite_game.name} </p>
                <p data-bs-dismiss="offcanvas" aria-label="Close" className="price mb-0">{favourite.favourite_game.steam_price > favourite.favourite_game.g2a_price ? favourite.favourite_game.g2a_price : favourite.favourite_game.steam_price} €</p>
                <button type="button" className="favourite-btn ps-2 pe-0 fs-5 fa-solid fa-heart-crack" onClick={(e) => {
                    e.stopPropagation(),
                        e.preventDefault(),
                        deletefavouriteClick(favourite)
                }}>
                </button>
            </a>
        </li>
    })

    // useEffect para el manejo del cierre del dropdown de favoritos al clicar fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.parentElement == null) return;
            if (isFavouritesOpen
                && e.target.className !== "favourite-btn ps-2 pe-0 fs-5 fa-solid fa-heart-crack"
                // && e.target.parentElement.className !== "dropdown-item" 
            ) {
                setIsFavouritesOpen(false);
                return
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isFavouritesOpen]);

    // usse effect para llamar a los favoritos del usuario en backend cuando se loga
    useEffect(() => {
        if (store.logedIn) actions.fetchFavourites();
    }, [store.logedIn])

    // useeffect apra manejar la existencia de overflow el dropdown de favoritos
    useEffect(() => {
        if (store.favouriteGames.length < 6) setFavouriteOverflowClass("dropdown-menu-end-no-overflow");
        else setFavouriteOverflowClass("dropdown-menu-end")
    }, [store.favouriteGames])

    // useeffect para evitar que puedan acceder a la vista /dashboard si no se está logado
    useEffect(() => {
        if (!store.logedIn && location.pathname == "/dashboard") navigate("/");
    }, [location.pathname])

    const handleShowPassword = () => {
        if (signupInputType === "password") setSignupInputType("text");
        else setSignupInputType("password")
    }

    useEffect(() => {
        const handleClickOutside = () => {
            if (isProfileOpen) setIsProfileOpen(false)
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    })

    return (
        <nav className="navbar fixed-top">
            <div className="container pe-0">
                <div className="d-flex justify-content-center text-center ">
                    <img src="/allgames_transparent.png" className="img-logo" />
                    <Link to="/" className="logo my-auto">AllGamesDB</Link>
                </div>
                {/* botón habilitador del offcanvas */}
                <button className="navbar-toggler d-lg-none fa-solid fa-bars text-grey"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasDarkNavbar"
                    aria-controls="offcanvasDarkNavbar"
                    aria-label="Toggle navigation">
                </button>
                {/* inicio del tab del offcanvas */}
                <div className="offcanvas offcanvas-end offcanvas-bg" tabIndex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
                    {/* inicio de los botones del offcanvas */}
                    <button className="custom-close-button fa-solid fa-xmark" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    <div className={`nav-right d-lg-none mt-5 mb-4 justify-content-around `}>
                        {store.logedIn == false ?
                            // para cuando no se está logado
                            <div className="nav-buttons">
                                {/* inicio botón signup */}
                                <div className="dropdown">
                                    <button className="btn btn-orange" onClick={toggleSignup}>Signup</button>
                                    {isSignupOpen && (
                                        <div className="modal-backdrop" onClick={toggleSignup}></div>
                                    )}
                                    {isSignupOpen && (
                                        <div className="dropdown-menu show signup-dropdown menu-modal">
                                            <form onSubmit={handleSignupSubmit} className="signup-form">
                                                <div className="form-group">
                                                    <label htmlFor="email">Email:</label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your email"
                                                        required
                                                    />
                                                </div>

                                                <div className="form-group position-relative">
                                                    <label htmlFor="password">Password:</label>
                                                    <input
                                                        type={`${signupInputType}`}
                                                        id="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your password"
                                                        required
                                                    />
                                                    <button className={`fa-regular ${signupInputType === "password"
                                                        ? "fa-eye-slash"
                                                        : "fa-eye"} 
                                                    eye-button`}
                                                        type="button" onClick={handleShowPassword}></button>
                                                </div>
                                                {/* manejo de mensaje al hacer el signup */}
                                                <div className={`alert ${signupMessage.type === ""
                                                    ? ""
                                                    : signupMessage.type === "error"
                                                        ? "alert-danger"
                                                        : "alert-success"}
                                                p-2 m-0`} role="alert">
                                                    {signupMessage.text}
                                                </div>
                                                <button type="submit" className="btn btn-submit-signup">Register</button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                                {/* fin botón signup */}
                                {/* inicio botón login */}
                                <div className="dropdown">
                                    <button className="btn btn-green" onClick={toggleLogin}>Login</button>
                                    {isLoginOpen && (
                                        <div className="modal-backdrop" onClick={toggleLogin}></div>
                                    )}
                                    {isLoginOpen && (
                                        <div className="dropdown-menu menu-modal show login-dropdown">
                                            <form onSubmit={handleloginSubmit} className="login-form">
                                                <div className="form-group">
                                                    <label htmlFor="login-email">Email:</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        id="login-email"
                                                        placeholder="Enter your email"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="login-password">Password:</label>
                                                    <input
                                                        type="password"
                                                        id="login-password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your password"
                                                        required
                                                    />
                                                </div>
                                                <div className={`alert ${loginMessage.type === ""
                                                    ? ""
                                                    : loginMessage.type === "error"
                                                        ? "alert-danger"
                                                        : "alert-success"}
                                                p-2 m-0`} role="alert">
                                                    {loginMessage.text}
                                                </div>
                                                <button type="submit" className="btn btn-submit">Login</button>
                                                <Link to="forgot-password" 
                                                className="forgot-password-link" 
                                                onClick={() => setIsLoginOpen(false)} 
                                                data-bs-dismiss="offcanvas" aria-label="Close"
                                                >Forgot your password?</Link>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                            // para cuando se está logado
                            : <div className="nav-buttons d-flex flex-row">
                                {store.favouriteGames.length > 0
                                    ? <div className="dropdown position-relative">
                                        <button className="btn btn-green dropdown-toggle"
                                            type="button"
                                            onClick={() => setIsFavouritesOpen(!isFavouritesOpen)}
                                            aria-expanded={isFavouritesOpen}
                                            data-bs-boundary="viewport">
                                            Favoritos
                                        </button>
                                        <ul className={`dropdown-menu ${favouriteOverflowClass} ${isFavouritesOpen ? "show" : ""} `}>
                                            {liFavouriteGames}
                                        </ul>
                                    </div>
                                    : <button className="btn btn-green dropdown-toggle invisible" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Favoritos
                                    </button>}
                                <div className="dropdown">
                                    <button className="btn btn-green dropdown-toggle"
                                        type="button"
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        aria-expanded={isProfileOpen}>
                                        Profile
                                    </button>
                                    <ul className={`dropdown-menu dropdown-menu-end-small ${isProfileOpen ? "show" : ""}`}>
                                        <li className="grey-hover justify-content-center"
                                            data-bs-dismiss="offcanvas" aria-label="Close"
                                            onClick={(e) => { e.preventDefault(), navigate("/dashboard") }}
                                        >dashboard</li>
                                        <li className="grey-hover justify-content-center border-0"
                                            data-bs-dismiss="offcanvas" aria-label="Close"
                                            onClick={() => { setIsProfileOpen(false), handleLogout() }}
                                        >Logout</li>

                                    </ul>
                                </div>

                            </div>
                        }
                    </div>

                    <div className={`search-container my-1 w-75 mx-auto `}>
                        <input
                            type="text"
                            className="search-bar mt-0"
                            placeholder="Search games"
                            data-bs-toggle="dropdown"
                            aria-expanded={isDropdownOpen ? "true" : "false"}
                            value={query}
                            onBlur={() => setTimeout(toggleDropdown, 100)}
                            onFocus={toggleDropdown}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <ul data-bs-dismiss="offcanvas" aria-label="Close" className={`dropdown-menu w-100 ${isDropdownOpen ? "show" : "visually-hidden"}`}>
                            {store.videogameSearchNameResult && store.videogameSearchNameResult.length > 0 ?
                                store.videogameSearchNameResult.map((game) => (
                                    <li key={game.id}>
                                        <a className="dropdown-item" onClick={() => handleGameClick(game)}>
                                            <img src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/capsule_184x69.jpg`} alt={game.name} className="game-image-search" />
                                            <p className="game-name">{game.name} </p>
                                            <p className="price mb-0">{game.steam_price > game.g2a_price ? game.g2a_price : game.steam_price} €</p>
                                        </a>
                                    </li>
                                ))
                                : ""}
                        </ul>
                    </div>

                </div>

                <div className="search-container my-1 d-lg-block d-none">
                    <input
                        type="text"
                        className="search-bar mt-0"
                        placeholder="Search games"
                        data-bs-toggle="dropdown"
                        aria-expanded={isDropdownOpen ? "true" : "false"}
                        value={query}
                        onBlur={() => setTimeout(toggleDropdown, 100)}
                        onFocus={toggleDropdown}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <ul className={`dropdown-menu w-100 ${isDropdownOpen ? "show" : "visually-hidden"}`}>
                        {store.videogameSearchNameResult && store.videogameSearchNameResult.length > 0 ?
                            store.videogameSearchNameResult.map((game) => (
                                <li key={game.id}>
                                    <a className="dropdown-item" onClick={() => handleGameClick(game)}>
                                        <img src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/capsule_184x69.jpg`} alt={game.name} className="game-image-search" />
                                        <p className="game-name">{game.name} </p>
                                        <p className="price mb-0">{game.steam_price > game.g2a_price ? game.g2a_price : game.steam_price} €</p>
                                    </a>
                                </li>
                            ))
                            : ""}
                    </ul>
                </div>
                {/* fin de searchbar */}
                {/* botones de signup, login, favourites y logout */}
                <div className="nav-right d-lg-block d-none">
                    {store.logedIn == false ?
                        // para cuando no se está logado
                        <div className="nav-buttons">
                            {/* inicio botón signup */}
                            <div className="dropdown">
                                <button className="btn btn-orange" onClick={toggleSignup}>Signup</button>
                                {isSignupOpen && (
                                    <div className="modal-backdrop" onClick={toggleSignup}></div>
                                )}
                                {isSignupOpen && (
                                    <div className="dropdown-menu show signup-dropdown menu-modal">
                                        <form onSubmit={handleSignupSubmit} className="signup-form">
                                            <div className="form-group">
                                                <label htmlFor="email">Email:</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group position-relative">
                                                <label htmlFor="password">Password:</label>
                                                <input
                                                    type={`${signupInputType}`}
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    required
                                                />
                                                <button className={`fa-regular ${signupInputType === "password"
                                                    ? "fa-eye-slash"
                                                    : "fa-eye"} 
                                                    eye-button`}
                                                    type="button" onClick={handleShowPassword}></button>
                                            </div>

                                            <div className={`alert ${signupMessage.type === ""
                                                ? ""
                                                : signupMessage.type === "error"
                                                    ? "alert-danger"
                                                    : "alert-success"}
                                                p-2 m-0`} role="alert">
                                                {signupMessage.text}
                                            </div>
                                            <button type="submit" className="btn btn-submit-signup">Register</button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            <div className="dropdown">
                                <button className="btn btn-green" onClick={toggleLogin}>Login</button>
                                {isLoginOpen && (
                                    <div className="modal-backdrop" onClick={toggleLogin}></div>
                                )}
                                {isLoginOpen && (
                                    <div className="dropdown-menu menu-modal show login-dropdown">
                                        <form onSubmit={handleloginSubmit} className="login-form">
                                            <div className="form-group">
                                                <label htmlFor="login-email">Email:</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    id="login-email"
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="login-password">Password:</label>
                                                <input
                                                    type="password"
                                                    id="login-password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    required
                                                />
                                            </div>
                                            <div className={`alert ${loginMessage.type === ""
                                                ? ""
                                                : loginMessage.type === "error"
                                                    ? "alert-danger"
                                                    : "alert-success"}
                                                p-2 m-0`} role="alert">
                                                {loginMessage.text}
                                            </div>
                                            <button type="submit" className="btn btn-submit">Login</button>
                                            <Link to="forgot-password" 
                                            className="forgot-password-link" 
                                            onClick={() => setIsLoginOpen(false)} 
                                            >Forgot your password?</Link>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>

                        : <div className="nav-buttons d-flex flex-row">
                            {store.favouriteGames.length > 0
                                ? <div className="dropdown position-relative">
                                    <button className="btn btn-green dropdown-toggle"
                                        type="button"
                                        onClick={() => setIsFavouritesOpen(!isFavouritesOpen)}
                                        aria-expanded={isFavouritesOpen}
                                        data-bs-boundary="viewport">
                                        Favoritos
                                    </button>
                                    <ul data-bs-boundary="viewport" className={`dropdown-menu ${favouriteOverflowClass} ${isFavouritesOpen ? "show" : ""} `}>
                                        {liFavouriteGames}
                                    </ul>
                                </div>
                                : <button className="btn btn-green dropdown-toggle invisible" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Favoritos
                                </button>}
                            <div className="dropdown">
                                <button className="btn btn-green dropdown-toggle"
                                    type="button"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    aria-expanded={isProfileOpen}>
                                    Profile
                                </button>
                                <ul className={`dropdown-menu dropdown-menu-end-small ${isProfileOpen ? "show" : ""}`}>
                                    <li className="grey-hover justify-content-center" onClick={(e) => { e.preventDefault(), navigate("/dashboard") }}>dashboard</li>
                                    <li className="grey-hover justify-content-center border-0"
                                        onClick={() => { setIsProfileOpen(false), handleLogout() }}
                                    >Logout</li>
                                </ul>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </nav>
    );
};

export default Navbar;