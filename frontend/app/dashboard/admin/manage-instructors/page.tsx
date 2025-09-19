
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

export default function ManageInstructorsPage() {
    const { user } = useAuth();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);

    const fetchInstructors = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            // Fetch users with role=instructor
            const response = await api.get('auth/users/', { params: { role: 'instructor' } });
            setInstructors(response.data.results || []);
        } catch (err) {
            setError("No se pudieron cargar los instructores.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, [user]);

    const handleDelete = async (instructorId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este instructor?")) return;
        try {
            await api.delete(`auth/users/${instructorId}/`);
            setInstructors(instructors.filter(i => i.id !== instructorId));
        } catch (err) {
            alert("No se pudo eliminar el instructor.");
        }
    };

    const handleOpenModal = (instructor = null) => {
        setEditingInstructor(instructor);
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Ensure role is set to instructor for new creations
        if (!editingInstructor) {
            data.role = 'instructor';
        }

        const promise = editingInstructor
            ? api.patch(`auth/users/${editingInstructor.id}/`, data)
            : api.post('auth/users/', data);

        try {
            await promise;
            await fetchInstructors();
            setIsModalOpen(false);
        } catch (err) {
            alert(`Error al guardar el instructor: ${err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido'}`);
        }
    };

    if (loading) return <div className="text-center p-10">Cargando instructores...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Gestionar Instructores</h1>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Crear Instructor</button>
                </div>

                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full text-white">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-left">Username</th>
                                <th className="py-3 px-4 text-left">Nombre Completo</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Activo</th>
                                <th className="py-3 px-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructors.map(instructor => (
                                <tr key={instructor.id}>
                                    <td className="py-3 px-4">{instructor.username}</td>
                                    <td className="py-3 px-4">{instructor.first_name} {instructor.last_name}</td>
                                    <td className="py-3 px-4">{instructor.email}</td>
                                    <td className="py-3 px-4">{instructor.is_active ? 'Sí' : 'No'}</td>
                                    <td className="py-3 px-4 space-x-2">
                                        <button onClick={() => handleOpenModal(instructor)} className="text-yellow-400 hover:text-yellow-300">Editar</button>
                                        <button onClick={() => handleDelete(instructor.id)} className="text-red-500 hover:text-red-400">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">{editingInstructor ? 'Editar' : 'Crear'} Instructor</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        {!editingInstructor && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                                    <input type="text" name="username" id="username" defaultValue={editingInstructor?.username} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
                                    <input type="password" name="password" id="password" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required={!editingInstructor} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">Nombre</label>
                            <input type="text" name="first_name" id="first_name" defaultValue={editingInstructor?.first_name} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">Apellido</label>
                            <input type="text" name="last_name" id="last_name" defaultValue={editingInstructor?.last_name} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                            <input type="email" name="email" id="email" defaultValue={editingInstructor?.email} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        <div>
                            <label htmlFor="is_active" className="block text-sm font-medium text-gray-300">Activo</label>
                            <input type="checkbox" name="is_active" id="is_active" defaultChecked={editingInstructor?.is_active} className="mt-1" />
                        </div>
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
