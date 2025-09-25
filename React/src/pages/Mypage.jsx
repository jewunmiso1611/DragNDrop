import React, { useState } from 'react';
import Header from '../components/main/Header';
import InfoSection from '../components/mypage/InfoSection';
import DefaultCardSection from '../components/mypage/DefaultCardSection';
import DefaultCardRegisterRecurring from '../components/mypage/DefaultCardRegisterRecurring';
import DeleteAccount from '../components/mypage/DeleteAccount';

const Mypage = () => {
  const [activeTab, setActiveTab] = useState('calendar'); // ✅ 시작 탭: 내 주요 일정

  return (
    <>
      <Header />

      <div className="container-fluid my-5">
        <div className="row">
          {/* 왼쪽 네비게이션 */}
          <div className="col-md-2 border-end pe-0">
            <div className="list-group">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                내 정보 수정
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'card' ? 'active' : ''}`}
                onClick={() => setActiveTab('card')}
              >
                기본 카드 목록
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                반복 일정 등록
              </button>
              {/* <button
                className={`list-group-item list-group-item-action ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                내 주요 일정
              </button> */}
            </div>

            {/* 하단 탈퇴 버튼 */}
            <div className="mt-4 d-flex justify-content-center">
              <DeleteAccount />
            </div>
          </div>

          {/* 오른쪽 콘텐츠 */}
          <div className="col-md-9 ps-4">
            {activeTab === 'info' && <InfoSection />}
            {activeTab === 'card' && <DefaultCardSection />}
            {activeTab === 'register' && <DefaultCardRegisterRecurring />} {/* ✅ 자동 등록 탭 */}
            {/* {activeTab === 'calendar' && <CalendarSection />} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Mypage;
