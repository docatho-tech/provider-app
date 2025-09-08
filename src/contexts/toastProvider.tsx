import { createContext, ReactNode } from "react";
import Toast from 'react-native-toast-message';

export const ToastContext = createContext({})

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    return (
        <ToastContext.Provider value={{}}>
            {children}
            <Toast position="bottom" autoHide={true} visibilityTime={3000} />
        </ToastContext.Provider>
    )
};