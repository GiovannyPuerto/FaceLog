"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

// A simple modal component
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
            {children}
        </div>
    </div>
);

export default function ManageFichasPage() {
    const { user } = useAuth();
    const [fichas, setFichas] = useState([]);
    const [instructors, setInstructors] = useState([]); // New state for instructors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFicha, setEditingFicha] = useState(null); // null for new, object for editing
    const [filters, setFilters] = useState({ numero_ficha: '', programa_formacion: '', instructor: '' });

    const fetchFichas = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/fichas/', { params: filters });
            setFichas(response.data.results || []);
        } catch (err) {
            setError("No se pudieron cargar las fichas.");
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            const response = await api.get('auth/users/', { params: { role: 'instructor' } });
            setInstructors(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch instructors for filter", err);
        }
    };

    useEffect(() => {
        fetchFichas();
        fetchInstructors();
    }, [user]);

    const handleDelete = async (fichaId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta ficha?")) return;
        try {
            await api.delete(`attendance/fichas/${fichaId}/`);
            setFichas(fichas.filter(f => f.id !== fichaId));
        } catch (err) {
            alert("No se pudo eliminar la ficha.");
        }
    };

    const handleOpenModal = (ficha = null) => {
        setEditingFicha(ficha);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFicha(null);
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            numero_ficha: formData.get('numero_ficha'),
            programa_formacion: formData.get('programa_formacion'),
            jornada: formData.get('jornada'),
            instructor_ids: formData.getAll('instructor_ids')
        };
        
        // Basic frontend validation
        if (!data.numero_ficha || !data.programa_formacion) {
            alert("Número de ficha y programa son requeridos.");
            return;
        }

        const promise = editingFicha
            ? api.patch(`attendance/fichas/${editingFicha.id}/`, data)
            : api.post('attendance/fichas/', data);

        try {
            await promise;
            await fetchFichas(); // Refresh list
            handleCloseModal();
        } catch (err) {
            alert(`Error al guardar la ficha: ${err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido'}`);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchFichas();
    };

    if (loading) return <div className="text-center p-10">Cargando fichas...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Gestionar Fichas</h1>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Crear Ficha</button>
                </div>

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
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Instructor</label>
                        <select name="instructor" value={filters.instructor} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                            <option value="">Todos</option>
                            {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.first_name} {inst.last_name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleApplyFilters} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filtrar</button>
                </div>

                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full text-white">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-left">Número</th>
                                <th className="py-3 px-4 text-left">Programa</th>
                                <th className="py-3 px-4 text-left">Jornada</th>
                                <th className="py-3 px-4 text-left">Instructores</th>
                                <th className="py-3 px-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fichas.map(ficha => (
                                <tr key={ficha.id}>
                                    <td className="py-3 px-4">{ficha.numero_ficha}</td>
                                    <td className="py-3 px-4">{ficha.programa_formacion}</td>
                                    <td className="py-3 px-4">{ficha.jornada || 'N/A'}</td>
                                    <td className="py-3 px-4">{ficha.instructors?.map(i => i.username).join(', ') || 'N/A'}</td>
                                    <td className="py-3 px-4 space-x-2">
                                        <button onClick={() => handleOpenModal(ficha)} className="text-yellow-400 hover:text-yellow-300">Editar</button>
                                        <button onClick={() => handleDelete(ficha.id)} className="text-red-500 hover:text-red-400">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">{editingFicha ? 'Editar' : 'Crear'} Ficha</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label htmlFor="numero_ficha" className="block text-sm font-medium text-gray-300">Número de Ficha</label>
                            <input type="text" name="numero_ficha" id="numero_ficha" defaultValue={editingFicha?.numero_ficha} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                        </div>
                        <div>
                            <label htmlFor="programa_formacion" className="block text-sm font-medium text-gray-300">Programa de Formación</label>
                            <input type="text" name="programa_formacion" id="programa_formacion" defaultValue={editingFicha?.programa_formacion} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                        </div>
                        <div>
                            <label htmlFor="jornada" className="block text-sm font-medium text-gray-300">Jornada</label>
                            <input type="text" name="jornada" id="jornada" defaultValue={editingFicha?.jornada} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        <div>
                            <label htmlFor="instructor_ids" className="block text-sm font-medium text-gray-300">Instructores Asignados</label>
                            <select multiple name="instructor_ids" id="instructor_ids" defaultValue={editingFicha?.instructors?.map(i => i.id)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                                {instructors.map(inst => (
                                    <option key={inst.id} value={inst.id}>{inst.first_name} {inst.last_name} ({inst.username})</option>
                                ))}
                            </select>
                        </div>
                        {/* Add students ManyToMany field management if needed */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
