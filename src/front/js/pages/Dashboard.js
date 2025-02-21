import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { Favorites } from "../component/Favorites";

const Dashboard = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        } else {
            setUserData({ email: "user@example.com", username: "Username" });
            actions.fetchFavourites();
        }
    }, [navigate, actions]);

    const handleLogout = () => {
        actions.logout();
        navigate("/");// modificado para redirigir a home
    };

    const handleChangePassword = () => {

        navigate("/changepassword");
    };

    return (
        <div>
            <h1>Welcome</h1>
            {userData ? (
                <div>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                    <h2></h2>
                    <Favorites /> {/* componente */}
                    <button onClick={handleChangePassword} className="btn btn-danger">
                        Change Password
                    </button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Dashboard;



