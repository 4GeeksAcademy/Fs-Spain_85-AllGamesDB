import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RequestEmailReset = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
       
            setMessage({ type: 'success', text: 'Correo de restablecimiento enviado.' });
           
            setTimeout(() => {
                navigate(`/resetpassword?email=${email}`);
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al enviar el correo.' });
        }
    };

    return (
        <div className="request-email-container">
            <h2>Restablecer Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                </div>
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} role="alert">
                    {message.text}
                </div>
                <button type="submit" className="btn btn-primary">Enviar Correo</button>
            </form>
        </div>
    );
};