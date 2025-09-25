// src/pages/ResetPwPage.jsx
import React from 'react';
import ResetPwForm from '../components/member/ResetPwForm';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const ResetPwPage = () => {

    const navigate = useNavigate();

    return (
        <div className="login-page">
            <div className="login-container">
                <ResetPwForm onResetSuccess={() => navigate('/login')} />
                <div className="link-row">
                    <Link to="/login" className="link-button">
                        뒤로가기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPwPage;
