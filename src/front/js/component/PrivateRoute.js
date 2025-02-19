import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../store/appContext";

const PrivateRoute = ({ children }) => {
    const { store } = useContext(Context);
    return store.token ? children : <Navigate to="/login" />;
};

const TokenVerify = () => {
    const token = localStorage.getItem("token"); // Verifica si hay un token
    return token ? <Outlet /> : <Navigate to="/login" />;
};
export {PrivateRoute, TokenVerify};