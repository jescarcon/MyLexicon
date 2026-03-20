import { useAuth } from "../../utils/authContext/authContext";

export default function Main() {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Bienvenido, {user || 'Invitado'}</h1>
            <button onClick={logout}>Cerrar Sesión</button>
        </div>
    );
}