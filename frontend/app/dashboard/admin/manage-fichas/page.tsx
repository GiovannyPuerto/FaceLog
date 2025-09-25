"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

// Modal Component with theme support
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
            {children}
        </div>
    </div>
);

export default function ManageFichasPage() {
    const { user } = useAuth();
    const [fichas, setFichas] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFicha, setEditingFicha] = useState(null);
    const [filters, setFilters] = useState({ numero_ficha: '', programa_formacion: '', instructor: '' });

    const fetchFichas = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/fichas/', { params: filters });
            setFichas(response.data.results || []);
        } catch (err) {
            setError("No se pudieron cargar las fichas.");
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            const response = await api.get('auth/users/', { params: { role: 'instructor' } });
            setInstructors(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch instructors for filter", err);
        }
    };

    useEffect(() => {
        fetchFichas();
        fetchInstructors();
    }, [user]);

    const handleDelete = async (fichaId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta ficha?")) return;
        try {
            await api.delete(`attendance/fichas/${fichaId}/`);
            setFichas(fichas.filter(f => f.id !== fichaId));
        } catch (err) {
            alert("No se pudo eliminar la ficha.");
        }
    };

    const handleOpenModal = (ficha = null) => {
        setEditingFicha(ficha);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFicha(null);
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            numero_ficha: formData.get('numero_ficha'),
            programa_formacion: formData.get('programa_formacion'),
            jornada: formData.get('jornada'),
            instructor_ids: formData.getAll('instructor_ids')
        };
        
        if (!data.numero_ficha || !data.programa_formacion) {
            alert("Número de ficha y programa son requeridos.");
            return;
        }

        const promise = editingFicha
            ? api.patch(`attendance/fichas/${editingFicha.id}/`, data)
            : api.post('attendance/fichas/', data);

        try {
            await promise;
            await fetchFichas();
            handleCloseModal();
        } catch (err) {
            alert(`Error al guardar la ficha: ${err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido'}`);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchFichas();
    };

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --bg-secondary: #e9ecef;
                    --text-primary: #232129ff;
                    --text-secondary: #6c757d;
                    --text-muted: #8b949e;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --button-success: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    --button-success-hover: linear-gradient(135deg, #1e7e34 0%, #17a2b8 100%);
                    --button-secondary: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                    --button-secondary-hover: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
                    --button-warning: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
                    --button-warning-hover: linear-gradient(135deg, #e0a800 0%, #ea5b06 100%);
                    --button-danger: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
                    --button-danger-hover: linear-gradient(135deg, #c82333 0%, #dc2d1a 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --input-bg: #ffffff;
                    --input-border: #e9ecef;
                    --table-stripe: #f8f9fa;
                    --divider-color: #e9ecef;
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --bg-secondary: #21262d;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --text-muted: #6e7681;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --button-success: linear-gradient(135deg, #2ea043 0%, #238636 100%);
                    --button-success-hover: linear-gradient(135deg, #2d8f3f 0%, #1f6929 100%);
                    --button-secondary: linear-gradient(135deg, #6e7681 0%, #484f58 100%);
                    --button-secondary-hover: linear-gradient(135deg, #656d76 0%, #373e47 100%);
                    --button-warning: linear-gradient(135deg, #d29922 0%, #bb8009 100%);
                    --button-warning-hover: linear-gradient(135deg, #b08619 0%, #a57200 100%);
                    --button-danger: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --button-danger-hover: linear-gradient(135deg, #e03e37 0%, #c92a2a 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --input-bg: #21262d;
                    --input-border: #30363d;
                    --table-stripe: #21262d;
                    --divider-color: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                    min-height: 100vh;
                }

                /* SOLUCIÓN ESPECÍFICA PARA EL LAYOUT DEL SIDEBAR */
                .manage-fichas-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px 20px;
                    transition: background-color 0.3s ease;
                    /* Agregar margen para el sidebar */
                }

                .modern-title {
                    color: var(--text-primary);
                    font-weight: 800;
                    font-size: 2.5rem;
                    margin-bottom: 2rem;
                    position: relative;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -15px;
                    left: 0;
                    width: 150px;
                    height: 5px;
                    background: var(--button-gradient);
                    border-radius: 3px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .modern-button {
                    background: var(--button-gradient);
                    border: none;
                    border-radius: 12px;
                    padding: 12px 24px;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .modern-button:hover {
                    background: var(--button-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    color: white;
                    text-decoration: none;
                }

                .filter-section {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .filter-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .filter-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    align-items: end;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-input, .form-select {
                    background: var(--input-bg);
                    border: 2px solid var(--input-border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus, .form-select:focus {
                    outline: none;
                    border-color: var(--button-gradient);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    transform: translateY(-1px);
                }

                .table-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .table-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                    color: var(--text-primary);
                }

                .table-header {
                    background: var(--bg-secondary);
                    border-bottom: 2px solid var(--divider-color);
                }

                .table-header th {
                    padding: 1rem;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-secondary);
                }

                .table-row {
                    border-bottom: 1px solid var(--divider-color);
                    transition: all 0.3s ease;
                }

                .table-row:hover {
                    background: var(--bg-secondary);
                }

                .table-row:last-child {
                    border-bottom: none;
                }

                .table-cell {
                    padding: 1rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .action-button {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .action-edit {
                    background: var(--button-warning);
                    color: white;
                }

                .action-edit:hover {
                    background: var(--button-warning-hover);
                    transform: translateY(-1px);
                    color: white;
                    text-decoration: none;
                }

                .action-delete {
                    background: var(--button-danger);
                    color: white;
                }

                .action-delete:hover {
                    background: var(--button-danger-hover);
                    transform: translateY(-1px);
                }

                .action-report {
                    background: var(--button-gradient);
                    color: white;
                }

                .action-report:hover {
                    background: var(--button-hover);
                    transform: translateY(-1px);
                    color: white;
                    text-decoration: none;
                }

                .loading-container, .error-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                    margin: 2rem 0;
                }

                .loading-text, .error-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .error-text {
                    color: #f85149;
                }

                .loading-icon, .error-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 1rem;
                    backdrop-filter: blur(5px);
                }

                .modal-content {
                    background: var(--bg-card);
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: var(--shadow-hover);
                    border: 2px solid var(--border-color);
                    width: 100%;
                    max-width: 600px;
                    position: relative;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-close-btn:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .modal-title {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-textarea {
                    background: var(--input-bg);
                    border: 2px solid var(--input-border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    resize: vertical;
                    min-height: 100px;
                }

                .form-textarea:focus {
                    outline: none;
                    border-color: var(--button-gradient);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    transform: translateY(-1px);
                }

                .form-multiselect {
                    background: var(--input-bg);
                    border: 2px solid var(--input-border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    min-height: 120px;
                }

                .form-multiselect:focus {
                    outline: none;
                    border-color: var(--button-gradient);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    transform: translateY(-1px);
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }

                .secondary-button {
                    background: var(--button-secondary);
                }

                .secondary-button:hover {
                    background: var(--button-secondary-hover);
                }

                .success-button {
                    background: var(--button-success);
                }

                .success-button:hover {
                    background: var(--button-success-hover);
                }

                .theme-toggle {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 50%;
                    width: 55px;
                    height: 55px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-card);
                    font-size: 1.2rem;
                    z-index: 9999;
                }

                .theme-toggle:hover {
                    transform: scale(1.1) rotate(180deg);
                    box-shadow: var(--shadow-hover);
                }

                /* Responsive */
                @media (max-width: 991.98px) {
                    .manage-fichas-container {
                        
                    }
                }

                @media (max-width: 767.98px) {
                    .manage-fichas-container {
                        margin-left: 0 !important;
                        padding: 20px 15px;
                        overflow-x: ;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .page-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .filter-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .table-card {
                        overflow-x: auto;
                    }
                    
                    .modern-table {
                        width:  100% !important;
                        min-width:500px !important;
                        
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    
                    .modal-actions {
                        justify-content: center;
                    }
                    
                    .theme-toggle {
                        top: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .modal-content {
                        padding: 1.5rem;
                    }
                    
                    .table-header th,
                    .table-cell {
                        padding: 0.75rem;
                    }
                }
            `}</style>

            {/* Theme Toggle */}
            <div 
                className="theme-toggle"
                onClick={() => {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    document.documentElement.setAttribute('data-theme', 
                        currentTheme === 'dark' ? 'light' : 'dark'
                    );
                }}
                title="Cambiar tema"
            >
                🌓
            </div>

            <div className="manage-fichas-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">Cargando fichas...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">{error}</div>
                        </div>
                    ) : (
                        <>
                            <div className="page-header">
                                <h1 className="modern-title">
                                    Gestionar Fichas
                                </h1>
                                <button onClick={() => handleOpenModal()} className="modern-button">
                                    Crear Ficha
                                </button>
                            </div>

                            <div className="filter-section">
                                <div className="filter-grid">
                                    <div className="form-group">
                                        <label className="form-label">Número de Ficha</label>
                                        <input 
                                            type="text" 
                                            name="numero_ficha" 
                                            value={filters.numero_ficha} 
                                            onChange={handleFilterChange} 
                                            className="form-input"
                                            placeholder="Buscar por número..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Programa</label>
                                        <input 
                                            type="text" 
                                            name="programa_formacion" 
                                            value={filters.programa_formacion} 
                                            onChange={handleFilterChange} 
                                            className="form-input"
                                            placeholder="Buscar por programa..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Instructor</label>
                                        <select 
                                            name="instructor" 
                                            value={filters.instructor} 
                                            onChange={handleFilterChange} 
                                            className="form-select"
                                        >
                                            <option value="">Todos</option>
                                            {instructors.map(inst => (
                                                <option key={inst.id} value={inst.id}>
                                                    {inst.first_name} {inst.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <button onClick={handleApplyFilters} className="modern-button">
                                            Filtrar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="table-card">
                                <table className="modern-table">
                                    <thead className="table-header">
                                        <tr>
                                            <th>Número</th>
                                            <th>Programa</th>
                                            <th>Jornada</th>
                                            <th>Instructores</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fichas.map(ficha => (
                                            <tr key={ficha.id} className="table-row">
                                                <td className="table-cell">{ficha.numero_ficha}</td>
                                                <td className="table-cell">{ficha.programa_formacion}</td>
                                                <td className="table-cell">{ficha.jornada || 'N/A'}</td>
                                                <td className="table-cell">
                                                    {ficha.instructors?.map(i => i.username).join(', ') || 'N/A'}
                                                </td>
                                                <td className="table-cell">
                                                    <div className="action-buttons">
                                                        <button 
                                                            onClick={() => handleOpenModal(ficha)} 
                                                            className="action-button action-edit"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(ficha.id)} 
                                                            className="action-button action-delete"
                                                        >
                                                            Eliminar
                                                        </button>
                                                        <Link 
                                                            href={`/dashboard/fichas/${ficha.id}/report`} 
                                                            className="action-button action-report"
                                                        >
                                                            Reporte
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="modal-title">
                        {editingFicha ? 'Editar' : 'Crear'} Ficha
                    </h2>
                    <form onSubmit={handleSave} className="modal-form">
                        <div className="form-group">
                            <label className="form-label">Número de Ficha</label>
                            <input 
                                type="text" 
                                name="numero_ficha" 
                                defaultValue={editingFicha?.numero_ficha} 
                                className="form-input" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Programa de Formación</label>
                            <input 
                                type="text" 
                                name="programa_formacion" 
                                defaultValue={editingFicha?.programa_formacion} 
                                className="form-input" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Jornada</label>
                            <input 
                                type="text" 
                                name="jornada" 
                                defaultValue={editingFicha?.jornada} 
                                className="form-input" 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instructores Asignados</label>
                            <select 
                                multiple 
                                name="instructor_ids" 
                                defaultValue={editingFicha?.instructors?.map(i => i.id)} 
                                className="form-multiselect"
                            >
                                {instructors.map(inst => (
                                    <option key={inst.id} value={inst.id}>
                                        {inst.first_name} {inst.last_name} ({inst.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)} 
                                className="modern-button secondary-button"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="modern-button success-button"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}