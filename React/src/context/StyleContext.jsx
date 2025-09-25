import { createContext, useContext } from 'react';

export const StyleContext = createContext();

export const StyleProvider = ({ children }) => {
  const getGradeStyle = (grade) => {
    switch (grade) {
      case 1:
        return { backgroundColor: '#f1f1f1', borderColor: '#e0e0e0', textColor: '#333' };
      case 2:
        return { backgroundColor: '#d4edda', borderColor: '#c3e6cb', textColor: '#155724' };
      case 3:
        return { backgroundColor: '#cce5ff', borderColor: '#b8daff', textColor: '#004085' };
      case 4:
        return { backgroundColor: '#e2d9f3', borderColor: '#d6c9e0', textColor: '#492c6e' };
      case 5:
        return { backgroundColor: '#fff3cd', borderColor: '#ffeeba', textColor: '#856404' };
      default:
        return { backgroundColor: '#f8f9fa', borderColor: '#dee2e6', textColor: '#495057' };
    }
  };

  return (
    <StyleContext.Provider value={{ getGradeStyle }}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => useContext(StyleContext);
