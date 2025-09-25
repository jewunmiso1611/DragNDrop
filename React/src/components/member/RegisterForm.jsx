import React, { useState, useEffect } from 'react';
import GlobalErrorModal from '../GlobalErrorModal';
import { errorContextRef } from '../../context/errorContextRef';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { checkUserId, registerMember } from '../../api/memberApi';

function RegisterForm() {
  const [form, setForm] = useState({
    userid: '',
    userpw: '',
    nickname: '',
    email: '',
    gender: ''
  });

  const [useridFormatError, setUseridFormatError] = useState('');
  const [isUseridValid, setIsUseridValid] = useState(false);

  const [checkMsg, setCheckMsg] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [pwMatchError, setPwMatchError] = useState('');
  const [isPwValid, setIsPwValid] = useState(false);
  const [createDefaultCard, setCreateDefaultCard] = useState(true);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'userid') {
      setCheckMsg('');
      setIsUseridValid(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      const { userid } = form;

      if (userid === '') {
        setUseridFormatError('');
        setCheckMsg('');
        setIsUseridValid(false);
        return;
      }

      const useridRegex = /^[a-zA-Z0-9]{6,15}$/;
      if (!useridRegex.test(userid)) {
        setUseridFormatError("아이디는 영문자+숫자 6~15자여야 합니다.");
        setCheckMsg('');
        setIsUseridValid(false);
        return;;
      }

      setUseridFormatError('');

      try {
        const res = await checkUserId(userid);
        if (res) {
          setCheckMsg("이미 사용 중인 아이디입니다.");
          setIsUseridValid(false);
        } else {
          setCheckMsg("사용 가능한 아이디입니다!");
          setIsUseridValid(true);
        }
      } catch (err) {
        setCheckMsg("서버 오류가 발생했습니다.");
        setIsUseridValid(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [form.userid]);

  useEffect(() => {
    const delay = setTimeout(() => {
      const { userpw } = form;

      if (userpw === '') {
        setPwMatchError('');
        setIsPwValid(false);
        return;
      }

      const pwRegex = /^[a-zA-Z0-9]{6,16}$/;
      if (!pwRegex.test(userpw)) {
        setPwMatchError("비밀번호는 영문자+숫자 6~16자여야 합니다.");
        setIsPwValid(false);
      } else {
        setPwMatchError('');
        setIsPwValid(true);
      }
    }, 100);

    return () => clearTimeout(delay);
  }, [form.userpw]);

  useEffect(() => {
    if (form.userpw && confirmPw && form.userpw !== confirmPw) {
      setPwMatchError("비밀번호가 일치하지 않습니다.");
    } else if (form.userpw && confirmPw && form.userpw === confirmPw && isPwValid) {
      setPwMatchError("비밀번호가 일치합니다!");
    } else if (!confirmPw) {
      setPwMatchError('');
    }
  }, [form.userpw, confirmPw, isPwValid]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const useridRegex = /^[a-zA-Z0-9]{6,15}$/;
    const pwRegex = /^[a-zA-Z0-9]{6,16}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!useridRegex.test(form.userid)) {
      errorContextRef.set({
        show: true,
        message: "아이디는 영문+숫자 조합의 6~15자여야 합니다.",
        type: "error"
      });
      return;
    }

    if (!isUseridValid) {
      errorContextRef.set({
        show: true,
        message: "아이디 중복 확인을 해주세요.",
        type: "error"
      });
      return;
    }

    if (!pwRegex.test(form.userpw)) {
      errorContextRef.set({
        show: true,
        message: "비밀번호는 영문자+숫자 6~16자여야 합니다.",
        type: "error"
      });
      return;
    }

    if (form.userpw !== confirmPw) {
      errorContextRef.set({
        show: true,
        message: "비밀번호가 일치하지 않습니다.",
        type: "error"
      });
      return;
    }

    if (!form.gender) {
      errorContextRef.set({
        show: true,
        message: "성별을 선택해주세요.",
        type: "error"
      });
      return;
    }

    if (!form.nickname.trim()) {
      errorContextRef.set({
        show: true,
        message: "닉네임을 입력해주세요.",
        type: "error"
      });
      return;
    }

    if (!emailRegex.test(form.email)) {
      errorContextRef.set({
        show: true,
        message: "이메일 양식이 맞지 않습니다.",
        type: "error"
      });
      return;
    }

    try {
      await registerMember({
        ...form,
        createDefaultCard,
      });
      errorContextRef.set({
        show: true,
        message: "회원가입이 완료되었습니다!",
        type: "success"
      });
      navigate("/login");
    } catch (err) {
      errorContextRef.set({
        show: true,
        message: err.response?.data?.message || "회원가입에 실패했습니다.",
        type: "error"
      });
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} md={5} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="text-center mb-4">회원가입</h3>
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group controlId="formUserid" className="mb-3">
                  <Form.Label>
                    <span className="text-danger">ID*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="userid"
                    placeholder="아이디 (영문자+숫자 6~15자)"
                    value={form.userid}
                    onChange={handleChange}
                    isInvalid={!!useridFormatError || (!isUseridValid && form.userid.length > 0)}
                    isValid={isUseridValid && !useridFormatError}
                    required
                  />
                  {useridFormatError && <Form.Text className="text-danger">{useridFormatError}</Form.Text>}
                  {!useridFormatError && checkMsg && (
                    <Form.Text className={isUseridValid ? "text-success" : "text-danger"}>
                      {checkMsg}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group controlId="formNickname" className="mb-3">
                  <Form.Control
                    type="text"
                    name="nickname"
                    placeholder="닉네임"
                    value={form.nickname}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formUserpw" className="mb-3">
                  <Form.Label>
                    <span className="text-danger">PW*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="userpw"
                    placeholder="비밀번호 (영문자+숫자 6~16자)"
                    value={form.userpw}
                    onChange={handleChange}
                    isInvalid={!isPwValid && form.userpw.length > 0}
                    isValid={isPwValid}
                    required
                  />
                  {form.userpw && (
                    <Form.Text className={isPwValid ? "text-success" : "text-danger"}>
                      {isPwValid ? "사용 가능한 비밀번호입니다!" : "비밀번호는 영문자+숫자 6~16자여야 합니다."}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group controlId="formConfirmPw" className="mb-3">
                  <Form.Control
                    type="password"
                    name="confirmPw"
                    placeholder="비밀번호 확인"
                    value={confirmPw}
                    onChange={(e) => {
                      setConfirmPw(e.target.value);
                    }}
                    isInvalid={form.userpw && confirmPw && form.userpw !== confirmPw}
                    isValid={form.userpw && confirmPw && form.userpw === confirmPw && isPwValid}
                    required
                  />
                  {form.userpw && confirmPw && form.userpw !== confirmPw && (
                    <Form.Text className="text-danger">비밀번호가 일치하지 않습니다.</Form.Text>
                  )}
                  {form.userpw && confirmPw && form.userpw === confirmPw && isPwValid && (
                    <Form.Text className="text-success">비밀번호가 일치합니다!</Form.Text>
                  )}
                </Form.Group>

                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>
                    <span className="text-danger">E-mail*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="이메일"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group as={Row} className="mb-3 align-items-center">
                  <Col xs={6}>
                    <Form.Check
                      type="checkbox"
                      label="기본 카드 생성"
                      checked={createDefaultCard}
                      onChange={(e) => setCreateDefaultCard(e.target.checked)}
                      id="formCreateDefaultCard"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                      id="formGender"
                    >
                      <option value="" disabled>성별 선택</option>
                      <option value="M">남자</option>
                      <option value="F">여자</option>
                    </Form.Select>
                  </Col>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3">
                  가입하기
                </Button>

                <div className="text-center mt-3">
                  <Link to="/login" className="text-decoration-none text-primary">
                    뒤로가기
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

export default RegisterForm;