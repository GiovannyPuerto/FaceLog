"use client";
// frontend/app/dashboard/admin/global-reports/page.tsx
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

const StatCard = ({ title, value, extra = null, gradient, icon }) => (
    <div
        className="stat-card"
        style={{ '--stat-gradient': gradient } as React.CSSProperties & Record<string, any>}
    >
        <div className="stat-card-body">
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <div className="stat-label">{title}</div>
                <div className="stat-value">{value}</div>
                {extra && <div className="stat-extra">{extra}</div>}
            </div>
        </div>
    </div>
);

export default function GlobalReportsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fichas, setFichas] = useState([]);
    const [filters, setFilters] = useState({ date_from: '', date_to: '', ficha: '' });

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const fichasResponse = await api.get('attendance/fichas/');
                setFichas(fichasResponse.data.results || []);
            } catch (err) {
                console.error("Failed to fetch fichas for filters", err);
            }
        };
        if (user?.role === 'admin') fetchFilterData();
    }, [user]);

    const fetchGlobalStats = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/report/global/', { params: filters });
            setStats(response.data);
        } catch (err) {
            setError("No se pudieron cargar los reportes globales.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalStats();
    }, [user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchGlobalStats();
    };

    const handleDownloadPdf = () => {
        const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/attendance/report/global/pdf/`;
        const token = localStorage.getItem('authToken');
        fetch(pdfUrl, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "global_attendance_report.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
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
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --stat1-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --stat2-gradient: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
                    --stat3-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    --stat4-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    --stat5-gradient: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                    --input-bg: #ffffff;
                    --input-border: #e9ecef;
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
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --stat1-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --stat2-gradient: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --stat3-gradient: linear-gradient(135deg, #d29922 0%, #bb8009 100%);
                    --stat4-gradient: linear-gradient(135deg, #58a6ff 0%, #388bfd 100%);
                    --stat5-gradient: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --input-bg: #21262d;
                    --input-border: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                    min-height: 100vh;
                }

                /* SOLUCIÓN ESPECÍFICA PARA EL LAYOUT DEL SIDEBAR */
                .global-reports-container {
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
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -15px;
                    left: 0;
                    width: 180px;
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
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .modern-button:hover {
                    background: var(--button-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .success-button {
                    background: var(--button-success);
                }

                .success-button:hover {
                    background: var(--button-success-hover);
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
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--stat-gradient);
                }

                .stat-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-hover);
                }

                .stat-card-body {
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .stat-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: var(--stat-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    flex-shrink: 0;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.5rem;
                }

                .stat-value {
                    color: var(--text-primary);
                    font-size: 3rem;
                    font-weight: 800;
                    line-height: 1;
                    margin-bottom: 0.25rem;
                }

                .stat-extra {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .reports-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                    flex-wrap: wrap;
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
                    .global-reports-container {
                        margin-left: 220px !important;
                    }
                }

                @media (max-width: 767.98px) {
                    .global-reports-container {
                        margin-left: 0 !important;
                        padding: 20px 15px;
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
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    
                    .stat-card-body {
                        padding: 1.5rem;
                        gap: 1rem;
                    }
                    
                    .stat-icon {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                    }
                    
                    .stat-value {
                        font-size: 2.5rem;
                    }
                    
                    .reports-actions {
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
                    .stat-card-body {
                        padding: 1rem;
                    }
                    
                    .stat-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 1.2rem;
                    }
                    
                    .stat-value {
                        font-size: 2rem;
                    }
                }
            `}</style>


            <div className="global-reports-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="page-header">
                        <h1 className="modern-title">
                            Reportes Globales
                        </h1>
                    </div>

                    <div className="filter-section">
                        <div className="filter-grid">
                            <div className="form-group">
                                <label className="form-label">Ficha</label>
                                <select 
                                    name="ficha" 
                                    value={filters.ficha} 
                                    onChange={handleFilterChange} 
                                    className="form-select"
                                >
                                    <option value="">Todas</option>
                                    {fichas.map(f => (
                                        <option key={f.id} value={f.id}>{f.numero_ficha}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Desde</label>
                                <input 
                                    type="date" 
                                    name="date_from" 
                                    value={filters.date_from} 
                                    onChange={handleFilterChange} 
                                    className="form-input" 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hasta</label>
                                <input 
                                    type="date" 
                                    name="date_to" 
                                    value={filters.date_to} 
                                    onChange={handleFilterChange} 
                                    className="form-input" 
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
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">Cargando reportes...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">{error}</div>
                        </div>
                    ) : stats && (
                        <div style={{ marginBottom: '3rem' }}>
                            <div className="stats-grid">
                                <StatCard 
                                    title="Total de Estudiantes" 
                                    value={stats.total_students || '0'} 
                                    gradient="var(--stat1-gradient)"
                                    icon="👥"
                                />
                                <StatCard 
                                    title="Asistencias Totales" 
                                    value={stats.total_attendances || '0'} 
                                    gradient="var(--stat2-gradient)"
                                    icon="✅"
                                />
                                <StatCard 
                                    title="Inasistencias Totales" 
                                    value={stats.total_absences || '0'} 
                                    gradient="var(--stat5-gradient)"
                                    icon="❌"
                                />
                                <StatCard 
                                    title="Promedio de Asistencia" 
                                    value={`${stats.average_attendance || '0'}%`} 
                                    gradient="var(--stat4-gradient)"
                                    icon="📊"
                                />
                                <StatCard 
                                    title="Sesiones Realizadas" 
                                    value={stats.total_sessions || '0'} 
                                    gradient="var(--stat3-gradient)"
                                    icon="📅"
                                />
                                <StatCard 
                                    title="Fichas Activas" 
                                    value={stats.active_fichas || '0'} 
                                    gradient="var(--stat1-gradient)"
                                    icon="📚"
                                />
                            </div>

                            <div className="reports-actions">
                                <button 
                                    onClick={handleDownloadPdf} 
                                    className="modern-button success-button"
                                >
                                    Descargar PDF del Reporte Actual
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}