import React, { useContext, useState } from "react";
import emailjs from "@emailjs/browser";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState({type: "", text: ""});

    const sendEmail = async (e) => {
        e.preventDefault();
        try {
            const { msg, error, reset_link } = await sendResetEmail(email);
            console.log(reset_link);
            
            if (error) throw new Error(error);
            const templateParams = {
                to_email: email,
                reset_link: reset_link,
            };
            const result = await emailjs.send(
                "service_amh0gr9",
                "reset_password_template",
                templateParams,
                "Im9eQP_idqJxWGipT"
            );
            // setMessage(msg);
            console.log("Email enviado", result);
            if (error) setMessage({type: "msg", text: error});
            else setMessage({type: "msg", text: "Email sent, check your inbox."});
            // setMessage("Email sent, check your inbox.");
        } catch (error) {
            console.error("Error:", error);
            setMessage({type: "error",text: error.message});
        }
    };

    async function sendResetEmail(email) {
        console.log(email);
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email }),
                
            });
            // const data = await response.json();
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            // const resetLink = resetLink
            return { msg: data.message, reset_link: data.reset_link };
        } catch (error) {
            return { error: error.message };
        }
    }

    return (
        <div className="mx-auto mt-5 col-lg-4 col-md-6 col-11">
            <h2 className="text-center">Password recovery</h2>
            <form className="text-center" onSubmit={sendEmail}>
                <label className="mt-2" htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className={`alert mt-3 mb-0 ${message.type === '' ? 'd-none' : message.type === "error" ? "alert-danger" : 'alert-success'}`} role="alert">
                    {message.text}
                </div>
                <button className="btn btn-green mt-3" type="submit">Send</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
