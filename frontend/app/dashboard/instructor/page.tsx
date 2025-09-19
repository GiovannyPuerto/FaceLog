"use client";

import { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import Link from 'next/link';
import api from '../../../lib/api';

const StatCard = ({ title, value }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-blue-400 mt-2">{value}</p>
    </div>
);

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            if (user?.role !== 'instructor') return;
            try {
                setLoading(true);
                const response = await api.get('attendance/dashboard/instructor/summary/');
                setSummary(response.data);
            } catch (error) {
                console.error("Failed to fetch instructor summary", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSummary();
    }, [user]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Dashboard del Instructor</h1>
            
            {loading ? (
                <div className="text-center p-10">Cargando resumen...</div>
            ) : summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Fichas Asignadas" value={summary.total_assigned_fichas} />
                    <StatCard title="Sesiones Hoy" value={summary.today_sessions} />
                    <StatCard title="Excusas Pendientes" value={summary.pending_excuses} />
                    <StatCard title="Total Aprendices" value={summary.total_students_in_assigned_fichas} />
                </div>
            )}

            <div className="bg-gray-800 shadow-lg rounded-lg p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-200 mb-4">Gestionar Asistencia</h2>
                <p className="text-gray-400 mb-6">Inicia una nueva sesión de asistencia para una de tus fichas y registra a los aprendices usando reconocimiento facial.</p>
                <Link 
                    href="/dashboard/instructor/attendance"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300"
                >
                    Tomar Asistencia
                </Link>
            </div>
        </div>
    );
}