import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
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
        setTimeout(() => {
            setFormData({
                name: '',
                email: '',
                password: ''
            });

            setShowPassword(false);

            setErrors({
                name: '',
                email: '',
                password: ''
            });

            setServerError('');

            setIsLogin(true);

            onClose();
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrors({
            ...errors,
            [e.target.name]: ''
        });

        setServerError('');

    };

    const validarFormulario = () => {
        const nuevosErrores = {
            name: '',
            email: '',
            password: ''
        };

        if (!formData.email) {
            nuevosErrores.email = "El email no puede estar vacío.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            nuevosErrores.email = "Formato de email inválido.";
        } else if (formData.email.length > 50) {
            nuevosErrores.email = "Máximo 50 caracteres.";
        }

        if (!formData.password) {
            nuevosErrores.password = "La contraseña no puede estar vacía.";
        } else if (formData.password.length < 6) {
            nuevosErrores.password = "Mínimo 6 caracteres.";
        } else if (formData.password.length > 255) {
            nuevosErrores.password = "Demasiado larga.";
        }

        if (!isLogin) {
            if (!formData.name) {
                nuevosErrores.name = "El nombre no puede estar vacío.";
            } else if (formData.name.length > 50) {
                nuevosErrores.name = "Máximo 50 caracteres.";
            }
        }

        setErrors(nuevosErrores);

        return Object.values(nuevosErrores).some(e => e !== '');
    };
    // #endregion

    // #region --- LÓGICA DE PETICIONES (Submit) ---
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const hayErrores = validarFormulario();
        if (hayErrores) return;

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
                        setIsLogin(true);
                        return;
                    }
                }

                login(accessToken, finalUsername);

                handleClose();
                navigate('/mis-diccionarios');
            } else {
                if (data.message === "Invalid credentials") {
                    setServerError("Email o contraseña incorrectos");
                } else {
                    setServerError(data.message || "Error en la operación");
                }
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setServerError("No se pudo conectar con el servidor");
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
                            {errors.name && <span className="auth-error">{errors.name}</span>}
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
                    {errors.email && <span className="auth-error">{errors.email}</span>}

                    <div className="auth-password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="CONTRASEÑA"
                            className="auth-modal-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="button"
                            className="auth-show-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Mostrar u ocultar contraseña"
                        >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}                        </button>
                    </div>
                    {errors.password && <span className="auth-error">{errors.password}</span>}

                    <button type="submit" className="auth-modal-submit-btn">
                        {isLogin ? 'ENTRAR' : 'CREAR CUENTA'}
                    </button>
                </form>

                <footer className="auth-modal-footer">
                    {serverError && (
                        <div className="auth-error-server">
                            {serverError}
                        </div>
                    )}
                    <button type="button" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Accede'}
                    </button>
                </footer>
            </div>
        </div>
    );
}