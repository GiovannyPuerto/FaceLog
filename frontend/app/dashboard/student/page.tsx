"use client";

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';
import Link from 'next/link';


// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'present':
            return 'status-present';
        case 'absent':
            return 'status-absent';
        case 'late':
            return 'status-late';
        case 'excused':
            return 'status-excused';
        default:
            return 'status-default';
    }
};

const StatCard = ({ title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-transform hover:-translate-y-1">
        <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
);


export default function StudentDashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [absences, setAbsences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || user.role !== 'student') return;
            try {
                setLoading(true);
                const [summaryRes, upcomingRes, absencesRes] = await Promise.all([
                    api.get('attendance/dashboard/apprentice/summary/'),
                    api.get('attendance/dashboard/apprentice/upcoming-sessions/'),
                    api.get('attendance/absences/')
                ]);
                setSummary(summaryRes.data);
                setUpcomingSessions(upcomingRes.data.results || upcomingRes.data);
                setAbsences(absencesRes.data.results || absencesRes.data);
            } catch (err) {
                setError("No se pudo cargar la información del dashboard.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);


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
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --success-color: #28a745;
                    --success-gradient: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
                    --danger-color: #dc3545;
                    --danger-gradient: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                    --warning-color: #ffc107;
                    --warning-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    --info-color: #17a2b8;
                    --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --success-color: #2ea043;
                    --success-gradient: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --danger-color: #f85149;
                    --danger-gradient: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --warning-color: #d29922;
                    --warning-gradient: linear-gradient(135deg, #d29922 0%, #bb8009 100%);
                    --info-color: #58a6ff;
                    --info-gradient: linear-gradient(135deg, #58a6ff 0%, #388bfd 100%);
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
                .student-dashboard-container {
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
                    display: flex;
                    align-items: center;
                    gap: 1rem;
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

                .section-title {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                    padding-left: 1rem;
                }

                .section-title::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 30px;
                    background: var(--button-gradient);
                    border-radius: 2px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
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
                    border-color: var(--stat-color);
                }

                .stat-card.success {
                    --stat-gradient: var(--success-gradient);
                    --stat-color: var(--success-color);
                }

                .stat-card.danger {
                    --stat-gradient: var(--danger-gradient);
                    --stat-color: var(--danger-color);
                }

                .stat-card.warning {
                    --stat-gradient: var(--warning-gradient);
                    --stat-color: var(--warning-color);
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
                }

                .history-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .history-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .history-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .history-item {
                    padding: 1.5rem;
                    border-bottom: 2px solid var(--divider-color);
                    transition: all 0.3s ease;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .history-item:hover {
                    background: var(--bg-secondary);
                }

                .history-item:last-child {
                    border-bottom: none;
                }

                .history-date {
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .history-ficha {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .history-details {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .history-time {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .status-badge {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: white;
                }

                .status-present {
                    background: var(--success-gradient);
                }

                .status-absent {
                    background: var(--danger-gradient);
                }

                .status-late {
                    background: var(--warning-gradient);
                }

                .status-excused {
                    background: var(--info-gradient);
                }

                .status-default {
                    background: var(--button-gradient);
                }

                .loading-container, .empty-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                    margin: 2rem 0;
                }

                .loading-text, .empty-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .loading-icon, .empty-icon {
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
                    .student-dashboard-container {
                        margin-left: 220px !important;
                    }
                }

                @media (max-width: 767.98px) {
                    .student-dashboard-container {
                        margin-left: 0 !important;
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
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
                    
                    .history-item {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .history-details {
                        width: 100%;
                        justify-content: space-between;
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
                    
                    .history-item {
                        padding: 1rem;
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

            <div className="student-dashboard-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        📊 Mi Dashboard de Aprendiz
                    </h1>
                    
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">Cargando dashboard...</div>
                        </div>
                    ) : (
                        <>
                            {summary && (
                                <div style={{ marginBottom: '3rem' }}>
                                    <h2 className="section-title">📈 Mi Resumen</h2>
                                    <div className="stats-grid">
                                        <div className="stat-card success">
                                            <div className="stat-card-body">
                                                <div className="stat-icon">📈</div>
                                                <div className="stat-content">
                                                    <div className="stat-label">Porcentaje de Asistencia</div>
                                                    <div className="stat-value">{summary.attendance_percentage}%</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card danger">
                                            <div className="stat-card-body">
                                                <div className="stat-icon">❌</div>
                                                <div className="stat-content">
                                                    <div className="stat-label">Inasistencias</div>
                                                    <div className="stat-value">{summary.absent_count}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card warning">
                                            <div className="stat-card-body">
                                                <div className="stat-icon">⏰</div>
                                                <div className="stat-content">
                                                    <div className="stat-label">Llegadas Tarde</div>
                                                    <div className="stat-value">{summary.late_count}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h2 className="section-title">📋 Mi Historial de Asistencia</h2>
                                <div className="history-card">
                                    <ul className="history-list">
                                        {logs.length > 0 ? (
                                            logs.map(log => (
                                                <li key={log.id} className="history-item">
                                                    <div>
                                                        <div className="history-date">
                                                            {new Date(log.session.date).toLocaleDateString('es-CO', { 
                                                                year: 'numeric', 
                                                                month: 'long', 
                                                                day: 'numeric' 
                                                            })}
                                                        </div>
                                                        <div className="history-ficha">
                                                            📚 Ficha: {log.session.ficha.numero_ficha}
                                                        </div>
                                                    </div>
                                                    <div className="history-details">
                                                        {log.check_in_time && (
                                                            <div className="history-time">
                                                                🕐 Hora: {new Date(log.check_in_time).toLocaleTimeString()}
                                                            </div>
                                                        )}
                                                        <span className={`status-badge ${getStatusColor(log.status)}`}>
                                                            {log.status === 'present' ? 'Presente' :
                                                             log.status === 'absent' ? 'Ausente' :
                                                             log.status === 'late' ? 'Tarde' :
                                                             log.status === 'excused' ? 'Excusado' : log.status}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <div className="empty-container">
                                                <div className="empty-icon">📭</div>
                                                <div className="empty-text">
                                                    No se encontraron registros de asistencia.
                                                </div>
                                            </div>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </>
=======
    if (loading) return <div className="text-center p-10">Cargando dashboard...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    if (!summary) return <div className="text-center p-10">No hay datos para mostrar.</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Hola, {user?.first_name || user?.username}!</h1>
                <p className="text-gray-400">Aquí tienes un resumen de tu actividad.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Asistencia General" value={`${summary.attendance_percentage}%`} />
                <StatCard title="Inasistencias" value={summary.absent_count} />
                <StatCard title="Tardanzas" value={summary.late_count} />
                <StatCard title="Excusas Pendientes" value={summary.pending_excuses} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Sessions */}
                <div className="bg-gray-800 shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Próximas Sesiones</h2>
                    {upcomingSessions.length > 0 ? (
                        <ul className="space-y-4">
                            {upcomingSessions.slice(0, 5).map(session => (
                                <li key={session.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                    <div>
                                        <p className="font-semibold text-white">{session.ficha.programa_formacion} (Ficha: {session.ficha.numero_ficha})</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(session.date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {session.start_time}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No tienes sesiones programadas.</p>
                    )}
                </div>

                {/* Recent Absences */}
                <div className="bg-gray-800 shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Inasistencias Recientes</h2>
                    {absences.length > 0 ? (
                        <ul className="space-y-4">
                            {absences.slice(0, 5).map(absence => (
                                <li key={absence.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                    <div>
                                        <p className="font-semibold text-white">Sesión del {new Date(absence.session.date).toLocaleDateString('es-CO')}</p>
                                        <p className="text-sm text-gray-400">Ficha: {absence.session.ficha.numero_ficha}</p>
                                    </div>
                                    <Link href={`/dashboard/student/excuses?session_id=${absence.session.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
                                        Justificar
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">¡Felicidades! No tienes inasistencias.</p>

                    )}
                </div>
            </div>
        </>
    );
}