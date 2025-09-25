import React, { useState, useContext } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlobalErrorModal from '../GlobalErrorModal';
import { errorMessages } from '../../api/errorMessages';
import { errorContextRef } from '../../context/errorContextRef';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS가 임포트되었는지 확인하세요
import { loginMember } from '../../api/memberApi';

function LoginForm() {
  const [userid, setUserid] = useState('');
  const [userpw, setUserpw] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const showError = (code) => {
      const message = errorMessages[code];
      errorContextRef.set({ show: true, message });
    };

    if (!userid) {
      showError("VALIDATION_ID_REQUIRED");
      return;
    }

    if (!userpw) {
      showError("VALIDATION_PASSWORD_REQUIRED");
      return;
    }

    try {
      const { token, user } = await loginMember(userid, userpw);

      login(token, user);
      navigate("/main");
    } catch (err) {
      const code = err.response?.data?.code;
      if (code && errorMessages[code]) {
        errorContextRef.set({ show: true, message: errorMessages[code] });
      } else {
        errorContextRef.set({ show: true, message: "알 수 없는 오류가 발생했습니다." });
      }
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} md={5} lg={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="text-center mb-4">로그인</h3>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formUserid" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="아이디"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="비밀번호"
                    value={userpw}
                    onChange={(e) => setUserpw(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3">
                  로그인
                </Button>

                <div className="text-center">
                  <Link to="/find" className="text-decoration-none text-primary">
                    아이디 / 비밀번호 찾기
                  </Link>
                </div>

                <div className="text-center mt-2">
                  <span>처음이신가요? </span>
                  <Link to="/register" className="text-decoration-none text-primary">
                    회원가입
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <GlobalErrorModal />
    </Container>
  );
}

export default LoginForm;