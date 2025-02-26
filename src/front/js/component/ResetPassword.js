import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/ResetPassword.css"

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    // const email = searchParams.get('email');
    const [passwordInputType, setPasswordInputType] = useState("password")
    const [confirmPasswordInputType, setConfirmPasswordInputType] = useState("password")


    const handleReset = async (e) => {
        e.preventDefault();
        setPasswordInputType("password");
        setConfirmPasswordInputType("password");
        setPassword("");
        setConfirmPassword("");
        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match." });
            return;
        }
        try {
            const response = await resetPassword(password);
            return;
        } catch (error) {
            // console.log(error);
            return;
        }
    };


    const resetPassword = async (newPassword) => {
        const response = await fetch(`${process.env.BACKEND_URL}/api/reset-password/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: newPassword })
        });
        const data = await response.json();
        if (data["msg"]) setMessage({ type: "msg", text: data["msg"] });
        else if (data["error"]) setMessage({ type: "error", text: data["error"] })

        return data
    };

    useEffect(() => {
        if (message.type === "msg") {
            const messageTimer = setTimeout(() => {
                setMessage({ type: "", text: "" })
                navigate("/")
            }, 2000)
            return () => clearTimeout(messageTimer);
        }
        else {
            const messageTimer = setTimeout(() => {
                setMessage({ type: "", text: "" })
            }, 5000)
            return () => clearTimeout(messageTimer);
        }

    }, [message.text])

    const handleShowPassword = () => {
        if (passwordInputType === "password") setPasswordInputType("text");
        else setPasswordInputType("password")
    }

    const handleShowConfirmPassword = () => {
        if (confirmPasswordInputType === "password") setConfirmPasswordInputType("text");
        else setConfirmPasswordInputType("password")
    }

    return (
        <div className="mx-auto mt-5 col-lg-4 col-md-6 col-11">
            <h2 className="text-center">Restore Password</h2>
            {/* {email && <p>Email: {email}</p>} */}
            <form className="text-center" onSubmit={handleReset}>
                <div className="position-relative">

                    <label className="mt-2" htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type={`${passwordInputType}`}
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className={`fa-regular ${passwordInputType === "password"
                        ? "fa-eye-slash"
                        : "fa-eye"} 
                                                    eye-button-restore`}
                        type="button" onClick={handleShowPassword}></button>
                </div>
                <div className="position-relative">

                    <label className="mt-2" htmlFor="confirmPassword">Confirm password:</label>
                    <input
                        id="confirmPassword"
                        type={`${confirmPasswordInputType}`}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button className={`fa-regular ${confirmPasswordInputType === "password"
                        ? "fa-eye-slash"
                        : "fa-eye"} 
                                                    eye-button-restore`}
                        type="button" onClick={handleShowConfirmPassword}></button>
                </div>
                <div className={`alert mt-3 mb-0 ${message.type === '' ? 'd-none' : message.type === "error" ? "alert-danger" : 'alert-success'}`} role="alert">
                    {message.text}
                </div>
                <button className="btn btn-green mt-3" type="submit">Restore password</button>
            </form>
        </div>
    );
};

export default ResetPassword;