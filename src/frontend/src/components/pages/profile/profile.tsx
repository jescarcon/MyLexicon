import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../utils/authContext/authContext";
import './profile.css';

const API_URL = import.meta.env.VITE_DEPLOY === 'true'
    ? import.meta.env.VITE_API_URL_DEPLOY
    : import.meta.env.VITE_API_URL_LOCAL;

export default function Profile() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const token = localStorage.getItem('access_token');
    
    const [userData, setUserData] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        if (!token) return;
        try {
            const decoded: any = jwtDecode(token);
            setUserData(decoded);
            setFormData({
                name: decoded.name || '',
                email: decoded.email || '',
                password: ''
            });
        } catch (e) {
            logout();
        }
    }, [token, logout]);

    if (!token) return <div className="list-status">ACCESO DENEGADO</div>;
    if (!userData) return <div className="list-status">CARGANDO DATOS...</div>;

    const formatDate = (date: string) => {
        if (!date) return "-- : --";
        return new Date(date).toLocaleString([], {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getExpirationDate = () => {
        if (!userData.createdAt) return null;
        const createdDate = new Date(userData.createdAt);
        const expirationDate = new Date(createdDate);
        expirationDate.setMonth(expirationDate.getMonth() + 1);
        return expirationDate.toLocaleString([], {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = userData.id || userData.sub;
        const token = localStorage.getItem('access_token');
        if (!token || !userId) return;

        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    name: formData.name, 
                    email: formData.email,
                    ...(formData.password && { password: formData.password })
                })
            });

            if (!response.ok) throw new Error('No se pudo actualizar');

            const data = await response.json();
            setUserData((prev: any) => ({ ...prev, name: data.updatedUser?.name || formData.name, email: data.updatedUser?.email || formData.email, updatedAt: new Date().toISOString() }));
            setIsEditModalOpen(false);
            alert('Perfil actualizado correctamente');
        } catch (err) {
            alert('Hubo un error actualizando el perfil');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'ELIMINAR CUENTA') {
            alert('El texto de confirmación no es correcto');
            return;
        }

        const userId = userData.id || userData.sub;
        const token = localStorage.getItem('access_token');
        if (!token || !userId) return;

        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('No se pudo borrar');

            logout();
            localStorage.removeItem('access_token');
            navigate('/');
            alert('Cuenta eliminada definitivamente');
        } catch (err) {
            alert('Hubo un error eliminando la cuenta');
        }
    };

    return (
        <div className="main-layout">
            


            {/* CONTENIDO PRINCIPAL */}
            <main className="main-content">
                <header className="profile-section-header">
                    <h2 className="profile-section-title">DETALLES DE CUENTA</h2>
                </header>

                <div className="profile-card-container">
                    <h3 className="profile-main-name">{userData.name?.toUpperCase()}</h3>
                    <p className="profile-sub-email">{userData.email}</p>
                    
                    {/* <div className="profile-status-row">
                        <div className={`status-badge-system ${userData.verified ? 'status-v' : 'status-p'}`} data-expiration={getExpirationDate()}>
                            {userData.verified ? 'CUENTA VERIFICADA' : 'VERIFICACIÓN PENDIENTE'}
                        </div>
                    </div> */}

                    <div className="profile-buttons-row">
                        <button className="profile-action-btn" onClick={() => setIsEditModalOpen(true)}>Editar perfil</button>
                        <button className="profile-action-btn profile-action-danger" onClick={() => setIsDeleteConfirmOpen(true)}>Borrar cuenta</button>
                    </div>

                    <div className="profile-metadata-line">
                        <div>
                            <strong>CUENTA CREADA</strong><br/>
                            <span className="meta-value">{formatDate(userData.createdAt)}</span>
                        </div>
                        <div>
                            <strong>ÚLTIMA ACTUALIZACIÓN</strong><br/>
                            <span className="meta-value">{formatDate(userData.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {isEditModalOpen && (
                    <div className="profile-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                        <form className="profile-modal-content profile-modal" onSubmit={handleSaveProfile} onClick={e => e.stopPropagation()}>
                            <div className="profile-modal-header">
                                <h2 className="profile-modal-title">ACTUALIZAR PERFIL</h2>
                                <button type="button" className="profile-modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
                            </div>
                            <div className="profile-form-group">
                                <label>Nombre</label>
                                <input className="profile-modal-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="profile-form-group">
                                <label>Email</label>
                                <input className="profile-modal-input" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="profile-form-group">
                                <label>Nueva contraseña</label>
                                <input className="profile-modal-input" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Dejar vacío para no cambiarla." />
                            </div>
                            <div className="profile-modal-actions">
                                <button type="submit" className="profile-btn-confirm">Guardar</button>
                            </div>
                        </form>
                    </div>
                )}

                {isDeleteConfirmOpen && (
                    <div className="profile-modal-overlay" onClick={() => { setIsDeleteConfirmOpen(false); setDeleteConfirmText(''); }}>
                        <div className="profile-modal-content profile-modal" onClick={e => e.stopPropagation()}>
                            <div className="profile-modal-header">
                                <h2 className="profile-modal-title">CONFIRMAR BORRADO</h2>
                                <button type="button" className="profile-modal-close" onClick={() => { setIsDeleteConfirmOpen(false); setDeleteConfirmText(''); }}>×</button>
                            </div>
                            <p>¿Seguro que quieres borrar tu cuenta? Esta operación no tiene vuelta atrás.</p>
                            <br/>
                            <p className="profile-delete-warning">Se borrará <strong>todo</strong> lo relacionado con tu cuenta.</p>
                            <br/>
                            <div className="profile-form-group">
                                <label>Escribe "ELIMINAR CUENTA" para confirmar:</label>
                                <input 
                                    className="profile-modal-input" 
                                    type="text" 
                                    value={deleteConfirmText} 
                                    onChange={e => setDeleteConfirmText(e.target.value)} 
                                    placeholder="ELIMINAR CUENTA" 
                                />
                            </div>
                            <div className="profile-modal-actions">
                                <button type="button" className="profile-btn-cancel" onClick={() => { setIsDeleteConfirmOpen(false); setDeleteConfirmText(''); }}>Cancelar</button>
                                <button type="button" className="profile-btn-confirm" onClick={handleDeleteAccount}>Confirmar borrado</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}