import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: string | null;
    login: (accessToken: string, username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // #region --- ESTADO ---
    const [user, setUser] = useState<string | null>(localStorage.getItem('username'));
    const navigate = useNavigate(); // Importante: AuthProvider debe estar DENTRO de BrowserRouter en App.tsx
    // #endregion

    // #region --- LÓGICA DE AUTENTICACIÓN ---
    const login = (accessToken: string, username: string) => {
       
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('username', username);
        
        setUser(username);
    };

    const logout = () => {
        // Limpia todo el rastro de la sesión
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        
        setUser(null);
        navigate('/');
    };
    // #endregion

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};