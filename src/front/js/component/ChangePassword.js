import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const ChangePassword = () => {
    const { actions } = useContext(Context);
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords don't match" });
            return;
        }
        const result = await actions.changePassword(oldPassword, newPassword);
        if (result.error) setMessage({ type: "error", text: result.error });
        else if (result.msg) setMessage({ type: "msg", text: result.msg });
        else setMessage({ type: "error", text: "something unexpected happened, please, try refreshing" })
    };

    useEffect(() => {
        if (message.type === "msg") {
            const handleTimer = setTimeout(() => {
                setMessage({ type: "", text: "" });
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                navigate("/dashboard");
            }, 2000)
            return () => clearTimeout(handleTimer);
        }
        else {
            const handleTimer = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 5000)
            return () => clearTimeout(handleTimer);
        }

    }, [message.text])


    return (
        <div className="mx-auto mt-5 col-lg-4 col-md-6 col-11 change-password-container">
            <h2 className="text-center">Change Password</h2>
            <form className="text-center" onSubmit={handleChangePassword}>
                <label className="mt-2" htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                />
                <label className="mt-2" htmlFor="newPassword">New password:</label>
                <input
                    id="newPassword"
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <label className="mt-2" htmlFor="confirmPassword">Confirm new password:</label>
                <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <div className={`alert mt-3 ${message.type === "" ? "d-none" : message.type === "error" ? "alert-danger" : "alert-success"}`} role="alert">
                    {message.text}
                </div>
                <div className="d-flex justify-content-around mt-3">
                    <button onClick={() => navigate("/dashboard")} className="btn btn-link">Go back home</button>
                    <button type="submit" className="btn btn-green">Change password</button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;