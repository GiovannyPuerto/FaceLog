"use client";

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';
import Link from 'next/link';

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
                                    <Link href={`/dashboard/student/manage-excuses?session_id=${absence.session.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
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
        </div>
    );
}