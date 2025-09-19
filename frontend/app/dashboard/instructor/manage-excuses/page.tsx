
"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

// Simple Modal Component
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
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

export default function ManageExcusesPage() {
    const { user } = useAuth();
    const [excuses, setExcuses] = useState([]);
    const [students, setStudents] = useState([]); // New state for students
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentExcuseToReview, setCurrentExcuseToReview] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [filters, setFilters] = useState({ student: '', date_from: '', date_to: '', status: 'pending' }); // Default to pending excuses

    const fetchExcuses = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            // Backend filters excuses for the instructor's fichas
            const response = await api.get('excuses/', { params: filters });
            setExcuses(response.data.results || response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch excuses", err);
            setError("No se pudieron cargar las excusas.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            const response = await api.get('auth/users/', { params: { role: 'student' } });
            setStudents(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch students for filter", err);
        }
    };

    useEffect(() => {
        fetchExcuses();
        fetchStudents();
    }, [user]);

    const handleOpenReviewModal = (excuse) => {
        setCurrentExcuseToReview(excuse);
        setReviewComment(excuse.review_comment || '');
        setIsReviewModalOpen(true);
    };

    const handleReviewExcuse = async (newStatus) => {
        if (!currentExcuseToReview) return;
        try {
            const response = await api.patch(`excuses/${currentExcuseToReview.id}/`, { 
                status: newStatus,
                review_comment: reviewComment
            });
            // Update the list to reflect the change
            setExcuses(excuses.map(ex => ex.id === currentExcuseToReview.id ? response.data : ex));
            setIsReviewModalOpen(false);
            setCurrentExcuseToReview(null);
            setReviewComment('');
        } catch (err) {
            alert(`Error al ${newStatus} la excusa: ${err.response?.data?.detail || 'Error desconocido'}`);
            console.error(`Failed to ${newStatus} excuse`, err);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchExcuses();
    };

    if (loading) {
        return <div className="text-center p-10">Cargando excusas...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">Gestionar Excusas</h1>
                
                <div className="bg-gray-800 shadow-lg rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-200">Excusas de mis Fichas</h2>
                        
                    </div>

                    {/* Filter Section */}
                    <div className="bg-gray-800 p-4 rounded-lg space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300">Aprendiz</label>
                            <select name="student" value={filters.student} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                                <option value="">Todos</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300">Estado</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                                <option value="">Todos</option>
                                <option value="pending">Pendiente</option>
                                <option value="approved">Aprobada</option>
                                <option value="rejected">Rechazada</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300">Desde (Sesión)</label>
                            <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300">Hasta (Sesión)</label>
                            <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                        </div>
                        <button onClick={handleApplyFilters} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filtrar</button>
                    </div>

                    <ul className="divide-y divide-gray-700">
                        {excuses.length > 0 ? (
                            excuses.map(excuse => (
                                <li key={excuse.id} className="p-4">
                                    <div className="flex flex-col sm:flex-row justify-between">
                                        <div>
                                            <p className="font-bold text-white">{excuse.student.first_name} {excuse.student.last_name}</p>
                                            <p className="text-sm text-gray-400">Ficha: {excuse.session.ficha.numero_ficha}</p>
                                            <p className="text-sm text-gray-300 mt-2">Motivo: {excuse.reason}</p>
                                            {excuse.attachment && <a href={excuse.attachment} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-1 inline-block">Ver Adjunto</a>}
                                            {excuse.review_comment && <p className="text-xs text-gray-500 mt-2">Comentario: {excuse.review_comment}</p>}
                                        </div>
                                        <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-6 text-right">
                                            <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(excuse.status)}`}>
                                                {excuse.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-2">Sesión: {new Date(excuse.session.date).toLocaleDateString('es-CO')}</p>
                                            {excuse.status === 'pending' && (
                                                <button onClick={() => handleOpenReviewModal(excuse)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">Revisar</button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="p-6 text-center text-gray-400">No se encontraron excusas con el filtro seleccionado.</p>
                        )}
                    </ul>
                </div>
            </div>

            {isReviewModalOpen && currentExcuseToReview && (
                <Modal onClose={() => setIsReviewModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">Revisar Excusa</h2>
                    <p className="text-gray-300 mb-2">Aprendiz: {currentExcuseToReview.student.first_name} {currentExcuseToReview.student.last_name}</p>
                    <p className="text-gray-300 mb-4">Sesión: {currentExcuseToReview.session.ficha.numero_ficha} - {new Date(currentExcuseToReview.session.date).toLocaleDateString('es-CO')}</p>
                    <p className="text-gray-300 mb-4">Motivo: {currentExcuseToReview.reason}</p>
                    {currentExcuseToReview.document && (
                        <a href={currentExcuseToReview.document} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Ver Adjunto</a>
                    )}
                    <div className="mt-4">
                        <label htmlFor="review_comment" className="block text-sm font-medium text-gray-300">Comentario de Revisión (Opcional)</label>
                        <textarea id="review_comment" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows="3" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => handleReviewExcuse('approved')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Aprobar</button>
                        <button type="button" onClick={() => handleReviewExcuse('rejected')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Rechazar</button>
                    </div>
                </Modal>
            )}
        </>
    );
}
