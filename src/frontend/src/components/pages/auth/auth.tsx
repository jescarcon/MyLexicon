import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import { useAuth } from '../../utils/authContext/authContext';

interface AuthProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Auth({ isOpen, onClose }: AuthProps) {
    // #region --- ESTADOS Y VARIABLES ---
    const [isLogin, setIsLogin] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    // Lógica de entorno: Interruptor manual vía .env
    const isDeploy = import.meta.env.VITE_DEPLOY === 'true';
    const API_URL = isDeploy
        ? import.meta.env.VITE_API_URL_DEPLOY
        : import.meta.env.VITE_API_URL_LOCAL;
    // #endregion

    // #region --- CICLO DE VIDA (Efectos) ---
    useEffect(() => {
        if (isOpen) setIsAnimating(true);
    }, [isOpen]);
    // #endregion

    // #region --- LÓGICA DE INTERFAZ (Handlers) ---
    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    // #endregion

    // #region --- LÓGICA DE PETICIONES (Submit) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const endpoint = isLogin ? '/auth/login' : '/users';
        const url = `${API_URL}${endpoint}`;

        try {
            // 1. Petición inicial (Login o Registro)
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isLogin
                    ? { email: formData.email, password: formData.password }
                    : { name: formData.name, email: formData.email, password: formData.password }
                )
            });

            const data = await response.json();

            if (response.ok) {
                let accessToken = data.access_token;
                let finalUsername = isLogin ? data.user.name : formData.name;

                if (!isLogin) {
                    const loginRes = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email, password: formData.password })
                    });
                    const loginData = await loginRes.json();

                    if (loginRes.ok) {
                        accessToken = loginData.access_token;
                        finalUsername = loginData.user.name;
                    } else {
                        alert("Cuenta creada. Por favor, accede con tus credenciales.");
                        setIsLogin(true);
                        return;
                    }
                }

                login(accessToken, finalUsername);

                handleClose();
                navigate('/mis-diccionarios');
            } else {
                alert(data.message || 'Error en la operación');
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error: No se pudo conectar con el servidor");
        }
    };
    // #endregion

    if (!isOpen && !isAnimating) return null;

    return (
        <div
            className={`auth-modal-overlay ${isAnimating ? 'auth-active' : 'auth-closing'}`}
            onClick={handleClose}
        >
            <div
                className={`auth-modal-content ${isAnimating ? 'auth-active' : 'auth-closing'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="auth-modal-close" onClick={handleClose} aria-label="Cerrar">&times;</button>

                <header className="auth-modal-header">
                    <h2>{isLogin ? 'ACCESO' : 'REGISTRO'}</h2>
                    <p>{isLogin ? 'Identificación de usuario' : 'Nueva cuenta del sistema'}</p>
                </header>

                <form className="auth-modal-form" onSubmit={handleSubmit}>
                    <div className={`auth-input-anim-wrapper ${!isLogin ? 'auth-expanded' : ''}`}>
                        <div className="auth-input-anim-inner">
                            <input
                                type="text"
                                name="name"
                                placeholder="NOMBRE"
                                className="auth-modal-input"
                                value={formData.name}
                                onChange={handleChange}
                                required={!isLogin}
                            />
                        </div>
                    </div>

                    <input
                        type="email"
                        name="email"
                        placeholder="EMAIL"
                        className="auth-modal-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="CONTRASEÑA"
                        className="auth-modal-input"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="auth-modal-submit-btn">
                        {isLogin ? 'ENTRAR' : 'CREAR CUENTA'}
                    </button>
                </form>

                <footer className="auth-modal-footer">
                    <button type="button" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Accede'}
                    </button>
                </footer>
            </div>
        </div>
    );
}