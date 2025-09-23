"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../lib/api'; // Adjust path as needed
import useAuth from '../../../../../hooks/useAuth'; // Adjust path as needed

export default function FichaReportPage() {
    const { user } = useAuth();
    const params = useParams();
    const fichaId = params.id;

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        if (!user || user.role !== 'instructor' || !fichaId) return;
        console.log("Fetching report for fichaId:", fichaId); // Add this line
        try {
            setLoading(true);
            // Assuming an API endpoint for fetching report data for a specific ficha
            const response = await api.get(`attendance/fichas/${fichaId}/attendance-report/`);
            const { ficha, sessions, students } = response.data;

            let total_students = students.length;
            let total_present = 0;
            let total_absent = 0;
            let total_late = 0;
            const detailed_records = [];

            students.forEach(student => {
                for (const sessionId in student.attendances) {
                    const status = student.attendances[sessionId];
                    const session = sessions.find(s => s.id === parseInt(sessionId));

                    if (status === 'present') total_present++;
                    else if (status === 'absent') total_absent++;
                    else if (status === 'late') total_late++;

                    if (session) {
                        detailed_records.push({
                            student_name: student.full_name,
                            date: session.date,
                            status: status,
                            time: session.start_time, // Using start_time as time for now
                        });
                    }
                }
            });

            setReportData({
                ficha: ficha,
                total_students: total_students,
                total_present: total_present,
                total_absent: total_absent,
                total_late: total_late,
                detailed_records: detailed_records,
            });
            setError(null);
        } catch (err) {
            console.error("Failed to fetch report data", err);
            setError("No se pudo cargar el reporte de la ficha.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [user, fichaId]);

    return (
        <>
            <style jsx global>{`
                /* Re-using styles from my-fichas/page.tsx for consistency */
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

                .report-section {
                    background: var(--bg-card);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    padding: 2rem;
                    margin-top: 2rem;
                }

                .report-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .summary-item {
                    background: var(--bg-secondary);
                    border-radius: 15px;
                    padding: 1.5rem;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .summary-item h3 {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                }

                .summary-item p {
                    color: var(--text-primary);
                    font-size: 2rem;
                    font-weight: 700;
                }

                .report-detail-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 2rem;
                }

                .report-detail-table th, .report-detail-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--divider-color);
                }

                .report-detail-table th {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 0.9rem;
                }

                .report-detail-table td {
                    color: var(--text-secondary);
                }

                .report-detail-table tbody tr:hover {
                    background: var(--bg-secondary);
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
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
                    margin-bottom: 2rem;
                }

                .back-button:hover {
                    background: var(--button-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                @media (max-width: 768px) {
                    .fichas-container {
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                }
            `}</style>

            <div className="fichas-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Link href="/dashboard/instructor/my-fichas" className="back-button">
                        ← Volver a Mis Fichas
                    </Link>
                    <h1 className="modern-title">
                        Reporte de Ficha {reportData && reportData.ficha ? reportData.ficha.numero_ficha : fichaId}
                    </h1>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">Cargando reporte...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">Error: {error}</div>
                        </div>
                    ) : reportData ? (
                        <div className="report-section">
                            <div className="report-summary">
                                <div className="summary-item">
                                    <h3>Total Aprendices</h3>
                                    <p>{reportData.total_students}</p>
                                </div>
                                <div className="summary-item">
                                    <h3>Asistencias</h3>
                                    <p>{reportData.total_present}</p>
                                </div>
                                <div className="summary-item">
                                    <h3>Ausencias</h3>
                                    <p>{reportData.total_absent}</p>
                                </div>
                                <div className="summary-item">
                                    <h3>Retardos</h3>
                                    <p>{reportData.total_late}</p>
                                </div>
                            </div>

                            {reportData.detailed_records && reportData.detailed_records.length > 0 && (
                                <div className="report-detail-table-container">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Registros Detallados</h2>
                                    <table className="report-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Aprendiz</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Hora</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.detailed_records.map((record, index) => (
                                                <tr key={index}>
                                                    <td>{record.student_name}</td>
                                                    <td>{new Date(record.date).toLocaleDateString('es-CO')}</td>
                                                    <td>{record.status.status}</td>
                                                    <td>{new Date(record.time).toLocaleTimeString('es-CO')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-container">
                            <div className="empty-icon"></div>
                            <div className="empty-text">No hay datos de reporte disponibles para esta ficha.</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
