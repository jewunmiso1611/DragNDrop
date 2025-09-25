import React from 'react';
import LeftPanel from '../components/main/LeftPanel';
import CalendarArea from '../components/main/CalendarArea';
import RightPanel from '../components/main/RightPanel';
import Header from '../components/main/Header';
import { TodoProvider } from '../context/TodoContext';
import { CalendarProvider } from '../context/CalendarContext';

const MainPage = () => {
  return (
    <>
      <Header />
      <TodoProvider>
        <CalendarProvider>
          <div className="container-fluid g-0">
            <div className="d-flex vh-100">
              {/* LeftPanel - 약 15% */}
              <div
                className="d-flex flex-column bg-light border-end"
                style={{ flexBasis: '15%', overflowY: 'auto' }}
              >
                <LeftPanel />
              </div>

              {/* CalendarArea - 약 70% */}
              <div
                className="d-flex flex-column"
                style={{ flexBasis: '65%', overflowY: 'auto' }}
              >
                <CalendarArea />
              </div>

              {/* RightPanel - 약 15% */}
              <div
                className="d-flex flex-column bg-light border-start"
                style={{ flexBasis: '20%', overflowY: 'auto' }}
              >
                <RightPanel />
              </div>
            </div>
          </div>
        </CalendarProvider>
      </TodoProvider>
    </>
  );
};

export default MainPage;
