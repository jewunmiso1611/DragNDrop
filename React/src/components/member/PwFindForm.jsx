import React, { useState } from 'react';
import { errorContextRef } from '../../context/errorContextRef';
import { errorMessages } from '../../api/errorMessages';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { findPassword } from '../../api/memberApi';

function PwFindForm() {
    const [userid, setUserid] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleFindPassword = async (e) => {
        e.preventDefault();

        if (!userid.trim() || !email.trim()) {
            errorContextRef.set({
                show: true,
                message: "아이디와 이메일을 모두 입력해주세요.",
                type: "error",
            });
            return;
        }

        try {
            const data = await findPassword(userid, email); // ✅ API 분리 적용

            errorContextRef.set({
                show: true,
                message: data.message || "비밀번호를 재설정하세요.",
                type: "success",
            });

            navigate(`/reset-pw?userid=${userid}&email=${email}`);

            setUserid('');
            setEmail('');
        } catch (err) {
            const code = err.response?.data?.code;

            errorContextRef.set({
                show: true,
                message: errorMessages[code] || "비밀번호 찾기에 실패했습니다.",
                type: "error",
            });
        }
    };


    return (

        <Form onSubmit={handleFindPassword}>
            <Form.Group className="mb-3" controlId="formFindPwUserid">
                <Form.Control
                    type="text"
                    placeholder="아이디"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFindPwEmail">
                <Form.Control
                    type="email"
                    placeholder="가입한 이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
                비밀번호 재설정
            </Button>
        </Form>
    );
}

export default PwFindForm;