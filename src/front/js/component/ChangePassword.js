import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const ChangePassword = () => {
    const { actions } = useContext(Context);
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Las nuevas contraseñas no coinciden.");
            return;
        }

        const result = await actions.changePassword(oldPassword, newPassword);

        if (result && result.success) {
            setMessage(result.message);
            setTimeout(() => navigate("/dashboard"), 2000);
        } else {
            setMessage(result?.message || "Error al actualizar la contraseña. Verifica tu contraseña actual.");
        }
    };


    return (
        <div className="change-password-container">
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
                <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" className="btn btn-primary">Change password</button>
            </form>
            {message && <p>{message}</p>}
            <button onClick={() => navigate("/dashboard")} className="btn btn-link">Go back home</button>
        </div>
    );
};

export default ChangePassword;