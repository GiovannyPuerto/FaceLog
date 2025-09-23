"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../lib/api'; // Adjust path as needed
import useAuth from '../../../../../hooks/useAuth'; // Adjust path as needed

export default function FichaAttendancePage() {
    const { user } = useAuth();
    const params = useParams();
    const fichaId = params.id;

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [fichaDetails, setFichaDetails] = useState(null); // New state for ficha details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendance = async () => {
        if (!user || user.role !== 'instructor' || !fichaId) return;
        console.log("Fetching attendance for fichaId:", fichaId); // Add this line
        try {
            setLoading(true);
            // Assuming an API endpoint for fetching attendance for a specific ficha
            const response = await api.get(`attendance/fichas/${fichaId}/attendance-report/`);
            const { sessions, students } = response.data;

            const flattenedAttendanceRecords = [];
            students.forEach(student => {
                for (const sessionId in student.attendances) {
                    const status = student.attendances[sessionId];
                    const session = sessions.find(s => s.id === parseInt(sessionId));
                    if (session) {
                                                flattenedAttendanceRecords.push({
                            id: status.id, // Use the actual Attendance record ID from backend
                            student_name: student.full_name,
                            date: session.date,
                            status: status.status, // Use the actual status value
                            timestamp: session.start_time, // Using start_time as timestamp for now
                        });
                    }
                }
            });
            setAttendanceRecords(flattenedAttendanceRecords);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch attendance records", err);
            setError("No se pudieron cargar los registros de asistencia.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [user, fichaId]);

    const getStatusColorClass = (status) => {
        switch (status.toLowerCase()) {
            case 'present': return 'bg-green-100 text-green-800 border-green-400';
            case 'absent': return 'bg-red-100 text-red-800 border-red-400';
            case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
            case 'excused': return 'bg-blue-100 text-blue-800 border-blue-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-400';
        }
    };

    const handleStatusChange = async (attendanceId, newStatus) => {
        try {
            // Optimistically update the UI
            setAttendanceRecords(prevRecords =>
                prevRecords.map(record =>
                    record.id === attendanceId ? { ...record, status: newStatus } : record
                )
            );

            await api.patch(`/attendance/attendance-log/${attendanceId}/update/`, { status: newStatus });
            // If successful, no need to re-fetch, UI is already updated
        } catch (err) {
            console.error("Failed to update attendance status", err);
            setError("No se pudo actualizar el estado de asistencia.");
            // Revert UI on error if optimistic update was done
            fetchAttendance(); // Re-fetch to ensure data consistency
        }
    };

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

                .attendance-table-container {
                    background: var(--bg-card);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    overflow-x: auto;
                    margin-top: 2rem;
                }

                .attendance-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .attendance-table th, .attendance-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--divider-color);
                }

                .attendance-table th {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 0.9rem;
                }

                .attendance-table td {
                    color: var(--text-secondary);
                }

                .attendance-table tbody tr:hover {
                    background: var(--bg-secondary);
                }

                .status-present {
                    color: #28a745; /* Green */
                    font-weight: 600;
                }

                .status-absent {
                    color: #dc3545; /* Red */
                    font-weight: 600;
                }

                .status-late {
                    color: #ffc107; /* Yellow */
                    font-weight: 600;
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
                        Asistencia de Ficha {fichaDetails ? fichaDetails.numero_ficha : fichaId}
                    </h1>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">Cargando registros de asistencia...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">Error: {error}</div>
                        </div>
                    ) : attendanceRecords.length > 0 ? (
                        <div className="attendance-table-container">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Aprendiz</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Hora de Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceRecords.map(record => (
                                        <tr key={record.id}>
                                            <td>{record.student_name}</td>
                                            <td>{new Date(record.date).toLocaleDateString('es-CO')}</td>
                                            <td>
                                                <select
                                                    value={record.status}
                                                    onChange={(e) => handleStatusChange(record.id, e.target.value)}
                                                    className={`p-1 rounded-md border ${getStatusColorClass(record.status)}`}
                                                >
                                                    <option value="present">Presente</option>
                                                    <option value="absent">Ausente</option>
                                                    <option value="late">Tarde</option>
                                                    <option value="excused">Excusado</option>
                                                </select>
                                            </td>
                                            <td>{new Date(record.timestamp).toLocaleTimeString('es-CO')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-container">
                            <div className="empty-icon"></div>
                            <div className="empty-text">No hay registros de asistencia para esta ficha.</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
