// src/components/find/IdFindForm.jsx
import React, { useState } from 'react';
import { errorContextRef } from '../../context/errorContextRef';
import { errorMessages } from '../../api/errorMessages';
import { Form, Button } from 'react-bootstrap';
import { findUserIdByEmail } from '../../api/memberApi';


function IdFindForm() {
  const [email, setEmail] = useState('');

  const handleFindId = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      errorContextRef.set({
        show: true,
        message: "이메일을 입력해주세요.",
        type: "error"
      });
      return;
    }

    try {
      const { userids } = await findUserIdByEmail(email); // ✅ 분리된 API 호출
      const message = `당신의 아이디는\n${userids.map(id => `📌 ${id}`).join('\n')}`;

      errorContextRef.set({
        show: true,
        message,
        type: "success"
      });
      setEmail('');
    } catch (err) {
      const code = err.response?.data?.code;
      errorContextRef.set({
        show: true,
        message: errorMessages[code] || "아이디 찾기에 실패했습니다.",
        type: "error"
      });
      return;
    }
  };

  return (

    <Form onSubmit={handleFindId}>
      <Form.Group className="mb-3" controlId="formFindIdEmail">
        <Form.Control
          type="email"
          placeholder="가입한 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100">
        아이디 찾기
      </Button>
    </Form>
  );
}

export default IdFindForm;