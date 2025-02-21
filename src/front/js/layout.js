import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";
import Navbar from "./component/navbar";
import { Footer } from "./component/footer";
import { Videogames } from "./pages/Videogames";
import { GameSearchList } from "./pages/gameSearchList";
import { GameDetails } from "./component/GameDetails";
import Login from "./component/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./component/PrivateRoute";
import Signup from "./pages/Signup";

const Layout = () => {
    const basename = process.env.BASENAME || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") return <BackendURL />;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>

                        <Route element={<Home />} path="/" />
                        <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" />
                        <Route element={<Videogames />} path="/videogames" />
                        <Route element={<GameDetails />} path="/game/:id" />
                        <Route element={<GameSearchList />} path="/allgames" />
                        <Route element={<Signup />} path="/signup" />
                        <Route element={<Login />} path="/login" />

                        {/* Ruta protegida */}
                        <Route element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } path="/dashboard" />
                        <Route element={<h1>Not found!</h1>} path="*" />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
