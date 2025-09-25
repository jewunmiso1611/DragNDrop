import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuthButtonClick = () => {
    if (user) {
      logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  const goToMain = () => navigate("/main");
  const goToMypage = () => navigate("/mypage");

  return (
    <nav className="navbar navbar-expand-lg bg-white sticky-top shadow">
      <div className="container-fluid">
        <span
          className="navbar-brand text-dark fw-bold fs-4"
          onClick={goToMain}
          style={{ cursor: "pointer" }}
        >
          ⭐ TodoApp
        </span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {user && (
              <>
                <li className="nav-item me-3">
                  <span className="navbar-text text-secondary fw-medium">
                    안녕하세요, {user.nickname} 님
                  </span>
                </li>

                <li className="nav-item me-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={goToMypage}>
                    마이페이지
                  </button>
                </li>
              </>
            )}

            <li className="nav-item">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAuthButtonClick}
              >
                {user ? "로그아웃" : "로그인"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
