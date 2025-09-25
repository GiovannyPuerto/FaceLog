"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';

const StatCard = ({ title, value, extra = null }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-blue-400 mt-2">{value}</p>
        {extra && <p className="text-sm text-gray-500 mt-1">{extra}</p>}
    </div>
);

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth(); // Get authLoading state
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchGlobalReportData = async () => {
            setLoading(true);

            try {
                const response = await api.get('attendance/report/global/');
                if (isMounted) {
                    console.log("Report Data:", response.data); // Add console log here
                    setReportData(response.data);
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to fetch global report", err);
                if (isMounted) {
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        setError("No tienes permiso para ver este dashboard.");
                    } else {
                        setError("No se pudo cargar el reporte global.");
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (!authLoading && user) {
            fetchGlobalReportData();
=======
            const response = await api.get('/attendance/report/global/');
            setReportData(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch global report", err);
            setError("No se pudo cargar el reporte global.");
        } finally {
            setLoading(false);

        }

        return () => {
            isMounted = false;
        };
    }, [user, authLoading]);

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
                }

                .dashboard-container {
                    padding: 30px 20px;
                }

                .modern-title {
                    font-weight: 800;
                    font-size: 2.5rem;
                    margin-bottom: 2rem;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    margin-top: 2rem;
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
            `}</style>

            <div className="dashboard-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        Dashboard de Administrador
                    </h1>

                    {loading ? (
                        <div className="loading-container">Cargando datos del dashboard...</div>
                    ) : error ? (
                        <div className="error-container">Error: {error}</div>
                    ) : reportData ? (
                        <div className="summary-grid">
                            <StatCard title="Total Fichas" value={reportData.total_fichas} />
                            <StatCard title="Total Instructores" value={reportData.total_instructors} />
                            <StatCard title="Total Aprendices" value={reportData.total_students} />
                            <StatCard title="Total Sesiones" value={reportData.total_sessions} />
                            <StatCard title="Excusas Pendientes" value={reportData.pending_excuses_count} />
                        </div>
                    ) : (
                        <div className="empty-container">No hay datos disponibles para mostrar en el dashboard.</div>
                    )}
                </div>
            </div>
        </>
    );
}