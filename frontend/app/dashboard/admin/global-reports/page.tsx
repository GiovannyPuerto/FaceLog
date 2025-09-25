"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

const StatCard = ({ title, value, extra = null }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-blue-400 mt-2">{value}</p>
        {extra && <p className="text-sm text-gray-500 mt-1">{extra}</p>}
    </div>
);

export default function GlobalReportsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fichas, setFichas] = useState([]);
    const [filters, setFilters] = useState({ date_from: '', date_to: '', ficha: '' });

    const fetchPageData = async () => {
        setLoading(true);
        try {
            const [statsResponse, fichasResponse] = await Promise.all([
                api.get('attendance/report/global/', { params: filters }),
                api.get('attendance/fichas/')
            ]);
            
            setStats(statsResponse.data);
            setFichas(fichasResponse.data.results || []);
            setError(null);

        } catch (err) {
            console.error("Failed to fetch page data", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)){
                setError("No tienes permiso para ver los reportes.");
            } else {
                setError("No se pudieron cargar los datos de la página.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) { // Only fetch data if user is authenticated
            fetchPageData();
        }
    }, [user]); // Re-run when user object changes

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchPageData();
    };

    const handleDownloadPdf = () => {
        const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/attendance/report/global/pdf/`;
        const token = localStorage.getItem('authToken');
        // You can also pass filters to the PDF endpoint if it supports it
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Reportes Globales</h1>
            </div>

            {/* Filter Section */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Ficha</label>
                    <select name="ficha" value={filters.ficha} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                        <option value="">Todas</option>
                        {fichas.map(f => <option key={f.id} value={f.id}>{f.numero_ficha}</option>)}
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
                <div className="text-center p-10">Cargando reportes...</div>
            ) : error ? (
                <div className="text-center p-10 text-red-500">{error}</div>
            ) : stats && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title="Total Fichas" value={stats.total_fichas} />
                        <StatCard title="Total Instructores" value={stats.total_instructors} />
                        <StatCard title="Total Aprendices" value={stats.total_students} />
                        <StatCard title="Total Sesiones" value={stats.total_sessions} />
                        <StatCard title="Total Excusas" value={stats.total_excuses} />
                        <StatCard title="Excusas Pendientes" value={stats.pending_excuses_count} />
                        <StatCard title="Excusas Aprobadas" value={stats.approved_excuses_count} />
                        <StatCard title="Excusas Rechazadas" value={stats.rejected_excuses_count} />
                        <StatCard title="% Asistencia General" value={`${stats.overall_attendance_percentage}%`} />
                    </div>

                    {/* Attendance by Status */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Asistencia por Estado</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(stats.attendance_by_status).map(([status, count]) => (
                                <StatCard key={status} title={status.charAt(0).toUpperCase() + status.slice(1)} value={count} />
                            ))}
                        </div>
                    </div>

                    {/* Top 5 Fichas con Más Inasistencias */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Top 5 Fichas con Más Inasistencias</h2>
                        <ul className="list-disc list-inside text-gray-300">
                            {stats.fichas_con_mas_inasistencias.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Top 5 Estudiantes con Más Inasistencias */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Top 5 Estudiantes con Más Inasistencias</h2>
                        <ul className="list-disc list-inside text-gray-300">
                            {stats.students_con_mas_inasistencias.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Top 5 Instructores con Más Sesiones */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Top 5 Instructores con Más Sesiones</h2>
                        <ul className="list-disc list-inside text-gray-300">
                            {stats.instructores_con_mas_sesiones.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <button onClick={handleDownloadPdf} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Descargar PDF del Reporte Actual</button>
                </div>
            )}
        </div>
    );
}