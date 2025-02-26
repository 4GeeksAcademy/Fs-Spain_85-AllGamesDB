import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const { actions } = useContext(Context);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState(""); // Estado para manejar errores

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Limpiar errores previos

        const success = await actions.login(email, password);
        if (success) {
            navigate("/dashboard");
        } else {
            setError("Error en las credenciales"); // Mostrar error
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required 
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required 
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>} {/* Mostrar mensaje de error */}
            <Link to="/forgot-password">
                ¿Forgot your password?
            </Link>
        </div>
    );
};

export default Login;


// import React, { useState, useContext } from "react";
// import { Context } from "../store/appContext";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//     const { store, actions } = useContext(Context);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const success = await actions.login(email, password);
//         if (success) navigate("/dashboard");
//         else alert("Error credencials");
//     };

//     return (
//         <div>
//             <h2>Login</h2>
//             <form onSubmit={handleSubmit}>
//                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
//                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
//                 <button type="submit">Login</button>
//             </form>
//         </div>
//     );
// };

// export default Login;
