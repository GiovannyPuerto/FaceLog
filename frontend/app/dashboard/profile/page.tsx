"use client";

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';

// Modal Component with theme support
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
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

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --bg-secondary: #e9ecef;
                    --bg-readonly: #f8f9fa;
                    --text-primary: #232129ff;
                    --text-secondary: #6c757d;
                    --text-muted: #8b949e;
                    --text-success: #28a745;
                    --text-error: #dc3545;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --button-secondary: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                    --button-secondary-hover: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
                    --button-success: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    --button-success-hover: linear-gradient(135deg, #1e7e34 0%, #17a2b8 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --input-bg: #ffffff;
                    --input-border: #e9ecef;
                    --input-focus: #667eea;
                    --divider-color: #e9ecef;
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --bg-secondary: #21262d;
                    --bg-readonly: #21262d;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --text-muted: #6e7681;
                    --text-success: #2ea043;
                    --text-error: #f85149;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --button-secondary: linear-gradient(135deg, #6e7681 0%, #484f58 100%);
                    --button-secondary-hover: linear-gradient(135deg, #656d76 0%, #373e47 100%);
                    --button-success: linear-gradient(135deg, #2ea043 0%, #238636 100%);
                    --button-success-hover: linear-gradient(135deg, #2d8f3f 0%, #1f6929 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --input-bg: #21262d;
                    --input-border: #30363d;
                    --input-focus: #58a6ff;
                    --divider-color: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                    min-height: 100vh;
                }

                .profile-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px 20px;
                    transition: background-color 0.3s ease;
                }

                .profile-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .modern-title {
                    color: var(--text-primary);
                    font-weight: 800;
                    font-size: 2.5rem;
                    margin-bottom: 2rem;
                    position: relative;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -15px;
                    left: 0;
                    width: 120px;
                    height: 5px;
                    background: var(--button-gradient);
                    border-radius: 3px;
                }

                .profile-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .profile-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .profile-form {
                    padding: 2rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-input {
                    background: var(--input-bg);
                    border: 2px solid var(--input-border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--input-focus);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    transform: translateY(-1px);
                }

                .form-input:read-only {
                    background: var(--bg-readonly);
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .readonly-field {
                    background: var(--bg-readonly);
                    border: 2px solid var(--input-border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    text-transform: capitalize;
                }

                .form-actions {
                    border-top: 2px solid var(--divider-color);
                    padding-top: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .modern-button {
                    background: var(--button-gradient);
                    border: none;
                    border-radius: 12px;
                    padding: 12px 24px;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .modern-button:hover {
                    background: var(--button-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .secondary-button {
                    background: var(--button-secondary);
                }

                .secondary-button:hover {
                    background: var(--button-secondary-hover);
                }

                .success-button {
                    background: var(--button-success);
                }

                .success-button:hover {
                    background: var(--button-success-hover);
                }

                .message-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .success-message {
                    color: var(--text-success);
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .error-message {
                    color: var(--text-error);
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .loading-container, .error-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                    margin: 2rem 0;
                }

                .loading-text, .error-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .error-text {
                    color: var(--text-error);
                }

                .loading-icon, .error-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 1rem;
                    backdrop-filter: blur(5px);
                }

                .modal-content {
                    background: var(--bg-card);
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: var(--shadow-hover);
                    border: 2px solid var(--border-color);
                    width: 100%;
                    max-width: 500px;
                    position: relative;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-close-btn:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .modal-title {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                    flex-wrap: wrap;
                }

                .theme-toggle {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 50%;
                    width: 55px;
                    height: 55px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-card);
                    font-size: 1.2rem;
                    z-index: 9999;
                }

                .theme-toggle:hover {
                    transform: scale(1.1) rotate(180deg);
                    box-shadow: var(--shadow-hover);
                }

                @media (max-width: 768px) {
                    .profile-container {
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .profile-form {
                        padding: 1.5rem;
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .message-container {
                        justify-content: center;
                        order: -1;
                    }
                    
                    .modal-actions {
                        justify-content: center;
                    }
                    
                    .theme-toggle {
                        top: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .profile-form {
                        padding: 1rem;
                    }
                    
                    .modern-button {
                        padding: 10px 18px;
                        font-size: 0.9rem;
                    }
                }
            `}</style>

            {/* Theme Toggle */}
            <div 
                className="theme-toggle"
                onClick={() => {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    document.documentElement.setAttribute('data-theme', 
                        currentTheme === 'dark' ? 'light' : 'dark'
                    );
                }}
                title="Cambiar tema"
            >
                🌓
            </div>

            <div className="profile-container">
                <div className="profile-wrapper">
                    <h1 className="modern-title">
                         Mi Perfil
                    </h1>
                    
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">Cargando perfil...</div>
                        </div>
                    ) : error && !profile ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">Error: {error}</div>
                        </div>
                    ) : profile && (
                        <div className="profile-card">
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Nombre de Usuario</label>
                                        <input 
                                            type="text" 
                                            name="username" 
                                            defaultValue={profile.username} 
                                            className="form-input"
                                            readOnly 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            defaultValue={profile.email} 
                                            className="form-input"
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nombre</label>
                                        <input 
                                            type="text" 
                                            name="first_name" 
                                            defaultValue={profile.first_name} 
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Apellido</label>
                                        <input 
                                            type="text" 
                                            name="last_name" 
                                            defaultValue={profile.last_name} 
                                            className="form-input"
                                        />
                                    </div>
                                    {profile.role === 'student' && (
                                        <div className="form-group">
                                            <label className="form-label">ID de Estudiante</label>
                                            <input 
                                                type="text" 
                                                name="student_id" 
                                                defaultValue={profile.student_id || ''} 
                                                className="form-input"
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">Rol</label>
                                        <div className="readonly-field">
                                            {profile.role}
                                        </div>
                                    </div>
                                    {profile.role === 'instructor' && profile.fichas && profile.fichas.length > 0 && (
                                        <div className="form-group">
                                            <label className="form-label">Fichas Asignadas</label>
                                            <div className="readonly-field">
                                                {profile.fichas.map(fichaId => fichaId).join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsPasswordModalOpen(true)} 
                                        className="modern-button secondary-button"
                                    >
                                        Cambiar Contraseña
                                    </button>
                                    <div className="message-container">
                                        {error && (
                                            <div className="error-message">
                                                ❌ {error}
                                            </div>
                                        )}
                                        {success && (
                                            <div className="success-message">
                                                 {success}
                                            </div>
                                        )}
                                        <button type="submit" className="modern-button">
                                             Guardar Cambios
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {isPasswordModalOpen && (
                <Modal onClose={() => setIsPasswordModalOpen(false)}>
                    <h2 className="modal-title"> Cambiar Contraseña</h2>
                    <form onSubmit={handleChangePassword} className="modal-form">
                        <div className="form-group">
                            <label className="form-label">Contraseña Actual</label>
                            <input 
                                type="password" 
                                name="old_password" 
                                className="form-input"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                name="new_password" 
                                className="form-input"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirmar Nueva Contraseña</label>
                            <input 
                                type="password" 
                                name="new_password2" 
                                className="form-input"
                                required 
                            />
                        </div>
                        
                        {passwordError && (
                            <div className="error-message"> {passwordError}</div>
                        )}
                        {passwordSuccess && (
                            <div className="success-message"> {passwordSuccess}</div>
                        )}

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={() => setIsPasswordModalOpen(false)} 
                                className="modern-button secondary-button"
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="modern-button success-button">
                                 Actualizar Contraseña
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}