
"use client";

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';

// Simple Modal Component
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
            {children}
        </div>
    </div>
);

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await api.get('auth/profile/');
                setProfile(response.data);
            } catch (err) {
                setError("No se pudo cargar el perfil.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            student_id: formData.get('student_id'),
        };

        if (profile?.role !== 'student') {
            delete data.student_id;
        }

        setError(null);
        setSuccess(null);

        try {
            const response = await api.patch('auth/profile/', data);
            setProfile(response.data);
            setSuccess("Perfil actualizado con éxito.");
        } catch (err) {
            const apiError = err.response?.data;
            const errorMessage = apiError ? Object.values(apiError).join(', ') : 'Error desconocido.';
            setError(`No se pudo actualizar el perfil: ${errorMessage}`);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        const formData = new FormData(e.target);
        const old_password = formData.get('old_password');
        const new_password = formData.get('new_password');
        const new_password2 = formData.get('new_password2');

        if (new_password !== new_password2) {
            setPasswordError("Las nuevas contraseñas no coinciden.");
            return;
        }

        try {
            await api.put('auth/password/change/', { old_password, new_password, new_password2 });
            setPasswordSuccess("Contraseña actualizada con éxito.");
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess(null);
            }, 2000);
        } catch (err) {
            const apiError = err.response?.data;
            const errorMessage = apiError ? Object.values(apiError).flat().join(' ') : 'Error desconocido.';
            setPasswordError(`Error: ${errorMessage}`);
        }
    };

    const isLoading = authLoading || loading;

    if (isLoading) {
        return <div className="text-center p-10">Cargando perfil...</div>;
    }

    if (error && !profile) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <div className="space-y-6 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
                
                {profile && (
                    <div className="bg-gray-800 shadow-lg rounded-lg p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">Nombre de Usuario</label>
                                    <input type="text" name="username" id="username" defaultValue={profile.username} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" readOnly />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                                    <input type="email" name="email" id="email" defaultValue={profile.email} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                                </div>
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">Nombre</label>
                                    <input type="text" name="first_name" id="first_name" defaultValue={profile.first_name} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                                </div>
                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">Apellido</label>
                                    <input type="text" name="last_name" id="last_name" defaultValue={profile.last_name} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                                </div>
                                {profile.role === 'student' && (
                                    <div>
                                        <label htmlFor="student_id" className="block text-sm font-medium text-gray-300">ID de Estudiante</label>
                                        <input type="text" name="student_id" id="student_id" defaultValue={profile.student_id || ''} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Rol</label>
                                    <p className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white capitalize">{profile.role}</p>
                                </div>
                                {profile.role === 'instructor' && profile.fichas && profile.fichas.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">Fichas Asignadas</label>
                                        <p className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                                            {profile.fichas.map(fichaId => fichaId).join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-gray-700 pt-6 flex justify-between items-center">
                                <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">
                                    Cambiar Contraseña
                                </button>
                                <div className="flex items-center">
                                    {error && <p className="text-sm text-red-500 mr-4">{error}</p>}
                                    {success && <p className="text-sm text-green-500 mr-4">{success}</p>}
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar Cambios</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {isPasswordModalOpen && (
                <Modal onClose={() => setIsPasswordModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">Cambiar Contraseña</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label htmlFor="old_password" className="block text-sm font-medium text-gray-300">Contraseña Actual</label>
                            <input type="password" name="old_password" id="old_password" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                        </div>
                        <div>
                            <label htmlFor="new_password" className="block text-sm font-medium text-gray-300">Nueva Contraseña</label>
                            <input type="password" name="new_password" id="new_password" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                        </div>
                        <div>
                            <label htmlFor="new_password2" className="block text-sm font-medium text-gray-300">Confirmar Nueva Contraseña</label>
                            <input type="password" name="new_password2" id="new_password2" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                        </div>
                        
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        {passwordSuccess && <p className="text-sm text-green-500">{passwordSuccess}</p>}

                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Actualizar Contraseña</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
