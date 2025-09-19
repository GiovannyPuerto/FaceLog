
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post('auth/password/reset/', { email });
            const token = response.data.token;
            
            // In a real app, an email would be sent. Here, we get the token directly.
            setSuccess("Solicitud recibida. Redirigiendo para restablecer la contraseña...");
            
            // Redirect to the reset page with the token
            setTimeout(() => {
                router.push(`/reset-password?token=${token}`);
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || "No se pudo procesar la solicitud.");
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center text-white">Restablecer Contraseña</h1>
                
                {success ? (
                    <p className="text-center text-green-400">{success}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                {loading ? 'Enviando...' : 'Enviar Enlace de Reseteo'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center">
                    <Link href="/login" className="text-sm text-blue-400 hover:underline">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
