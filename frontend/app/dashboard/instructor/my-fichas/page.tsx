"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

export default function MyFichasPage() {
    const { user } = useAuth();
    const [fichas, setFichas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ numero_ficha: '', programa_formacion: '' });

    const fetchFichas = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/my-fichas/', { params: filters });
            setFichas(response.data.results || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch fichas", err);
            setError("No se pudieron cargar las fichas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFichas();
    }, [user]);

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
                    --text-accent: #667eea;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --success-gradient: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
                    --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    --warning-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    --input-bg: #ffffff;
                    --input-border: #e9ecef;
                    --divider-color: #e9ecef;
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --bg-secondary: #21262d;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --text-muted: #6e7681;
                    --text-accent: #58a6ff;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --success-gradient: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --info-gradient: linear-gradient(135deg, #58a6ff 0%, #388bfd 100%);
                    --warning-gradient: linear-gradient(135deg, #d29922 0%, #bb8009 100%);
                    --input-bg: #21262d;
                    --input-border: #30363d;
                    --divider-color: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                    min-height: 100vh;
                }

                .fichas-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px 20px;
                    transition: background-color 0.3s ease;
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
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -15px;
                    left: 0;
                    width: 120px;
                    height: 5px;
                    background: var(--button-gradient);
                    border-radius: 3px;
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

                .form-input {
                    background: var(--input-bg);
                    border: 2px solid var(--input-border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--text-accent);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    transform: translateY(-1px);
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
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .modern-button:hover {
                    background: var(--button-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .fichas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 2rem;
                }

                .ficha-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .ficha-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                    background: var(--info-gradient);
                }

                .ficha-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-hover);
                    border-color: var(--text-accent);
                }

                .ficha-header {
                    padding: 1.5rem 1.5rem 1rem;
                }

                .ficha-numero {
                    color: var(--text-accent);
                    font-weight: 800;
                    font-size: 1.4rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .ficha-programa {
                    color: var(--text-primary);
                    font-size: 1.1rem;
                    font-weight: 600;
                    line-height: 1.4;
                    margin-bottom: 1rem;
                }

                .ficha-details {
                    padding: 0 1.5rem;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--divider-color);
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }

                .detail-item:last-child {
                    border-bottom: none;
                }

                .detail-label {
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .detail-value {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .ficha-footer {
                    padding: 1rem 1.5rem 1.5rem;
                    background: var(--bg-secondary);
                    border-top: 2px solid var(--divider-color);
                }

                .students-count {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    font-size: 1.1rem;
                }

                .students-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--success-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }

                .loading-container, .error-container, .empty-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                    margin: 2rem 0;
                }

                .loading-text, .error-text, .empty-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .error-text {
                    color: #f85149;
                }

                .loading-icon, .error-icon, .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
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

                @media (max-width: 768px) {
                    .fichas-container {
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .filter-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .fichas-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
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
                    .ficha-header {
                        padding: 1rem 1rem 0.75rem;
                    }
                    
                    .ficha-details {
                        padding: 0 1rem;
                    }
                    
                    .ficha-footer {
                        padding: 0.75rem 1rem 1rem;
                    }
                    
                    .detail-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.25rem;
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


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fichas.length > 0 ? (
                    fichas.map(ficha => (
                        <div key={ficha.id} className="bg-gray-800 shadow-lg rounded-lg p-6 hover:bg-gray-700 transition-transform hover:-translate-y-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-blue-400">Ficha: {ficha.numero_ficha}</h2>
                                <p className="text-gray-300 mt-2">{ficha.programa_formacion}</p>
                                <div className="text-sm text-gray-400 mt-4">
                                    <p><strong>Jornada:</strong> {ficha.jornada}</p>
                                    <p><strong>Inicio:</strong> {new Date(ficha.fecha_inicio).toLocaleDateString('es-CO')}</p>
                                    <p><strong>Fin:</strong> {new Date(ficha.fecha_fin).toLocaleDateString('es-CO')}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <h3 className="text-md font-semibold text-gray-200">Aprendices: {ficha.students.length}</h3>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                                <Link href={`/dashboard/fichas/${ficha.id}/report`} className="text-blue-400 hover:text-blue-300 font-semibold">Ver Reporte</Link>

            <div className="fichas-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                         Mis Fichas
                    </h1>

                    {/* Filter Section */}
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
                                <button onClick={handleApplyFilters} className="modern-button">
                                     Filtrar
                                </button>

                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">Cargando mis fichas...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">Error: {error}</div>
                        </div>
                    ) : (
                        <div className="fichas-grid">
                            {fichas.length > 0 ? (
                                fichas.map(ficha => (
                                    <div key={ficha.id} className="ficha-card">
                                        <div className="ficha-header">
                                            <h2 className="ficha-numero">
                                                 Ficha: {ficha.numero_ficha}
                                            </h2>
                                            <p className="ficha-programa">{ficha.programa_formacion}</p>
                                        </div>
                                        
                                        <div className="ficha-details">
                                            <div className="detail-item">
                                                <span className="detail-label"> Jornada:</span>
                                                <span className="detail-value">{ficha.jornada}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label"> Inicio:</span>
                                                <span className="detail-value">
                                                    {new Date(ficha.fecha_inicio).toLocaleDateString('es-CO')}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label"> Fin:</span>
                                                <span className="detail-value">
                                                    {new Date(ficha.fecha_fin).toLocaleDateString('es-CO')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="ficha-footer">
                                            <div className="students-count">
                                                <div className="students-icon"></div>
                                                <span>Aprendices: {ficha.students.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-container" style={{ gridColumn: '1 / -1' }}>
                                    <div className="empty-icon"></div>
                                    <div className="empty-text">No tienes fichas asignadas.</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
