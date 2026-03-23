import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import './entry.css';

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

interface EntryItem {
    id: number;
    dictionaryId: number;
    wordFrom: string;
    wordTo: string;
    languageFrom: LanguageType;
    languageTo: LanguageType;
    category?: string;
    notes?: string;
    isFavorite?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DictionaryInfo {
    id: number;
    name: string;
    description?: string;
    languageFrom: LanguageType;
    languageTo: LanguageType;
}

export default function Entry() {
    const { id } = useParams<{ id: string }>();
    const dictId = Number(id);

    const [entries, setEntries] = useState<EntryItem[]>([]);
    const [dictionary, setDictionary] = useState<DictionaryInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<EntryItem | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null as EntryItem | null });

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categorySearchQuery, setCategorySearchQuery] = useState("");
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [favoriteFilter, setFavoriteFilter] = useState<'all' | 'only'>('all');
    const [currentPage,setCurrentPage] = useState(1);
    const [itemsPerPage,setItemsPerPage] = useState(8);
    const categoryRef = useRef<HTMLDivElement | null>(null);

    const defaultFormData = {
        wordFrom: "",
        languageFrom: Language.ENGLISH as LanguageType,
        wordTo: "",
        languageTo: Language.SPANISH as LanguageType,
        category: "",
        notes: "",
        isFavorite: false,
    };

    const [formData, setFormData] = useState(defaultFormData);

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

    const formatDate = (date: string | Date) => new Date(date).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const resetFormData = () => {
        if (dictionary) {
            setFormData({
                ...defaultFormData,
                languageFrom: dictionary.languageFrom,
                languageTo: dictionary.languageTo,
            });
        } else {
            setFormData(defaultFormData);
        }
        setSelectedEntry(null);
        setIsEditMode(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetFormData();
    };

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
    };

    const loadEntries = async () => {
        if (!dictId) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            setLoading(true);
            const [dictRes, entryRes] = await Promise.all([
                fetch(`${API_URL}/dictionaries/${dictId}`, { headers: { 'Authorization': `Bearer ${token}` }}),
                fetch(`${API_URL}/entries/dictionary/${dictId}`, { headers: { 'Authorization': `Bearer ${token}` }})
            ]);

            if (dictRes.ok) {
                const dictData = await dictRes.json();
                setDictionary(dictData.dictionary);
            }

            if (entryRes.ok) {
                const entryData = await entryRes.json();
                setEntries(entryData.entries || []);
            }
        } catch (err) {
            console.error('Error al cargar entradas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dictId]);

    useEffect(() => {
        if (!dictionary) return;
        setFormData(prev => ({
            ...prev,
            languageFrom: dictionary.languageFrom,
            languageTo: dictionary.languageTo,
        }));
    }, [dictionary]);

    useEffect(() => {
        const hideMenu = () => closeContextMenu();
        document.addEventListener('click', hideMenu);
        return () => document.removeEventListener('click', hideMenu);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setCategoryDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dictId) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const method = isEditMode && selectedEntry ? 'PATCH' : 'POST';
        const url = isEditMode && selectedEntry
            ? `${API_URL}/entries/${selectedEntry.id}`
            : `${API_URL}/entries/${dictId}`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    wordFrom: formData.wordFrom,
                    wordTo: formData.wordTo,
                    category: formData.category,
                    notes: formData.notes,
                    isFavorite: formData.isFavorite,
                })
            });

            if (!response.ok) {
                alert(isEditMode ? 'Error al actualizar entrada' : 'Error al crear entrada');
                return;
            }

            closeModal();
            loadEntries();
        } catch (err) {
            alert('Error de red con el servidor');
        }
    };

    const handleDelete = async () => {
        if (!selectedEntry) return;
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch(`${API_URL}/entries/${selectedEntry.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            setIsDeleteConfirmOpen(false);
            resetFormData();
            loadEntries();
        } else {
            alert('Error al eliminar la entrada');
        }
    };

    const openEditModal = (entry: EntryItem) => {
        setSelectedEntry(entry);
        setIsEditMode(true);
        setFormData({
            wordFrom: entry.wordFrom,
            languageFrom: entry.languageFrom,
            wordTo: entry.wordTo,
            languageTo: entry.languageTo,
            category: entry.category || "",
            notes: entry.notes || "",
            isFavorite: !!entry.isFavorite,
        });
        setIsModalOpen(true);
        closeContextMenu();
    };

    const openDeleteConfirm = (entry: EntryItem) => {
        setSelectedEntry(entry);
        setIsDeleteConfirmOpen(true);
        closeContextMenu();
    };

    const toggleFavorite = async (entry: EntryItem) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/entries/${entry.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isFavorite: !entry.isFavorite }),
            });

            if (response.ok) {
                loadEntries();
            } else {
                console.error('Error al cambiar favorito');
            }
        } catch (err) {
            console.error('Error de red al cambiar favorito', err);
        }
    };

    const categories = useMemo(() => {
        const unique = Array.from(new Set(entries.filter(e => e.category).map(e => e.category!.trim()).filter(Boolean)));
        return unique.sort((a, b) => a.localeCompare(b, 'es-ES'));
    }, [entries]);

    const visibleCategories = useMemo(() => {
        if (!categorySearchQuery.trim()) return categories;
        return categories.filter(c => c.toLowerCase().includes(categorySearchQuery.toLowerCase()));
    }, [categories, categorySearchQuery]);

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const matchesText =
                e.wordFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.wordTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.category ?? '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategories.length === 0
                ? true
                : selectedCategories.includes((e.category ?? '').trim());

            const matchesFavorite = favoriteFilter === 'all' ? true : !!e.isFavorite;

            return matchesText && matchesCategory && matchesFavorite;
        });
    }, [searchQuery, selectedCategories, favoriteFilter, entries]);

    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
    const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="entry-main-layout">
            {isModalOpen && (
                <div className="entry-modal-overlay" onClick={closeModal}>
                    <form className="entry-modal-content" onSubmit={handleCreateOrUpdate} onClick={e => e.stopPropagation()}>
                        <div className="entry-modal-header">
                            <h2 className="entry-modal-title">{isEditMode ? 'EDITAR ENTRADA' : 'NUEVA ENTRADA'}</h2>
                            <button type="button" className="entry-modal-close" onClick={closeModal}>×</button>
                        </div>

                        <div className="entry-form-group">
                            <label>Palabra Origen ({languageMap[formData.languageFrom]})</label>
                            <input className="entry-modal-input" required value={formData.wordFrom} onChange={e => setFormData({ ...formData, wordFrom: e.target.value })} placeholder="Hello" />
                        </div>


                        <div className="entry-form-group">
                            <label>Palabra Destino ({languageMap[formData.languageTo]})</label>
                            <input className="entry-modal-input" required value={formData.wordTo} onChange={e => setFormData({ ...formData, wordTo: e.target.value })} placeholder="Hola" />
                        </div>


                        <input type="hidden" name="languageFrom" value={formData.languageFrom} />
                        <input type="hidden" name="languageTo" value={formData.languageTo} />

                        <div className="entry-form-group">
                            <label>Categoría</label>
                            <input className="entry-modal-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Mobiliario" />
                        </div>

                        <div className="entry-form-group">
                            <label>Notas</label>
                            <textarea className="entry-modal-input" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Contexto adicional" rows={3} />
                        </div>

                        <div className="entry-form-group entry-favorite-row">
                            <label>
                                <input type="checkbox" checked={formData.isFavorite} onChange={e => setFormData({ ...formData, isFavorite: e.target.checked })} /> Marcar como favorito
                            </label>
                        </div>

                        <div className="entry-modal-actions">
                            <button type="submit" className="entry-btn-confirm">{isEditMode ? 'Actualizar' : 'Crear'}</button>
                        </div>
                    </form>
                </div>
            )}

            {contextMenu.visible && contextMenu.item && (
                <div className="entry-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => contextMenu.item && openEditModal(contextMenu.item)}>Editar</button>
                    <button onClick={() => contextMenu.item && openDeleteConfirm(contextMenu.item)}>Eliminar</button>
                </div>
            )}

            {isDeleteConfirmOpen && selectedEntry && (
                <div className="entry-modal-overlay" onClick={() => setIsDeleteConfirmOpen(false)}>
                    <div className="entry-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="entry-modal-header">
                            <h2 className="entry-modal-title">CONFIRMAR BORRADO</h2>
                            <button type="button" className="entry-modal-close" onClick={() => setIsDeleteConfirmOpen(false)}>×</button>
                        </div>
                        <p>¿Seguro que quieres eliminar la entrada <strong>{selectedEntry.wordFrom} → {selectedEntry.wordTo}</strong>?</p>
                        <p className="entry-delete-warning">Se eliminará permanentemente.</p>
                        <div className="entry-modal-actions">
                            <button type="button" className="entry-btn-cancel" onClick={() => setIsDeleteConfirmOpen(false)}>Cancelar</button>
                            <button type="button" className="entry-btn-confirm" onClick={handleDelete}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            <main className="entry-main-content">
                <header className="entry-section-header">
                    <h2 className="entry-section-title">ENTRADAS DE {dictionary?.name ? dictionary.name.toUpperCase() : 'DICCIONARIO'}</h2>
                    <button className="entry-btn-create" onClick={() => {
                        if (dictionary) {
                            setFormData({
                                ...defaultFormData,
                                languageFrom: dictionary.languageFrom,
                                languageTo: dictionary.languageTo,
                            });
                        } else {
                            resetFormData();
                        }
                        setIsModalOpen(true);
                    }}>+ NUEVA ENTRADA</button>
                </header>

                <section className="entry-search-bar">
                    <div className="entry-search-container entry-search-large">
                        <input className="entry-search-input" type="text" placeholder="Escribe aquí la palabra o frase..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ textIndent: '0px' }} />
                        <span className="entry-search-line"></span>
                    </div>
                </section>

                <section className="entry-dashboard-actions">
                    <div className="entry-category-filter" ref={categoryRef}>
                        <input
                            className="entry-search-input"
                            type="text"
                            placeholder="Filtrar categorías..."
                            value={categorySearchQuery}
                            onChange={e => {
                                setCategorySearchQuery(e.target.value);
                                setCategoryDropdownOpen(true);
                            }}
                            onFocus={() => setCategoryDropdownOpen(true)}
                        />

                        <div className="entry-category-selected">
                            {selectedCategories.map(cat => (
                                <span key={cat} className="entry-category-chip">
                                    {cat}
                                    <button type="button" onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}>×</button>
                                </span>
                            ))}
                        </div>

                        <div className={`entry-category-dropdown ${categoryDropdownOpen ? 'open' : ''}`}>
                            <div className="entry-category-actions">
                                <button className="entry-category-small-btn" type="button" onClick={() => { setSelectedCategories([]); setCategoryDropdownOpen(true); }}>Quitar todas</button>
                            </div>
                            <div className="entry-category-divider"></div>
                            {visibleCategories.length > 0 ? visibleCategories.map(cat => (
                                <label className="entry-category-option" key={cat}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat)}
                                        onChange={() => {
                                            setSelectedCategories(prev =>
                                                prev.includes(cat)
                                                    ? prev.filter(c => c !== cat)
                                                    : [...prev, cat]
                                            );
                                            setCategoryDropdownOpen(true);
                                        }}
                                    />
                                    {cat}
                                </label>
                            )) : <span className="entry-category-empty">No hay categorías</span>}
                        </div>
                    </div>

                    <div className="entry-favorites-filter">
                        <button className={`entry-favorites-btn ${favoriteFilter === 'only' ? 'active' : ''}`} onClick={() => setFavoriteFilter(prev => prev === 'only' ? 'all' : 'only')}>Ver Favoritos</button>
                        <button className="entry-favorites-btn entry-clear-btn" onClick={() => { setCategorySearchQuery(''); setSelectedCategories([]); setFavoriteFilter('all'); setCategoryDropdownOpen(false); }}>Borrar filtros</button>
                    </div>
                </section>

                <footer className="entry-pagination-wrapper">
                    <div className="entry-items-per-page">
                        <span>MOSTRAR:</span>
                        {[8, 12, 16].map(num => (
                            <button key={num} className={`entry-num-btn ${itemsPerPage === num ? 'active' : ''}`} onClick={() => setItemsPerPage(num)}>{num}</button>
                        ))}
                    </div>
                    <div className="entry-pagination-container">
                        <button className="entry-pagi-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>ANTERIOR</button>
                        <div className="entry-page-info"><span className="entry-current-number">{currentPage}</span> DE {totalPages}</div>
                        <button className="entry-pagi-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>SIGUIENTE</button>
                    </div>
                </footer>

                <div className="entry-generic-grid">
                    {loading ? (
                        <div className="entry-list-status">CARGANDO ENTRADAS...</div>
                    ) : paginatedEntries.length > 0 ? (
                        paginatedEntries.map(entry => (
                            <div key={entry.id} className="entry-generic-card" onContextMenu={e => {
                                e.preventDefault(); e.stopPropagation();
                                setContextMenu({ visible: true, x: e.clientX, y: e.clientY, item: entry });
                            }}>
                                <div className="entry-card-header-info">
                                    <span className="entry-card-meta">{languageMap[entry.languageFrom]} → {languageMap[entry.languageTo]}</span>
                                    <button className={`entry-card-star ${entry.isFavorite ? 'filled' : 'empty'}`} onClick={() => toggleFavorite(entry)} aria-label="Alternar favorito">
                                        {entry.isFavorite ? '★' : '☆'}
                                    </button>
                                </div>
                                <div className="entry-card-body">
                                    <h3 className="entry-card-title">{entry.wordFrom.toUpperCase()} → {entry.wordTo.toUpperCase()}</h3>
                                    <p className="entry-card-subtitle">{entry.category || ''}</p>
                                    {entry.notes && <p className="entry-card-note">{entry.notes}</p>}
                                </div>
                                <div className="entry-card-footer column">
                                    <span className="entry-card-date subtle">CREADO: {formatDate(entry.createdAt)}</span>
                                    <span className="entry-card-date subtle">ACTUALIZADO: {formatDate(entry.updatedAt)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="entry-list-status">NO HAY ENTRADAS EN ESTE DICCIONARIO.</div>
                    )}
                </div>

            </main>
        </div>
    );
}
