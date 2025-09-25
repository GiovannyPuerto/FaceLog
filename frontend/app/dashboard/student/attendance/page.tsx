"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'present': return 'bg-green-500';
        case 'absent': return 'bg-red-500';
        case 'late': return 'bg-yellow-500';
        case 'excused': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

export default function StudentAttendancePage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ date_from: '', date_to: '', status: '' });

    const fetchAttendanceLogs = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const cleanedFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v != null && v !== '')
            );
            const response = await api.get('attendance/attendance-logs/', { params: cleanedFilters });
            setLogs(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch attendance logs", err);
            setError("No se pudo cargar el historial de asistencia.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceLogs();
    }, [user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchAttendanceLogs();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Mi Historial de Asistencia</h1>

            {/* Filter Section */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Estado</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                        <option value="">Todos</option>
                        <option value="present">Presente</option>
                        <option value="absent">Ausente</option>
                        <option value="late">Tardanza</option>
                        <option value="excused">Excusado</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Desde</label>
                    <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Hasta</label>
                    <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                </div>
                <button onClick={handleApplyFilters} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filtrar</button>
            </div>

            {loading ? (
                <div className="text-center p-10">Cargando historial de asistencia...</div>
            ) : error ? (
                <div className="text-center p-10 text-red-500">Error: {error}</div>
            ) : (
                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-700">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <li key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-700 transition-colors">
                                    <div>
                                        <p className="font-semibold text-white">Sesión: {log.session.ficha.numero_ficha} - {new Date(log.session.date).toLocaleDateString('es-CO')}</p>
                                        {log.check_in_time && log.check_in_time.trim() !== '' && (
                                            <p className="text-sm text-gray-400">Hora: {new Date(log.check_in_time).toLocaleTimeString()}</p>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(log.status)}`}>
                                        {log.status}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <p className="p-6 text-center text-gray-400">No se encontraron registros de asistencia con los filtros seleccionados.</p>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}