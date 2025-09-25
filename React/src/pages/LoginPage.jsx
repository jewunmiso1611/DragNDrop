// src/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../components/member/LoginForm';


const LoginPage = () => {
    return (
        <div className="login-page">
            <div className="login-container">
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;

