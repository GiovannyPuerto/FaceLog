"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Modal Component with theme support
const Modal = ({ children, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <button onClick={onClose} className="modal-close-btn">&times;</button>
            {children}
        </div>
    </div>
);

// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        case 'pending': return 'status-pending';
        default: return 'status-default';
    }
};

export default function StudentExcusesPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [excuses, setExcuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [absentSessions, setAbsentSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState('');

    const fetchExcuses = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await api.get('excuses/');
            setExcuses(response.data.results || response.data);
        } catch (err) {
            setError(t('student_excuses.error'));
        } finally {
            setLoading(false);
        }
    };

    const searchParams = useSearchParams();
    const sessionIdFromUrl = searchParams.get('session_id');

    useEffect(() => {
        fetchExcuses();
        if (sessionIdFromUrl) {
            handleOpenCreateModal(sessionIdFromUrl);
        }
    }, [user, sessionIdFromUrl]);

    const handleOpenCreateModal = async (initialSessionId = null) => {
        try {
            const response = await api.get('attendance/absences/');
            setAbsentSessions(response.data.results || response.data);
            setIsModalOpen(true);
            if (initialSessionId) {
                setSelectedSessionId(initialSessionId);
            } else {
                setSelectedSessionId('');
            }
        } catch (err) {
            setError(t('student_excuses.error_loading_absences'));
        }
    };

    const handleCreateExcuse = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            console.log("Attempting to POST to:", api.defaults.baseURL + 'excuses/');
            await api.post('excuses/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setIsModalOpen(false);
            fetchExcuses();
        } catch (err) {
            const apiError = err.response?.data;
            const errorMessage = apiError ? Object.values(apiError).flat().join(' ') : t('unknown_error');
            alert(t('student_excuses.error_creating', { error: errorMessage }));
        }
    };

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --bg-secondary: #e9ecef;
                    --text-primary: #232129ff;
                    --text-secondary: #6c757d;
                    --text-muted: #8b949e;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --button-success: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    --button-success-hover: linear-gradient(135deg, #1e7e34 0%, #17a2b8 100%);
                    --button-secondary: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                    --button-secondary-hover: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --success-gradient: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
                    --danger-gradient: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                    --warning-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    --input-bg: #ffffff;
                    --input-border: #e9ecef;
                    --divider-color: #e9ecef;
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --bg-secondary: #21262d;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --text-muted: #6e7681;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --button-success: linear-gradient(135deg, #2ea043 0%, #238636 100%);
                    --button-success-hover: linear-gradient(135deg, #2d8f3f 0%, #1f6929 100%);
                    --button-secondary: linear-gradient(135deg, #6e7681 0%, #484f58 100%);
                    --button-secondary-hover: linear-gradient(135deg, #656d76 0%, #373e47 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --success-gradient: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --danger-gradient: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --warning-gradient: linear-gradient(135deg, #d29922 0%, #bb8009 100%);
                    --info-gradient: linear-gradient(135deg, #58a6ff 0%, #388bfd 100%);
                    --input-bg: #21262d;
                    --input-border: #30363d;
                    --divider-color: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                    min-height: 100vh;
                }

                /* SOLUCIÓN ESPECÍFICA PARA EL LAYOUT DEL SIDEBAR */
                .student-excuses-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px 20px;
                    transition: background-color 0.3s ease;
                    /* Agregar margen para el sidebar */
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

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
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

                .excuses-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .excuses-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .excuses-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .excuse-item {
                    padding: 1.5rem;
                    border-bottom: 2px solid var(--divider-color);
                    transition: all 0.3s ease;
                }

                .excuse-item:hover {
                    background: var(--bg-secondary);
                }

                .excuse-item:last-child {
                    border-bottom: none;
                }

                .excuse-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .excuse-main {
                    flex: 1;
                    min-width: 250px;
                }

                .excuse-session {
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .excuse-reason {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    line-height: 1.5;
                    margin-top: 0.75rem;
                    padding: 0.75rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    border-left: 4px solid var(--button-gradient);
                }

                .excuse-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.75rem;
                }

                .status-badge {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: white;
                }

                .status-approved {
                    background: var(--success-gradient);
                }

                .status-rejected {
                    background: var(--danger-gradient);
                }

                .status-pending {
                    background: var(--warning-gradient);
                }

                .status-default {
                    background: var(--info-gradient);
                }

                .excuse-date {
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-align: right;
                }

                .attachment-link {
                    color: white;
                    text-decoration: none;
                    padding: 6px 12px;
                    background: var(--button-gradient);
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }

                .attachment-link:hover {
                    background: var(--button-hover);
                    transform: translateY(-1px);
                    color: white;
                    text-decoration: none;
                }

                .loading-container, .error-container, .empty-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                    margin: 2rem 0;
                }

                .loading-text, .error-text, .empty-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .error-text {
                    color: #f85149;
                }

                .loading-icon, .error-icon, .empty-icon {
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
                    max-width: 600px;
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
                    gap: 1.5rem;
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

                .form-input, .form-select, .form-textarea {
                    background: var(--input-bg);
                    border: 2px solid var(--input-border);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--button-gradient);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    transform: translateY(-1px);
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 120px;
                }

                .form-file {
                    background: var(--input-bg);
                    border: 2px dashed var(--input-border);
                    border-radius: 12px;
                    padding: 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .form-file:hover {
                    border-color: var(--button-gradient);
                    background: var(--bg-secondary);
                }

                .form-file::-webkit-file-upload-button {
                    background: var(--button-gradient);
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    color: white;
                    font-weight: 600;
                    margin-right: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .form-file::-webkit-file-upload-button:hover {
                    background: var(--button-hover);
                }

                .warning-message {
                    background: var(--warning-gradient);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                    flex-wrap: wrap;
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

                /* Responsive */
                @media (max-width: 991.98px) {
                    .student-excuses-container {
                        margin-left: 220px !important;
                    }
                }

                @media (max-width: 767.98px) {
                    .student-excuses-container {
                        margin-left: 0 !important;
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .page-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .excuse-content {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .excuse-actions {
                        align-items: flex-start;
                        width: 100%;
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
                    .excuse-item {
                        padding: 1rem;
                    }
                    
                    .modal-content {
                        padding: 1.5rem;
                    }
                }
            `}</style>

            

            <div className="student-excuses-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="page-header">
                        <h1 className="modern-title">
                            {t('student_excuses.title')}
                        </h1>
                        <button onClick={() => handleOpenCreateModal()} className="modern-button">
                            {t('student_excuses.create_excuse')}
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon">⏳</div>
                            <div className="loading-text">{t('student_excuses.loading')}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">❌</div>
                            <div className="error-text">{t('student_excuses.error')}: {error}</div>
                        </div>
                    ) : (
                        <div className="excuses-card">
                            <ul className="excuses-list">
                                {excuses.length > 0 ? (
                                    excuses.map(excuse => (
                                        <li key={excuse.id} className="excuse-item">
                                            <div className="excuse-content">
                                                <div className="excuse-main">
                                                    <div className="excuse-session">
                                                        {t('student_excuses.session_date')}: {new Date(excuse.session.date).toLocaleDateString(undefined, { 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric' 
                                                        })}
                                                    </div>
                                                    <div className="excuse-reason">
                                                         {excuse.reason}
                                                    </div>
                                                    {excuse.attachment && (
                                                        <a href={excuse.attachment} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                                            📎 {t('student_excuses.view_attachment')}
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="excuse-actions">
                                                    <span className={`status-badge ${getStatusColor(excuse.status)}`}>
                                                        {excuse.status === 'approved' ? t('student_excuses.status_approved') : 
                                                         excuse.status === 'rejected' ? t('student_excuses.status_rejected') : 
                                                         excuse.status === 'pending' ? t('student_excuses.status_pending') : excuse.status}
                                                    </span>
                                                    <div className="excuse-date">
                                                        {t('student_excuses.sent_date')}: {new Date(excuse.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <div className="empty-container">
                                        <div className="empty-icon"></div>
                                        <div className="empty-text">
                                            {t('student_excuses.no_excuses')}
                                        </div>
                                    </div>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="modal-title">{t('student_excuses.modal_title')}</h2>
                    <form onSubmit={handleCreateExcuse} className="modal-form">
                        <div className="form-group">
                            <label className="form-label">{t('student_excuses.modal_session_label')}</label>
                            <select 
                                name="session" 
                                className="form-select" 
                                required
                                value={selectedSessionId}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                            >
                                <option value="">{t('student_excuses.modal_select_session')}</option>
                                {absentSessions.map(att => (
                                    <option key={att.session.id} value={att.session.id}>
                                         {att.session.ficha.numero_ficha} - {new Date(att.session.date).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                            {absentSessions.length === 0 && (
                                <div className="warning-message">
                                     {t('student_excuses.modal_no_absent_sessions')}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('student_excuses.modal_reason_label')}</label>
                            <textarea 
                                name="reason" 
                                rows={4} 
                                className="form-textarea" 
                                placeholder={t('student_excuses.modal_reason_placeholder')}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('student_excuses.modal_attachment_label')}</label>
                            <input 
                                type="file" 
                                name="document" 
                                className="form-file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)} 
                                className="modern-button secondary-button"
                            >
                                {t('student_excuses.modal_cancel')}
                            </button>
                            <button 
                                type="submit" 
                                className="modern-button success-button"
                            >
                                 {t('student_excuses.modal_submit')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
