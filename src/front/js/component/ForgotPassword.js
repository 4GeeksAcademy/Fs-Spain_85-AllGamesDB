import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const sendEmail = async (e) => {
        e.preventDefault();


        const resetLink = `http://localhost:3000/reset-password/${btoa(email)}`;

        const templateParams = {
            to_email: email,
            reset_link: resetLink,
        };

        try {
           
            await emailjs.send(
                "service_cub3vba",           
                "template_755ljdv",           
                templateParams,              
                "SrpIWnaOeRVEhYcdN"          
            );

            
            setMessage("Email send, check your inbox.");
        } catch (error) {
            setMessage("Error sending email.");
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h2>Password recovery</h2>
            <form onSubmit={sendEmail}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPassword;
