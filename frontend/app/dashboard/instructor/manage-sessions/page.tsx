"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

// Simple Modal Component
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
            {children}
        </div>
    </div>
);

export default function ManageSessionsPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [fichas, setFichas] = useState([]); // State to hold instructor's fichas for filter/modal
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [filters, setFilters] = useState({ date: '', ficha: '', is_active: '' });

    const fetchSessions = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/sessions/', { params: filters });
            setSessions(response.data.results || response.data);
        } catch (err) {
            setError("No se pudieron cargar las sesiones.");
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructorFichas = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            const response = await api.get('attendance/my-fichas/');
            setFichas(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch instructor fichas for filter/modal", err);
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchInstructorFichas();
    }, [user]);

    const handleDelete = async (sessionId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta sesión?")) return;
        try {
            await api.delete(`attendance/sessions/${sessionId}/`);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err) {
            alert("No se pudo eliminar la sesión.");
        }
    };

    const handleOpenModal = (session = null) => {
        setEditingSession(session);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSession(null);
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Convert is_active checkbox to boolean
        data.is_active = data.is_active === 'on';

        const promise = editingSession
            ? api.patch(`attendance/sessions/${editingSession.id}/`, data)
            : api.post('attendance/sessions/', data);

        try {
            await promise;
            await fetchSessions();
            setIsModalOpen(false);
        } catch (err) {
            alert(`Error al guardar la sesión: ${err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido'}`);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchSessions();
    };

    if (loading) return <div className="text-center p-10">Cargando sesiones...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Gestionar Sesiones de Asistencia</h1>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Crear Sesión</button>
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
                        <label className="block text-sm font-medium text-gray-300">Fecha</label>
                        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Activa</label>
                        <select name="is_active" value={filters.is_active} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                            <option value="">Todas</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <button onClick={handleApplyFilters} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filtrar</button>
                </div>

                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full text-white">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-left">Ficha</th>
                                <th className="py-3 px-4 text-left">Fecha</th>
                                <th className="py-3 px-4 text-left">Hora Inicio</th>
                                <th className="py-3 px-4 text-left">Hora Fin</th>
                                <th className="py-3 px-4 text-left">Activa</th>
                                <th className="py-3 px-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map(session => (
                                <tr key={session.id}>
                                    <td className="py-3 px-4">{session.ficha.numero_ficha}</td>
                                    <td className="py-3 px-4">{session.date}</td>
                                    <td className="py-3 px-4">{session.start_time}</td>
                                    <td className="py-3 px-4">{session.end_time}</td>
                                    <td className="py-3 px-4">{session.is_active ? 'Sí' : 'No'}</td>
                                    <td className="py-3 px-4 space-x-2">
                                        <button onClick={() => handleOpenModal(session)} className="text-yellow-400">Editar</button>
                                        <button onClick={() => handleDelete(session.id)} className="text-red-500">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">{editingSession ? 'Editar' : 'Crear'} Sesión</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label htmlFor="ficha" className="block text-sm font-medium text-gray-300">Ficha</label>
                            <select name="ficha" id="ficha" defaultValue={editingSession?.ficha.id} className="w-full p-2 bg-gray-700 rounded-md" required>
                                <option value="">Seleccionar Ficha</option>
                                {fichas.map(f => <option key={f.id} value={f.id}>{f.numero_ficha}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Fecha</label>
                            <input type="date" name="date" id="date" defaultValue={editingSession?.date} className="w-full p-2 bg-gray-700 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="start_time" className="block text-sm font-medium text-gray-300">Hora de Inicio</label>
                            <input type="time" name="start_time" id="start_time" defaultValue={editingSession?.start_time} className="w-full p-2 bg-gray-700 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="end_time" className="block text-sm font-medium text-gray-300">Hora de Fin</label>
                            <input type="time" name="end_time" id="end_time" defaultValue={editingSession?.end_time} className="w-full p-2 bg-gray-700 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="permisividad" className="block text-sm font-medium text-gray-300">Permisividad (minutos)</label>
                            <input type="number" name="permisividad" id="permisividad" defaultValue={editingSession?.permisividad || 0} className="w-full p-2 bg-gray-700 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="is_active" className="block text-sm font-medium text-gray-300">Activa</label>
                            <input type="checkbox" name="is_active" id="is_active" defaultChecked={editingSession?.is_active} className="mt-1" />
                        </div>
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 px-4 py-2 rounded">Cancelar</button>
                            <button type="submit" className="bg-green-600 px-4 py-2 rounded">Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
