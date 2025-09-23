"use client";

import { useState, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import Link from 'next/link';
import api from '../../../lib/api';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';

const StatCard = ({ title, value, icon, color }) => (
    <Card className="modern-stat-card h-100">
        <Card.Body className="d-flex align-items-center p-4">
            <div 
                className="modern-stat-icon me-3"
                style={{ ['--stat-color' as any]: color } as React.CSSProperties}
            >
                {icon}
            </div>
            <div className="flex-grow-1">
                <h3 className="modern-stat-title mb-1">{title}</h3>
                <p className="modern-stat-value mb-0">{value}</p>
            </div>
        </Card.Body>
    </Card>
);

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            if (user?.role !== 'instructor') return;
            try {
                setLoading(true);
                const response = await api.get('attendance/dashboard/instructor/summary/');
                setSummary(response.data);
            } catch (error) {
                console.error("Failed to fetch instructor summary", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchSummary();
    }, [user]);

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --text-primary: #232129ff;
                    --text-secondary: #6c757d;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --stat-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --stat-success: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
                    --stat-warning: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    --stat-info: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --stat-primary: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --stat-success: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --stat-warning: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --stat-info: linear-gradient(135deg, #58a6ff 0%, #388bfd 100%);
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                    min-height: 100vh;
                }

                .modern-dashboard-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px 15px;
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
                    text-align: center;
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 5px;
                    background: var(--button-gradient);
                    border-radius: 3px;
                }

                .modern-stat-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 20px !important;
                    box-shadow: var(--shadow-card) !important;
                    transition: all 0.3s ease !important;
                    overflow: hidden;
                    position: relative;
                }

                .modern-stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--stat-color, var(--button-gradient));
                }

                .modern-stat-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-hover) !important;
                    border-color: var(--stat-color, var(--button-gradient));
                }

                .modern-stat-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: var(--stat-color, var(--button-gradient));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    flex-shrink: 0;
                }

                .modern-stat-title {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .modern-stat-value {
                    color: var(--text-primary);
                    font-size: 2rem;
                    font-weight: 800;
                    line-height: 1;
                }

                .modern-action-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 25px !important;
                    box-shadow: var(--shadow-card) !important;
                    transition: all 0.3s ease !important;
                    overflow: hidden;
                    position: relative;
                }

                .modern-action-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: var(--button-gradient);
                }

                .modern-action-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-hover) !important;
                }

                .modern-card-title {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.8rem;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .modern-card-description {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    line-height: 1.6;
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .modern-action-button {
                    background: var(--button-gradient) !important;
                    border: none !important;
                    border-radius: 15px !important;
                    padding: 15px 40px !important;
                    font-weight: 700 !important;
                    font-size: 1.1rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                    transition: all 0.3s ease !important;
                    text-decoration: none !important;
                    color: white !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                }

                .modern-action-button:hover {
                    background: var(--button-hover) !important;
                    transform: translateY(-3px) !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
                    color: white !important;
                }

                .modern-loading {
                    background: var(--bg-card);
                    border-radius: 20px;
                    padding: 60px;
                    text-align: center;
                    box-shadow: var(--shadow-card);
                    border: 2px solid var(--border-color);
                }

                .modern-loading-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 20px;
                }

                .modern-spinner {
                    width: 3rem !important;
                    height: 3rem !important;
                    color: var(--button-gradient) !important;
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
                    .modern-dashboard-container {
                        padding: 20px 10px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .modern-stat-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 1.2rem;
                    }
                    
                    .modern-stat-value {
                        font-size: 1.6rem;
                    }
                    
                    .modern-card-title {
                        font-size: 1.5rem;
                    }
                    
                    .modern-card-description {
                        font-size: 1rem;
                    }
                    
                    .modern-action-button {
                        padding: 12px 30px !important;
                        font-size: 1rem !important;
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
                    .modern-stat-card .card-body {
                        padding: 1rem !important;
                    }
                    
                    .modern-stat-icon {
                        width: 45px;
                        height: 45px;
                        font-size: 1.1rem;
                        margin-right: 0.75rem !important;
                    }
                    
                    .modern-stat-value {
                        font-size: 1.4rem;
                    }
                }
            `}</style>

            {/* Toggle de tema */}
            <div 
                className="theme-toggle d-none d-md-flex"
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

            <div className="modern-dashboard-container">
                <div className="main-Content">
                    <h1 className="modern-title">
                         Dashboard del Instructor
                    </h1>
                    
                    {loading ? (
                        <div className="modern-loading">
                            <Spinner animation="border" className="modern-spinner" />
                            <div className="modern-loading-text">
                                Cargando resumen del dashboard...
                            </div>
                        </div>
                    ) : summary && (
                        <Row className="g-4 mb-5">
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title="Fichas Asignadas" 
                                    value={summary.total_assigned_fichas} 
                                    icon="📚"
                                    color="var(--stat-primary)"
                                />
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title="Sesiones Hoy" 
                                    value={summary.today_sessions} 
                                    icon="📅"
                                    color="var(--stat-success)"
                                />
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title="Excusas Pendientes" 
                                    value={summary.pending_excuses} 
                                    icon="⏳"
                                    color="var(--stat-warning)"
                                />
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <StatCard 
                                    title="Total Aprendices" 
                                    value={summary.total_students_in_assigned_fichas} 
                                    icon="👥"
                                    color="var(--stat-info)"
                                />
                            </Col>
                        </Row>
                    )}

                    <Card className="modern-action-card">
                        <Card.Body className="p-5 text-center">
                            <h2 className="modern-card-title">
                                🔍 Gestionar Asistencia
                            </h2>
                            <p className="modern-card-description">
                                Inicia una nueva sesión de asistencia para una de tus fichas y registra a los aprendices usando reconocimiento facial avanzado.
                            </p>
                            <Link 
                                href="/dashboard/instructor/attendance"
                                className="modern-action-button"
                            >
                                 Tomar Asistencia
                            </Link>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
}