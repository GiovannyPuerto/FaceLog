
"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (!token) {
            setError("Token no encontrado. Por favor, solicita un nuevo enlace de reseteo.");
            return;
        }

        setLoading(true);
        try {
            await api.post('auth/password/reset/confirm/', { token, password });
            setSuccess("Contraseña restablecida con éxito. Serás redirigido al inicio de sesión.");
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo restablecer la contraseña. El token puede ser inválido o haber expirado.");
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center text-white">Ingresa tu Nueva Contraseña</h1>
                
                {success ? (
                    <p className="text-center text-green-400">{success}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Nueva Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// Wrap the form in Suspense as useSearchParams requires it
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-white text-center p-10">Cargando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
