"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Simple Modal Component with theme support
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

export default function ManageExcusesPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [excuses, setExcuses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentExcuseToReview, setCurrentExcuseToReview] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [filters, setFilters] = useState({ student: '', date_from: '', date_to: '', status: 'pending' });

    const fetchExcuses = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('excuses/', { params: filters });
            setExcuses(response.data.results || response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch excuses", err);
            setError(t('manage_excuses.error_loading'));
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
            setExcuses(excuses.map(ex => ex.id === currentExcuseToReview.id ? response.data : ex));
            setIsReviewModalOpen(false);
            setCurrentExcuseToReview(null);
            setReviewComment('');
        } catch (err) {
            const errorMsg = err.response?.data?.detail || t('manage_excuses.unknown_error');
            alert(t('manage_excuses.error_reviewing', { status: newStatus, error: errorMsg }));
            console.error(`Failed to ${newStatus} excuse`, err);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchExcuses();
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

                .excuses-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px 20px;
                    transition: background-color 0.3s ease;
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

                .modern-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                    margin-bottom: 2rem;
                }

                .modern-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .modern-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-hover);
                }

                .card-header {
                    padding: 1.5rem;
                    border-bottom: 2px solid var(--border-color);
                    background: var(--bg-secondary);
                }

                .card-title {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin: 0;
                }

                .filter-section {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 15px;
                    margin-bottom: 1.5rem;
                    border: 2px solid var(--border-color);
                }

                .filter-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    align-items: end;
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

                .form-input, .form-select {
                    background: var(--input-bg);
                    border: 2px solid var(--input-border);
                    border-radius: 10px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus, .form-select:focus {
                    outline: none;
                    border-color: var(--button-gradient);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

                .excuse-list {
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
                    flex-direction: column;
                    gap: 1rem;
                }

                .excuse-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .excuse-student {
                    font-weight: 700;
                    font-size: 1.2rem;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .excuse-meta {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-bottom: 0.25rem;
                }

                .excuse-reason {
                    color: var(--text-primary);
                    font-size: 1rem;
                    line-height: 1.5;
                    margin-top: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 10px;
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

                .attachment-link {
                    color: var(--text-primary);
                    text-decoration: none;
                    padding: 8px 16px;
                    background: var(--button-gradient);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .attachment-link:hover {
                    background: var(--button-hover);
                    transform: translateY(-1px);
                }

                .review-comment {
                    background: var(--bg-secondary);
                    padding: 0.75rem;
                    border-radius: 8px;
                    color: var(--text-muted);
                    font-style: italic;
                    margin-top: 0.5rem;
                    border-left: 3px solid var(--info-gradient);
                }

                .review-button {
                    background: var(--info-gradient);
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .review-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .loading-container, .error-container, .empty-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-card);
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

                .modal-info {
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                    font-size: 1rem;
                }

                .modal-reason {
                    background: var(--bg-secondary);
                    padding: 1rem;
                    border-radius: 10px;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                    border-left: 4px solid var(--button-gradient);
                }

                .modal-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid var(--input-border);
                    border-radius: 10px;
                    background: var(--input-bg);
                    color: var(--text-primary);
                    font-size: 1rem;
                    resize: vertical;
                    min-height: 100px;
                    transition: all 0.3s ease;
                }

                .modal-textarea:focus {
                    outline: none;
                    border-color: var(--button-gradient);
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                    flex-wrap: wrap;
                }

                .approve-button {
                    background: var(--success-gradient);
                    border: none;
                    border-radius: 10px;
                    padding: 12px 24px;
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .reject-button {
                    background: var(--danger-gradient);
                    border: none;
                    border-radius: 10px;
                    padding: 12px 24px;
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .approve-button:hover, .reject-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
                    .excuses-container {
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .filter-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .excuse-header {
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
                title={t('common_change_theme')}
            >
                🌓
            </div>

            <div className="excuses-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        {t('manage_excuses.title')}
                    </h1>
                    
                    <div className="modern-card">
                        <div className="card-header">
                            <h2 className="card-title">{t('manage_excuses.page_title')}</h2>
                        </div>

                        {/* Filter Section */}
                        <div style={{ padding: '1.5rem' }}>
                            <div className="filter-section">
                                <div className="filter-grid">
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_student')}</label>
                                        <select 
                                            name="student" 
                                            value={filters.student} 
                                            onChange={handleFilterChange} 
                                            className="form-select"
                                        >
                                            <option value="">{t('manage_excuses.filter_all_students')}</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.first_name} {s.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_status')}</label>
                                        <select 
                                            name="status" 
                                            value={filters.status} 
                                            onChange={handleFilterChange} 
                                            className="form-select"
                                        >
                                            <option value="">{t('manage_excuses.filter_all_statuses')}</option>
                                            <option value="pending">{t('manage_excuses.status_pending')}</option>
                                            <option value="approved">{t('manage_excuses.status_approved')}</option>
                                            <option value="rejected">{t('manage_excuses.status_rejected')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_date_from')}</label>
                                        <input 
                                            type="date" 
                                            name="date_from" 
                                            value={filters.date_from} 
                                            onChange={handleFilterChange} 
                                            className="form-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('manage_excuses.filter_date_to')}</label>
                                        <input 
                                            type="date" 
                                            name="date_to" 
                                            value={filters.date_to} 
                                            onChange={handleFilterChange} 
                                            className="form-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button onClick={handleApplyFilters} className="modern-button">
                                            {t('manage_excuses.apply_filters')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading-container">
                                    <div style={{ fontSize: '3rem' }}></div>
                                    <div className="loading-text">{t('manage_excuses.loading')}</div>
                                </div>
                            ) : error ? (
                                <div className="error-container">
                                    <div style={{ fontSize: '3rem' }}></div>
                                    <div className="error-text">{t('manage_excuses.error_loading')}</div>
                                </div>
                            ) : (
                                <ul className="excuse-list">
                                    {excuses.length > 0 ? (
                                        excuses.map(excuse => (
                                            <li key={excuse.id} className="excuse-item">
                                                <div className="excuse-content">
                                                    <div className="excuse-header">
                                                        <div style={{ flex: '1' }}>
                                                            <div className="excuse-student">
                                                                 {excuse.student.first_name} {excuse.student.last_name}
                                                            </div>
                                                            <div className="excuse-meta">
                                                                {t('manage_excuses.excuse_card_ficha', { ficha: excuse.session.ficha.numero_ficha })}
                                                            </div>
                                                            <div className="excuse-meta">
                                                                {t('manage_excuses.excuse_card_session', { date: new Date(excuse.session.date).toLocaleDateString('es-CO') })}
                                                            </div>
                                                            {excuse.attachment && (
                                                                <a 
                                                                    href={excuse.attachment} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="attachment-link"
                                                                >
                                                                    📎 {t('manage_excuses.view_attachment')}
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="excuse-actions">
                                                            <span className={`status-badge ${getStatusColor(excuse.status)}`}>
                                                                {t(`manage_excuses.status_${excuse.status}`)}
                                                            </span>
                                                            {excuse.status === 'pending' && (
                                                                <button 
                                                                    onClick={() => handleOpenReviewModal(excuse)} 
                                                                    className="review-button"
                                                                >
                                                                    {t('manage_excuses.review_button')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="excuse-reason">
                                                        <strong>{t('manage_excuses.reason_label')}</strong> {excuse.reason}
                                                    </div>
                                                    {excuse.review_comment && (
                                                        <div className="review-comment">
                                                            <strong>{t('manage_excuses.review_comment_label')}</strong> {excuse.review_comment}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="empty-container">
                                            <div style={{ fontSize: '3rem' }}></div>
                                            <div className="empty-text">
                                                {t('manage_excuses.no_excuses_found')}
                                            </div>
                                        </div>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isReviewModalOpen && currentExcuseToReview && (
                <Modal onClose={() => setIsReviewModalOpen(false)}>
                    <h2 className="modal-title">{t('manage_excuses.modal_title')}</h2>
                    <div className="modal-info">
                        <strong>{t('manage_excuses.modal_student_label')}</strong> {currentExcuseToReview.student.first_name} {currentExcuseToReview.student.last_name}
                    </div>
                    <div className="modal-info">
                        <strong>{t('manage_excuses.modal_session_label')}</strong> {currentExcuseToReview.session.ficha.numero_ficha} - {new Date(currentExcuseToReview.session.date).toLocaleDateString('es-CO')}
                    </div>
                    <div className="modal-reason">
                        <strong>{t('manage_excuses.reason_label')}</strong> {currentExcuseToReview.reason}
                    </div>
                    {currentExcuseToReview.document && (
                        <div style={{ marginBottom: '1rem' }}>
                            <a 
                                href={currentExcuseToReview.document} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="attachment-link"
                            >
                                📎 {t('manage_excuses.view_attachment')}
                            </a>
                        </div>
                    )}
                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">
                            {t('manage_excuses.modal_review_comment_label')}
                        </label>
                        <textarea 
                            value={reviewComment} 
                            onChange={(e) => setReviewComment(e.target.value)} 
                            rows={4} 
                            className="modal-textarea"
                            placeholder={t('manage_excuses.modal_review_comment_placeholder')}
                        />
                    </div>
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={() => handleReviewExcuse('approved')} 
                            className="approve-button"
                        >
                            {t('manage_excuses.approve_button')}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleReviewExcuse('rejected')} 
                            className="reject-button"
                        >
                            {t('manage_excuses.reject_button')}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}