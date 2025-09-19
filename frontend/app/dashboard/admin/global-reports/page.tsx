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

    // Fetch data for filters
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const fichasResponse = await api.get('attendance/fichas/');
                setFichas(fichasResponse.data.results || []);
            } catch (err) {
                console.error("Failed to fetch fichas for filters", err);
            }
        };
        if (user?.role === 'admin') fetchFilterData();
    }, [user]);

    const fetchGlobalStats = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/report/global/', { params: filters });
            setStats(response.data);
        } catch (err) {
            setError("No se pudieron cargar los reportes globales.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalStats(); // Fetch initial unfiltered stats
    }, [user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchGlobalStats();
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
                    {/* ... StatCards ... */}
                    <button onClick={handleDownloadPdf} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Descargar PDF del Reporte Actual</button>
                </div>
            )}
        </div>
    );
}