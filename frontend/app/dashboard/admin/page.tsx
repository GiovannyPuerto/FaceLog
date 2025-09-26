"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGlobalReport = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('/attendance/report/global/');
            setReportData(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch global report", err);
            setError(t('admin_dashboard.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalReport();
    }, [user, t]);

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
                    --text-accent: #667eea;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --success-gradient: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
                    --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    --warning-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
                    --text-accent: #58a6ff;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --success-gradient: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --info-gradient: linear-gradient(135deg, #58a6ff 0%, #388bfd 100%);
                    --warning-gradient: linear-gradient(135deg, #d29922 0%, #bb8009 100%);
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

                .dashboard-container {
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

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .summary-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    padding: 1.5rem;
                    text-align: center;
                }

                .summary-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-hover);
                }

                .summary-card h3 {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                }

                .summary-card p {
                    color: var(--text-primary);
                    font-size: 2.5rem;
                    font-weight: 700;
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

                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .summary-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                }
            `}</style>

            <div className="dashboard-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        {t('admin_dashboard.title')}
                    </h1>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">{t('admin_dashboard.loading')}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">Error: {error}</div>
                        </div>
                    ) : reportData ? (
                        <div className="summary-grid">
                            <div className="summary-card">
                                <h3>{t('admin_dashboard.total_fichas')}</h3>
                                <p>{reportData.total_fichas}</p>
                            </div>
                            <div className="summary-card">
                                <h3>{t('admin_dashboard.total_instructors')}</h3>
                                <p>{reportData.total_instructors}</p>
                            </div>
                            <div className="summary-card">
                                <h3>{t('admin_dashboard.total_students')}</h3>
                                <p>{reportData.total_students}</p>
                            </div>
                            <div className="summary-card">
                                <h3>{t('admin_dashboard.total_sessions')}</h3>
                                <p>{reportData.total_sessions}</p>
                            </div>
                            <div className="summary-card">
                                <h3>{t('admin_dashboard.total_excuses')}</h3>
                                <p>{reportData.total_excuses}</p>
                            </div>
                            <div className="summary-card">
                                <h3>{t('admin_dashboard.pending_excuses')}</h3>
                                <p>{reportData.pending_excuses_count}</p>
                            </div>
                            {/* Add more summary items as needed from reportData */}
                        </div>
                    ) : (
                        <div className="empty-container">
                            <div className="empty-icon"></div>
                            <div className="empty-text">{t('admin_dashboard.no_data')}</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}