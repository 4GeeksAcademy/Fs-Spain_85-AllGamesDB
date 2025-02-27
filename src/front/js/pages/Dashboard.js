import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { Favorites } from "../component/Favorites";

const Dashboard = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    // const [userData, setUserData] = useState(null);

    useEffect(() => {
        const tokenVerify = async () => {
            const result = await actions.tokenVerify();
            if (!result && store.logedIn) {
                navigate("/");
                alert("Your session has expired, please, log in again.");
                actions.logout();
            } 
            else if (!result){
                navigate("/");
                actions.logout();
            }
            return
        }
        tokenVerify();
    }, [navigate, actions]);

    const handleChangePassword = () => {
        navigate("/changepassword");
    };

    return (
        <div>
            {/* {userData ? ( */}
                <div >
                    <h2></h2>
                    <Favorites /> {/* componente */}
                    <div className="position-relative d-flex">
                    <button onClick={handleChangePassword} className="btn btn-orange mx-auto">
                        Change Password
                    </button>
                    </div>
                </div>
            {/* ) : (
                <p>Loading...</p>
            )} */}
        </div>
    );
};

export default Dashboard;