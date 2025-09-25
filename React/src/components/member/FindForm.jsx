import React, { useState } from 'react';
import IdFindForm from './IdFindForm';
import PwFindForm from './PwFindForm';
import { Link } from 'react-router-dom';
import { Container, Card, Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function FindForm() {
  const [activeTab, setActiveTab] = useState('id');

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '25rem' }}>
        <Card.Body>
          <h3 className="text-center mb-4">아이디 / 비밀번호 찾기</h3>
          <Tabs
            id="find-form-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3 justify-content-center"
          >
            <Tab eventKey="id" title="아이디 찾기">
              <IdFindForm />
            </Tab>
            <Tab eventKey="pw" title="비밀번호 찾기">
              <PwFindForm />
            </Tab>
          </Tabs>

          <div className="d-grid gap-2">
            <div className="text-center mt-3">
              <Link to="/" className="text-decoration-none text-primary">
                뒤로가기
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default FindForm;