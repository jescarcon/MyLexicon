import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import './dictionary.css';
import '../../../../index.css';

const API_URL = import.meta.env.VITE_DEPLOY === 'true'
    ? import.meta.env.VITE_API_URL_DEPLOY
    : import.meta.env.VITE_API_URL_LOCAL;

const Language = {
    SPANISH: 'SPANISH',
    JAPANESE: 'JAPANESE',
    ENGLISH: 'ENGLISH',
    FRENCH: 'FRENCH',
    GERMAN: 'GERMAN',
    CHINESE: 'CHINESE',
    KOREAN: 'KOREAN',
    RUSSIAN: 'RUSSIAN',
    HINDI: 'HINDI',
    PORTUGUESE: 'PORTUGUESE',
    ARABIC: 'ARABIC',
} as const;

type LanguageType = typeof Language[keyof typeof Language];

interface Dictionary {
    updatedAt: string | number | Date;
    id: number;
    name?: string;
    description?: string;
    languageFrom: LanguageType;
    languageTo: LanguageType;
    createdAt: string;
}

export default function Dictionary() {
    const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const defaultFormData = {
        name: "",
        description: "",
        languageFrom: Language.ENGLISH as LanguageType,
        languageTo: Language.SPANISH as LanguageType
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedDictionary, setSelectedDictionary] = useState<Dictionary | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null as Dictionary | null });

    const [formData, setFormData] = useState(defaultFormData);

    const resetFormData = () => {
        setFormData(defaultFormData);
        setSelectedDictionary(null);
        setIsEditMode(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetFormData();
    };

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    const languageMap: Record<LanguageType, string> = {
        SPANISH: "ESPAÑOL",
        JAPANESE: "JAPONÉS",
        ENGLISH: "INGLÉS",
        FRENCH: "FRANCÉS",
        GERMAN: "ALEMÁN",
        CHINESE: "CHINO",
        KOREAN: "COREANO",
        RUSSIAN: "RUSO",
        HINDI: "HINDÚ",
        PORTUGUESE: "PORTUGUÉS",
        ARABIC: "ÁRABE",
    };

    const formatDate = (date: string | number | Date) => {
        return new Date(date).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const loadData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/dictionaries/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setDictionaries(data.dictionaries || []);
        } catch (err) {
            console.error("Error de conexión:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        const hideMenu = () => closeContextMenu();
        document.addEventListener('click', hideMenu);
        return () => document.removeEventListener('click', hideMenu);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const method = isEditMode && selectedDictionary ? 'PATCH' : 'POST';
        const url = isEditMode && selectedDictionary
            ? `${API_URL}/dictionaries/${selectedDictionary.id}`
            : `${API_URL}/dictionaries`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsModalOpen(false);
                resetFormData();
                loadData();
            } else {
                alert(isEditMode ? "Error al actualizar el diccionario" : "Error al crear el diccionario");
            }
        } catch (err) {
            alert("Error de conexión con el servidor");
        }
    };

    const handleDelete = async () => {
        if (!selectedDictionary) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/dictionaries/${selectedDictionary.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setIsDeleteConfirmOpen(false);
                resetFormData();
                loadData();
            } else {
                alert("Error al eliminar el diccionario");
            }
        } catch (err) {
            alert("Error de conexión con el servidor");
        }
    };

    const openEditModal = (item: Dictionary) => {
        setSelectedDictionary(item);
        setIsEditMode(true);
        setFormData({
            name: item.name || "",
            description: item.description || "",
            languageFrom: item.languageFrom,
            languageTo: item.languageTo
        });
        setIsModalOpen(true);
        closeContextMenu();
    };

    const openDeleteConfirm = (item: Dictionary) => {
        setSelectedDictionary(item);
        setIsDeleteConfirmOpen(true);
        closeContextMenu();
    };

    const filteredData = useMemo(() => {
        return dictionaries.filter(d =>
            d.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, dictionaries]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const paginatedItems = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="dictionary-main-layout">

            {/* MODAL */}
            {isModalOpen && (
                <div className="dictionary-modal-overlay" onClick={closeModal}>
                    <form
                        className="dictionary-modal-content"
                        onSubmit={handleCreate}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="dictionary-modal-header">
                            <h2 className="dictionary-modal-title">NUEVO DICCIONARIO</h2>
                            <button type="button" className="dictionary-modal-close" onClick={closeModal} aria-label="Cerrar modal">×</button>
                        </div>

                        <div className="dictionary-form-group">
                            <label>Nombre del Diccionario</label>
                            <input
                                className="dictionary-modal-input"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Diccionario ING-ESP"
                            />
                        </div>

                        <div className="dictionary-form-group">
                            <label>Descripción (Opcional)</label>
                            <input
                                className="dictionary-modal-input"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Términos aprendidos en clase."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="dictionary-form-group">
                                <label>Idioma Origen</label>
                                <select
                                    className="dictionary-modal-select"
                                    value={formData.languageFrom}
                                    onChange={e => setFormData({ ...formData, languageFrom: e.target.value as LanguageType })}
                                >
                                    {Object.values(Language)
                                        .sort((a, b) => languageMap[a].localeCompare(languageMap[b], 'es'))
                                        .map(lang => (
                                            <option key={lang} value={lang}>
                                                {languageMap[lang]}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="dictionary-form-group">
                                <label>Idioma Destino</label>
                                <select
                                    className="dictionary-modal-select"
                                    value={formData.languageTo}
                                    onChange={e => setFormData({ ...formData, languageTo: e.target.value as LanguageType })}
                                >
                                    {Object.values(Language)
                                        .sort((a, b) => languageMap[a].localeCompare(languageMap[b], 'es'))
                                        .map(lang => (
                                            <option key={lang} value={lang}>
                                                {languageMap[lang]}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="dictionary-modal-actions">
                            <button type="submit" className="dictionary-btn-confirm">
                                {isEditMode ? "ACTUALIZAR" : "CREAR"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {contextMenu.visible && contextMenu.item && (
                <div
                    className="dictionary-context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={() => contextMenu.item && openEditModal(contextMenu.item)}>Editar</button>
                    <button onClick={() => contextMenu.item && openDeleteConfirm(contextMenu.item)}>Eliminar</button>
                </div>
            )}

            {isDeleteConfirmOpen && selectedDictionary && (
                <div className="dictionary-modal-overlay" onClick={() => setIsDeleteConfirmOpen(false)}>
                    <div className="dictionary-modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="dictionary-modal-title">CONFIRMAR ELIMINACIÓN</h2>
                        <p>¿Seguro que quieres eliminar "{selectedDictionary.name}"?</p>
                        <p className="dictionary-delete-warning">Se eliminarán todas sus entradas.</p>
                        <div className="dictionary-modal-actions">
                            <button type="button" className="dictionary-btn-cancel" onClick={() => setIsDeleteConfirmOpen(false)}>CANCELAR</button>
                            <button type="button" className="dictionary-btn-confirm" onClick={handleDelete}>ELIMINAR</button>
                        </div>
                    </div>
                </div>
            )}


            {/* MAIN CONTENT */}
            <main className="dictionary-main-content">

                <header className="dictionary-section-header">
                    <h2 className="dictionary-section-title">MIS DICCIONARIOS</h2>
                </header>

                <section className="dictionary-dashboard-actions">
                    <div className="dictionary-search-container">
                        <input
                            type="text"
                            className="dictionary-search-input"
                            placeholder="FILTRAR POR NOMBRE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="dictionary-search-line"></span>
                    </div>
                    <div className="dictionary-create-wrapper">
                        <button className="dictionary-btn-create" onClick={() => {
                            resetFormData();
                            setIsModalOpen(true);
                        }}>+ NUEVO</button>
                    </div>
                </section>

                <footer className="dictionary-pagination-wrapper">
                    <div className="dictionary-items-per-page">
                        <span>MOSTRAR:</span>
                        {[6, 9, 12].map(num => (
                            <button
                                key={num}
                                className={`dictionary-num-btn ${itemsPerPage === num ? 'active' : ''}`}
                                onClick={() => setItemsPerPage(num)}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <div className="dictionary-pagination-container">
                        <button className="dictionary-pagi-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>ANTERIOR</button>
                        <div className="dictionary-page-info">
                            <span className="dictionary-current-number">{currentPage}</span> DE {totalPages}
                        </div>
                        <button className="dictionary-pagi-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>SIGUIENTE</button>
                    </div>
                </footer>

                <div className="dictionary-generic-grid">
                    {loading ? (
                        <div className="dictionary-list-status">CONECTANDO AL SISTEMA...</div>
                    ) : paginatedItems.length > 0 ? (
                        paginatedItems.map((item) => (
                            <div
                                key={item.id}
                                className="dictionary-generic-card"
                                onClick={() => navigate(`/mis-diccionarios/${item.id}`)}
                                onContextMenu={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, item });
                                }}
                            >
                                <div className="dictionary-card-header-info">
                                    <span className="dictionary-card-meta">
                                        {languageMap[item.languageFrom]} ⟷ {languageMap[item.languageTo]}
                                    </span>
                                </div>
                                <div className="dictionary-card-body">
                                    <h3 className="dictionary-card-title">{item.name?.toUpperCase()}</h3>
                                    <p className="dictionary-card-subtitle">{item.description || "Sin descripción."}</p>
                                </div>
                                <div className="dictionary-card-footer column">
                                    <span className="dictionary-card-date subtle">CREADO: {formatDate(item.createdAt)}</span>
                                    <span className="dictionary-card-date subtle">ACTUALIZADO: {formatDate(item.updatedAt)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="dictionary-list-status">NO HAY REGISTROS.</div>
                    )}
                </div>
            </main>
        </div>
    );
}