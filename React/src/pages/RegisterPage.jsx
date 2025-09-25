// src/pages/RegisterPage.jsx

import RegisterForm from '../components/member/RegisterForm';
import { useNavigate } from 'react-router-dom';


const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="register-page-container">
      <RegisterForm onRegisterSuccess={() => navigate('/login')} />
    </div>
  );
};

export default RegisterPage;
