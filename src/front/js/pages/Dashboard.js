import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const Dashboard = () => {
    const { actions } = useContext(Context);
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    // ejecuta cuando el componente se monta no olvidar
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');  // Si no hay token al login
        } else {
            setUserData({ email: "user@example.com", username: "Username" });
        }
    }, [navigate]);

    // Función logout
    const handleLogout = () => {
        // Action de logout store
        actions.logout();

        // login después de cerrar sesión
        navigate('/login');
    };

    return (
        <div>
            <h1>Welcome</h1>
            {userData ? (
                <div>
                    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Dashboard;









// import React, { useContext } from "react";
// import { Context } from "../store/appContext";

// const Dashboard = () => {
//     const { store, actions } = useContext(Context);

//     return (
//         <div>
//             <h2>Welcome, {store.user ? store.user.name : "Usuario"}</h2>
//             <button className="btn btn-danger" onClick={actions.logout}>Close Sesion</button>
//         </div>
//     );
// };

// export default Dashboard;
