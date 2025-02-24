import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('email');

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
        try {
      
            const response = await resetPassword(token, password);
            setMessage("Password reset successfully.");
         
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setMessage("Failed to reset password. Please try again.");
            console.error("Reset password error:", error);
        }
    };

    const resetPassword = async (token, password) => {

        const response = await fetch(`/api/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })
        if (!response.ok) {
            throw new Error('Failed to reset password');
        }
        return response.json();
    }

    useEffect(() => {
        console.log("Token recibido:", token);
    }, [token]);

    return (
        <div>
            <h2>Restore Password</h2>
            {email && <p>Email: {email}</p>}
            <p>New password</p>
            <form onSubmit={handleReset}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Restore</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;