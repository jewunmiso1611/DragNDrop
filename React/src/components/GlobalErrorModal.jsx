import React, { useContext, useEffect } from 'react';
import { ErrorContext } from '../context/ErrorProvider';
import { bindErrorSetter } from '../context/errorContextRef';

function GlobalErrorModal() {
  const context = useContext(ErrorContext);

  useEffect(() => {
    if (context?.setError) {
      bindErrorSetter(context.setError);
    }
  }, [context]);

  if (!context || !context.error?.show) return null;

  const { error, setError } = context;

  const handleClose = () => {
    setError({ show: false, message: '' });
  };

  return (
    <>
      {/* ✅ 배경: 검정 + 0.5 투명도 */}
      <div
        className="modal-backdrop d-block"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✨ 투명 배경
          zIndex: 1040,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
        }}
      ></div>

      {/* ✅ 모달 박스는 완전 불투명 */}
      <div
        className="modal modal-dialog modal-dialog-centered modal-sm d-block"
        tabIndex="-1"
        role="dialog"
        style={{
          zIndex: 1050,
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: '#fff',
            opacity: 1, // ✨ 완전 불투명
          }}
        >
          <div className="modal-header">
            <h5 className="modal-title">
              {error.type === 'confirm' ? '확인 필요' : '알림'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="닫기"
              onClick={handleClose}
            ></button>
          </div>

          <div className="modal-body">
            {error.message.split('\n').map((line, index) => (
              <p key={index} className="text-center mb-1">{line}</p>
            ))}
          </div>

          <div className="modal-footer justify-content-center">
            {error.type === 'confirm' ? (
              <>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    handleClose();
                    if (typeof error.onConfirm === 'function') {
                      await error.onConfirm();
                    }
                  }}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    handleClose();
                    if (typeof error.onCancel === 'function') {
                      error.onCancel();
                    }
                  }}
                >
                  취소
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
              >
                확인
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalErrorModal;
