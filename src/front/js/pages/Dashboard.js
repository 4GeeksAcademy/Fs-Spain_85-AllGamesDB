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
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Dashboard;






// import React, { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { Context } from "../store/appContext";

// const Dashboard = () => {
//     const { actions } = useContext(Context);
//     const navigate = useNavigate();
//     const [userData, setUserData] = useState(null);

//     // ejecuta cuando el componente se monta no olvidar
//     useEffect(() => {
//         const token = localStorage.getItem('token');

//         if (!token) {
//             navigate('/login');  // Si no hay token al login
//         } else {
//             setUserData({ email: "user@example.com", username: "Username" });
//         }
//     }, [navigate]);

//     // Función logout
//     const handleLogout = () => {
//         // Action de logout store
//         actions.logout();

//         // login después de cerrar sesión
//         navigate('/login');
//     };

//     return (
//         <div>
//             <h1>Welcome</h1>
//             {userData ? (
//                 <div>
//                     <button onClick={handleLogout} className="btn btn-danger">Logout</button>
//                 </div>
//             ) : (
//                 <p>Loading...</p>
//             )}
//         </div>
//     );
// };

// export default Dashboard;





