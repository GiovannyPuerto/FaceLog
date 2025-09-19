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

export default function ManageUsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filters, setFilters] = useState({ username: '', email: '', first_name: '', last_name: '', role: '', is_active: '' });

    const fetchUsers = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('auth/users/', { params: filters });
            setUsers(response.data.results || []);
        } catch (err) {
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user]);

    const handleDelete = async (userId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
        try {
            await api.delete(`auth/users/${userId}/`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert("No se pudo eliminar el usuario.");
        }
    };

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Ensure role is set for new creations if not provided by form
        if (!editingUser) {
            data.role = data.role || 'student'; // Default to student if not selected
        }

        const promise = editingUser
            ? api.patch(`auth/users/${editingUser.id}/`, data)
            : api.post('auth/users/', data);

        try {
            await promise;
            await fetchUsers();
            setIsModalOpen(false);
        } catch (err) {
            alert(`Error al guardar el usuario: ${err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido'}`);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchUsers();
    };

    if (loading) return <div className="text-center p-10">Cargando usuarios...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Gestionar Usuarios</h1>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Crear Usuario</button>
                </div>

                {/* Filter Section */}
                <div className="bg-gray-800 p-4 rounded-lg space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Username</label>
                        <input type="text" name="username" value={filters.username} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input type="text" name="email" value={filters.email} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Rol</label>
                        <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                            <option value="">Todos</option>
                            <option value="student">Estudiante</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300">Estado</label>
                        <select name="is_active" value={filters.is_active} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md">
                            <option value="">Todos</option>
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>
                    <button onClick={handleApplyFilters} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filtrar</button>
                </div>

                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full text-white">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-left">Username</th>
                                <th className="py-3 px-4 text-left">Nombre Completo</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Rol</th>
                                <th className="py-3 px-4 text-left">Activo</th>
                                <th className="py-3 px-4 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="py-3 px-4">{u.username}</td>
                                    <td className="py-3 px-4">{u.first_name} {u.last_name}</td>
                                    <td className="py-3 px-4">{u.email}</td>
                                    <td className="py-3 px-4"><span className="px-2 py-1 text-sm rounded-full bg-gray-600">{u.role}</span></td>
                                    <td className="py-3 px-4">{u.is_active ? 'Sí' : 'No'}</td>
                                    <td className="py-3 px-4 space-x-2">
                                        <button onClick={() => handleOpenModal(u)} className="text-yellow-400 hover:text-yellow-300">Editar</button>
                                        <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-400">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">{editingUser ? 'Editar' : 'Crear'} Usuario</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        {!editingUser && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                                    <input type="text" name="username" id="username" defaultValue={editingUser?.username} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
                                    <input type="password" name="password" id="password" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required={!editingUser} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">Nombre</label>
                            <input type="text" name="first_name" id="first_name" defaultValue={editingUser?.first_name} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">Apellido</label>
                            <input type="text" name="last_name" id="last_name" defaultValue={editingUser?.last_name} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                            <input type="email" name="email" id="email" defaultValue={editingUser?.email} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        {(!editingUser || editingUser.role !== 'admin') && (
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-300">Rol</label>
                                <select name="role" id="role" defaultValue={editingUser?.role} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required={!editingUser}>
                                    <option value="student">Estudiante</option>
                                    <option value="instructor">Instructor</option>
                                    {/* Admin role can only be set by superuser in Django admin */}
                                </select>
                            </div>
                        )}
                        {editingUser?.role === 'student' && (
                            <div>
                                <label htmlFor="student_id" className="block text-sm font-medium text-gray-300">ID de Estudiante</label>
                                <input type="text" name="student_id" id="student_id" defaultValue={editingUser?.student_id} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                            </div>
                        )}
                        <div>
                            <label htmlFor="is_active" className="block text-sm font-medium text-gray-300">Activo</label>
                            <input type="checkbox" name="is_active" id="is_active" defaultChecked={editingUser?.is_active} className="mt-1" />
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