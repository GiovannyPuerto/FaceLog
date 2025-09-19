
"use client";

import { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';

// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'present':
            return 'bg-green-500';
        case 'absent':
            return 'bg-red-500';
        case 'late':
            return 'bg-yellow-500';
        case 'excused':
            return 'bg-blue-500';
        default:
            return 'bg-gray-500';
    }
};

export default function StudentDashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.role !== 'student') return;
            setLoading(true);
            try {
                const [summaryRes, logsRes] = await Promise.all([
                    api.get('attendance/dashboard/apprentice/summary/'),
                    api.get('attendance/attendance-logs/')
                ]);
                setSummary(summaryRes.data);
                setLogs(logsRes.data);
            } catch (error) {
                console.error("Failed to fetch student data", error);
            } finally {
                setLoading(false);
            }
        };

        if(user) fetchData();
    }, [user]);

    if (loading) {
        return <div className="text-center p-10">Cargando dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Mi Dashboard de Aprendiz</h1>
            
            {summary && (
                <div>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4">Mi Resumen</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-400">Porcentaje de Asistencia</h3>
                            <p className="text-4xl font-bold text-green-400 mt-2">{summary.attendance_percentage}%</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-400">Inasistencias</h3>
                            <p className="text-4xl font-bold text-red-400 mt-2">{summary.absent_count}</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-medium text-gray-400">Llegadas Tarde</h3>
                            <p className="text-4xl font-bold text-yellow-400 mt-2">{summary.late_count}</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-semibold text-gray-300 mb-4">Mi Historial de Asistencia</h2>
                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-700">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <li key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-700 transition-colors">
                                    <div>
                                        <p className="font-semibold text-white">{new Date(log.session.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-sm text-gray-400">Ficha: {log.session.ficha.numero_ficha}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {log.check_in_time && (
                                            <span className="text-sm text-gray-400">Hora: {new Date(log.check_in_time).toLocaleTimeString()}</span>
                                        )}
                                        <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(log.status)}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="p-4 text-gray-400">No se encontraron registros de asistencia.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
