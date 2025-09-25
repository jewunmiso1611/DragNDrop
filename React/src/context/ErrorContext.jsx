// src/context/errorContextRef.js
import { createContext, useRef } from "react";

export const errorContextRef = { current: null };

export const ErrorContext = createContext({
    show: false,
    message: '',
    type: 'error',
});
