"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'approved': return 'bg-green-500';
        case 'rejected': return 'bg-red-500';
        case 'pending': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

export default function StudentExcusesPage() {
    const { user } = useAuth();
    const [excuses, setExcuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [absentSessions, setAbsentSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(''); // New state for selected session

    const fetchExcuses = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await api.get('excuses/');
            setExcuses(response.data.results || response.data);
        } catch (err) {
            setError("No se pudieron cargar las excusas.");
        } finally {
            setLoading(false);
        }
    };

    const searchParams = useSearchParams(); // New line
    const sessionIdFromUrl = searchParams.get('session_id'); // New line

    useEffect(() => {
        fetchExcuses();
        if (sessionIdFromUrl) { // New conditional logic
            handleOpenCreateModal(sessionIdFromUrl); // Call with initialSessionId
        }
    }, [user, sessionIdFromUrl]); // Add sessionIdFromUrl to dependencies

    const handleOpenCreateModal = async (initialSessionId = null) => { // Add initialSessionId parameter
        try {
            const response = await api.get('attendance/absences/');
            setAbsentSessions(response.data.results || response.data);
            setIsModalOpen(true);
            if (initialSessionId) {
                setSelectedSessionId(initialSessionId); // Set the selected session
            } else {
                setSelectedSessionId(''); // Clear if no initial ID
            }
        } catch (err) {
            setError("No se pudieron cargar las sesiones con ausencia.");
        }
    };

    const handleCreateExcuse = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            console.log("Attempting to POST to:", api.defaults.baseURL + 'excuses/'); // Add this line
            await api.post('excuses/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setIsModalOpen(false);
            fetchExcuses(); // Refresh the list
        } catch (err) {
            const apiError = err.response?.data;
            const errorMessage = apiError ? Object.values(apiError).flat().join(' ') : 'Error desconocido.';
            alert(`Error al crear la excusa: ${errorMessage}`);
        }
    };

    if (loading) {
        return <div className="text-center p-10">Cargando mis excusas...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Mis Excusas</h1>
                    <button onClick={handleOpenCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Crear Excusa
                    </button>
                </div>

                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-700">
                        {excuses.length > 0 ? (
                            excuses.map(excuse => (
                                <li key={excuse.id} className="p-4 hover:bg-gray-700 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-white">Sesión del: {new Date(excuse.session.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p className="text-sm text-gray-400 mt-1">{excuse.reason}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(excuse.status)}`}>
                                                {excuse.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-2">Enviada: {new Date(excuse.created_at).toLocaleDateString('es-CO')}</p>
                                        </div>
                                    </div>
                                    {excuse.attachment && (
                                        <a href={excuse.attachment} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-2 inline-block">Ver Adjunto</a>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p className="p-6 text-center text-gray-400">No has presentado ninguna excusa.</p>
                        )}
                    </ul>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">Crear Nueva Excusa</h2>
                    <form onSubmit={handleCreateExcuse} className="space-y-4">
                        <div>
                            <label htmlFor="session" className="block text-sm font-medium text-gray-300">Sesión con Inasistencia</label>
                            <select name="session" id="session" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required
                                value={selectedSessionId} // Bind value to state
                                onChange={(e) => setSelectedSessionId(e.target.value)} // Update state on change
                            >
                                <option value="">Seleccione una sesión</option>
                                {absentSessions.map(att => (
                                    <option key={att.session.id} value={att.session.id}>
                                        {att.session.ficha.numero_ficha} - {new Date(att.session.date).toLocaleDateString('es-CO')}
                                    </option>
                                ))}
                            </select>
                            {absentSessions.length === 0 && <p className="text-sm text-yellow-500 mt-2">No se encontraron sesiones con inasistencias para presentar excusas.</p>}
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-300">Motivo de la Excusa</label>
                            <textarea name="reason" id="reason" rows="4" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required></textarea>
                        </div>
                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-gray-300">Adjunto (Opcional)</label>
                            <input type="file" name="document" id="document" className="mt-1 w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600" />
                        </div>
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Enviar Excusa</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}