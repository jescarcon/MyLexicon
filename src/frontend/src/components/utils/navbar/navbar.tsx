import { useNavigate } from 'react-router-dom';
import './navbar.css';

interface NavbarProps {
    user: string | null;
    logout: () => void;
}

export default function Navbar({ user, logout }: NavbarProps) {
    const navigate = useNavigate();

    return (
        <header className="navbar-main-header">
            <div className="navbar-header-container">
                <div className="navbar-welcome-text">
                    <h1>
                        BIENVENIDO, <span className="navbar-user-name">{user}</span>
                    </h1>
                    <p>TU CONOCIMIENTO ORDENADO Y ACCESIBLE</p>
                </div>

                <div className="navbar-header-center">
                    <span className="navbar-logo-text" onClick={() => navigate('/mis-diccionarios')}>MY LEXICON</span>
                </div>

                <nav className="navbar-header-actions">
                    <button
                        className="navbar-btn-secondary"
                        onClick={() => navigate('/perfil')}
                    >
                        PERFIL
                    </button>

                    <button
                        className="navbar-btn-danger"
                        onClick={logout}
                    >
                        SALIR
                    </button>
                </nav>
            </div>
        </header>
    );
}