"use client";

import { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import Link from 'next/link';

const StatCard = ({ title, value }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-transform hover:-translate-y-1">
        <h3 className="text-lg font-medium text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-blue-400 mt-2">{value}</p>
    </div>
);

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            if (user?.role !== 'admin') return;
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('attendance/report/global/');
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch admin summary", err);
                const errorMessage = err.response?.data?.error || "No se pudieron cargar las estadísticas.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchGlobalStats();
    }, [user]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Dashboard de Administración</h1>
            
            {loading && (
                <div className="text-center p-10">Cargando resumen global...</div>
            )}

            {error && (
                <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg">
                    <h2 className="font-bold">Error al cargar el dashboard</h2>
                    <p className="mt-2">{error}</p>
                </div>
            )}

            {!loading && !error && stats && (
                <div className="space-y-8">
                    {stats.pending_excuses_count > 0 && (
                        <div className="bg-yellow-900 border border-yellow-700 text-white p-4 rounded-lg flex justify-between items-center">
                            <p className="font-bold">¡Alerta! Tienes {stats.pending_excuses_count} excusas pendientes de revisión.</p>
                            <Link href="/dashboard/instructor/manage-excuses" className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm">Revisar Excusas</Link>
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Resumen del Sistema</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link href="/dashboard/admin/manage-fichas"><StatCard title="Total de Fichas" value={stats.total_fichas} /></Link>
                            <StatCard title="Total de Instructores" value={stats.total_instructors} />
                            <Link href="/dashboard/admin/manage-users"><StatCard title="Total de Aprendices" value={stats.total_students} /></Link>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Métricas de Actividad</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Sesiones Creadas" value={stats.total_sessions} />
                            <StatCard title="Excusas Enviadas" value={stats.total_excuses} />
                            <StatCard title="Registros de Asistencia" value={stats.attendance_by_status.present + stats.attendance_by_status.absent + stats.attendance_by_status.late + stats.attendance_by_status.excused} />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Desglose de Asistencia</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <StatCard title="Presentes" value={stats.attendance_by_status.present} />
                            <StatCard title="Inasistencias" value={stats.attendance_by_status.absent} />
                            <StatCard title="Llegadas Tarde" value={stats.attendance_by_status.late} />
                            <StatCard title="Excusas Aprobadas" value={stats.attendance_by_status.excused} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}