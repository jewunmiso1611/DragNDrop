import React, { useState, useEffect } from 'react';
import { errorContextRef } from '../../context/errorContextRef';
import { errorMessages } from '../../api/errorMessages';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import GlobalErrorModal from '../GlobalErrorModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { resetPassword } from '../../api/memberApi';

function ResetPwForm({ onResetSuccess }) {
    const navigate = useNavigate();
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwMatchError, setPwMatchError] = useState('');
    const [isPwValid, setIsPwValid] = useState(false);
    const [searchParams] = useSearchParams();

    const userid = searchParams.get('userid');
    const email = searchParams.get('email');

    const pwRegex = /^[a-zA-Z0-9]{6,16}$/;

    useEffect(() => {
        if (!newPw) {
            setPwMatchError('');
            setIsPwValid(false);
            return;
        }

        if (!pwRegex.test(newPw)) {
            setPwMatchError("비밀번호는 영문자+숫자 6~16자여야 합니다.");
            setIsPwValid(false);
        } else {
            setPwMatchError("사용 가능한 비밀번호입니다!");
            setIsPwValid(true);
        }
    }, [newPw]);

    useEffect(() => {
        if (newPw && confirmPw) {
            if (newPw !== confirmPw) {
                setPwMatchError("비밀번호가 일치하지 않습니다.");
            } else if (isPwValid) {
                setPwMatchError("비밀번호가 일치합니다!");
            }
        } else if (newPw && !confirmPw && isPwValid) {
            setPwMatchError("사용 가능한 비밀번호입니다!");
        } else if (!newPw && !confirmPw) {
            setPwMatchError("");
        }
    }, [newPw, confirmPw, isPwValid]);


    const handleReset = async (e) => {
        e.preventDefault();

        if (!newPw.trim() || !confirmPw.trim()) {
            errorContextRef.set({
                show: true,
                message: "모든 항목을 입력해주세요.",
                type: "error"
            });
            return;
        }

        if (!isPwValid) {
            errorContextRef.set({
                show: true,
                message: "비밀번호 형식을 확인해주세요.",
                type: "error"
            });
            return;
        }

        if (newPw !== confirmPw) {
            errorContextRef.set({
                show: true,
                message: "비밀번호가 일치하지 않습니다.",
                type: "error"
            });
            return;
        }

        if (!userid || !email) {
            errorContextRef.set({
                show: true,
                message: "비밀번호 재설정에 필요한 정보가 부족합니다.",
                type: "error"
            });
            navigate('/find');
            return;
        }

        try {
            await resetPassword(userid, email, newPw);

            errorContextRef.set({
                show: true,
                message: "비밀번호가 성공적으로 \n 변경되었습니다.",
                type: "success"
            });

            if (onResetSuccess) {
                onResetSuccess();
            } else {
                navigate('/login');
            }

        } catch (err) {
            const code = err.response?.data?.code;
            errorContextRef.set({
                show: true,
                message: errorMessages[code] || "비밀번호 재설정에 실패했습니다.",
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
                <Col xs={12} md={4} lg={3}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h3 className="text-center mb-4">비밀번호 재설정</h3>
                            <Form onSubmit={handleReset}>
                                <Form.Group controlId="formNewPassword" className="mb-3">
                                    <Form.Control
                                        type="password"
                                        placeholder="새 비밀번호 (영문자+숫자 6~16자)"
                                        value={newPw}
                                        onChange={(e) => setNewPw(e.target.value)}
                                        isInvalid={!isPwValid && newPw.length > 0}
                                        isValid={isPwValid && newPw.length > 0}
                                        required
                                    />
                                    {newPw.length > 0 && pwMatchError && (
                                        <Form.Text className={isPwValid ? "text-success" : "text-danger"}>
                                            {pwMatchError.includes("비밀번호가 일치합니다!") ? "비밀번호가 일치합니다!" : pwMatchError}
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group controlId="formConfirmPassword" className="mb-3">
                                    <Form.Control
                                        type="password"
                                        placeholder="새 비밀번호 확인"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        isInvalid={newPw && confirmPw && newPw !== confirmPw}
                                        isValid={newPw && confirmPw && newPw === confirmPw && isPwValid}
                                        required
                                    />
                                    {newPw && confirmPw && newPw !== confirmPw && (
                                        <Form.Text className="text-danger">비밀번호가 일치하지 않습니다.</Form.Text>
                                    )}
                                    {newPw && confirmPw && newPw === confirmPw && isPwValid && (
                                        <Form.Text className="text-success">비밀번호가 일치합니다!</Form.Text>
                                    )}
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 mb-3">
                                    비밀번호 재설정
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <GlobalErrorModal />
        </Container>
    );
}

export default ResetPwForm;