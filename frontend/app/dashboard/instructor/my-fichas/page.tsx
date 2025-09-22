"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

export default function MyFichasPage() {
    const { user } = useAuth();
    const [fichas, setFichas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ numero_ficha: '', programa_formacion: '' });

    const fetchFichas = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/my-fichas/', { params: filters });
            setFichas(response.data.results || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch fichas", err);
            setError("No se pudieron cargar las fichas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFichas();
    }, [user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchFichas();
    };

    if (loading) {
        return <div className="text-center p-10">Cargando mis fichas...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Mis Fichas</h1>

            {/* Filter Section */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Número de Ficha</label>
                    <input type="text" name="numero_ficha" value={filters.numero_ficha} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300">Programa</label>
                    <input type="text" name="programa_formacion" value={filters.programa_formacion} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                </div>
                <button onClick={handleApplyFilters} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filtrar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fichas.length > 0 ? (
                    fichas.map(ficha => (
                        <div key={ficha.id} className="bg-gray-800 shadow-lg rounded-lg p-6 hover:bg-gray-700 transition-transform hover:-translate-y-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-blue-400">Ficha: {ficha.numero_ficha}</h2>
                                <p className="text-gray-300 mt-2">{ficha.programa_formacion}</p>
                                <div className="text-sm text-gray-400 mt-4">
                                    <p><strong>Jornada:</strong> {ficha.jornada}</p>
                                    <p><strong>Inicio:</strong> {new Date(ficha.fecha_inicio).toLocaleDateString('es-CO')}</p>
                                    <p><strong>Fin:</strong> {new Date(ficha.fecha_fin).toLocaleDateString('es-CO')}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <h3 className="text-md font-semibold text-gray-200">Aprendices: {ficha.students.length}</h3>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                                <Link href={`/dashboard/fichas/${ficha.id}/report`} className="text-blue-400 hover:text-blue-300 font-semibold">Ver Reporte</Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 col-span-full">No tienes fichas asignadas.</p>
                )}
            </div>
        </div>
    );
}
