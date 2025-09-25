"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Form, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Helper para obtener color basado en estado
const getStatusColor = (status) => {
    switch (status) {
        case 'present': return 'success';
        case 'absent': return 'danger';
        case 'late': return 'warning';
        case 'excused': return 'info';
        default: return 'secondary';
    }
};

export default function StudentAttendancePage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ date_from: '', date_to: '', status: '' });

    const fetchAttendanceLogs = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const cleanedFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v != null && v !== '')
            );
            const response = await api.get('attendance/attendance-logs/', { params: cleanedFilters });
            setLogs(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch attendance logs", err);
            setError(t('student_attendance.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceLogs();
    }, [user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchAttendanceLogs();
    };

    if (loading) {
        return (
            <div className="modern-loading">
                <Spinner animation="border" className="modern-spinner" />
                <div className="modern-loading-text">{t('student_attendance.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="modern-alert m-4">
                {error}
            </Alert>
        );
    }

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --text-primary: #212529;
                    --text-secondary: #6c757d;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --alert-danger-bg: #f8d7da;
                    --alert-danger-border: #f1aeb5;
                    --alert-danger-text: #842029;
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
                    --alert-danger-bg: #2d1b1e;
                    --alert-danger-border: #8b2635;
                    --alert-danger-text: #f85149;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                }

                .modern-student-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px;
                    transition: background-color 0.3s ease;
                }

                .modern-title {
                    color: var(--text-primary);
                    font-weight: 800;
                    font-size: 2.2rem;
                    margin-bottom: 2rem;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-align: center;
                }

                .modern-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 20px !important;
                    box-shadow: var(--shadow-card) !important;
                    transition: all 0.3s ease !important;
                    overflow: hidden;
                }

                .modern-card:hover {
                    box-shadow: var(--shadow-hover) !important;
                }

                .modern-filter-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 16px !important;
                    padding: 24px !important;
                    margin-bottom: 24px !important;
                    box-shadow: var(--shadow-card) !important;
                }

                .modern-input {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 12px !important;
                    padding: 10px 15px !important;
                    color: var(--text-primary) !important;
                    transition: all 0.3s ease !important;
                }

                .modern-input:focus {
                    border-color: var(--button-gradient) !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                    background: var(--bg-card) !important;
                    color: var(--text-primary) !important;
                }

                .modern-label {
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                    font-size: 0.95rem !important;
                    margin-bottom: 8px !important;
                }

                .modern-button-primary {
                    background: var(--button-gradient) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 12px 24px !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    transition: all 0.3s ease !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .modern-button-primary:hover {
                    background: var(--button-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
                }

                .modern-attendance-list {
                    padding: 0;
                    margin: 0;
                }

                .modern-attendance-item {
                    padding: 20px 24px;
                    border-bottom: 2px solid var(--border-color);
                    transition: all 0.3s ease;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modern-attendance-item:hover {
                    background: rgba(102, 126, 234, 0.05);
                    transform: translateX(5px);
                }

                [data-theme="dark"] .modern-attendance-item:hover {
                    background: rgba(88, 166, 255, 0.1);
                }

                .modern-attendance-item:last-child {
                    border-bottom: none;
                }

                .modern-session-info h6 {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin: 0 0 4px 0;
                }

                .modern-time-info {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .modern-badge {
                    font-size: 0.85rem;
                    font-weight: 700;
                    padding: 10px 16px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .modern-stats-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: var(--shadow-card);
                    text-align: center;
                }

                .modern-stat-number {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                    margin-bottom: 8px;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .modern-stat-label {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .modern-alert {
                    background: var(--alert-danger-bg) !important;
                    border: 1px solid var(--alert-danger-border) !important;
                    color: var(--alert-danger-text) !important;
                    border-radius: 12px !important;
                    font-weight: 500 !important;
                    border-left: 5px solid var(--alert-danger-text) !important;
                }

                .modern-loading {
                    background: var(--bg-card);
                    border-radius: 20px;
                    padding: 60px;
                    text-align: center;
                    box-shadow: var(--shadow-card);
                    border: 2px solid var(--border-color);
                    margin: 30px;
                    margin-left: 270px;
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
                }

                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .empty-state-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    opacity: 0.5;
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

                @media (max-width: 991.98px) {
                    .modern-student-container {
                        margin-left: 220px;
                        padding: 20px;
                    }
                    
                    .modern-loading {
                        margin-left: 240px;
                        padding: 40px;
                    }
                }

                @media (max-width: 768px) {
                    .modern-student-container {
                        margin-left: 0;
                        padding: 15px;
                    }
                    
                    .modern-loading {
                        margin: 15px;
                        padding: 30px;
                    }
                    
                    .modern-title {
                        font-size: 1.8rem;
                    }
                    
                    .modern-filter-card {
                        padding: 16px;
                    }
                    
                    .modern-attendance-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                        padding: 16px;
                    }
                    
                    .modern-attendance-item:hover {
                        transform: none;
                    }
                    
                    .modern-stats-card {
                        padding: 16px;
                    }
                    
                    .modern-stat-number {
                        font-size: 2rem;
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

            

            <div className="modern-student-container">
                <Container fluid className="h-100">
                    <h1 className="modern-title">
                        {t('student_attendance.title')}
                    </h1>
                    
                    {/* Estadísticas rápidas */}
                    <Row className="mb-4">
                        <Col md={3}>
                            <div className="modern-stats-card">
                                <div className="modern-stat-number">
                                    {logs.filter(log => log.status === 'present').length}
                                </div>
                                <div className="modern-stat-label">{t('student_attendance.present')}</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="modern-stats-card">
                                <div className="modern-stat-number">
                                    {logs.filter(log => log.status === 'absent').length}
                                </div>
                                <div className="modern-stat-label">{t('student_attendance.absences')}</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="modern-stats-card">
                                <div className="modern-stat-number">
                                    {logs.filter(log => log.status === 'late').length}
                                </div>
                                <div className="modern-stat-label">{t('student_attendance.late_arrivals')}</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="modern-stats-card">
                                <div className="modern-stat-number">
                                    {logs.filter(log => log.status === 'excused').length}
                                </div>
                                <div className="modern-stat-label">{t('student_attendance.excused')}</div>
                            </div>
                        </Col>
                    </Row>
                    
                    {/* Sección de Filtros */}
                    <Card className="modern-filter-card">
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('student_attendance.status')}</Form.Label>
                                <Form.Select 
                                    name="status" 
                                    value={filters.status} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('student_attendance.all')}</option>
                                    <option value="present">{t('student_dashboard.status_present')}</option>
                                    <option value="absent">{t('student_dashboard.status_absent')}</option>
                                    <option value="late">{t('student_dashboard.status_late')}</option>
                                    <option value="excused">{t('student_dashboard.status_excused')}</option>
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('student_attendance.from')}</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date_from" 
                                    value={filters.date_from} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('student_attendance.to')}</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date_to" 
                                    value={filters.date_to} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                                <Button 
                                    onClick={handleApplyFilters} 
                                    className="modern-button-primary w-100"
                                >
                                    🔍 {t('student_attendance.filter')}
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Lista de Asistencia */}
                    <Card className="modern-card">
                        <Card.Body className="p-0">
                            <div className="modern-attendance-list">
                                {logs.length > 0 ? (
                                    logs.map(log => (
                                        <div key={log.id} className="modern-attendance-item">
                                            <div className="modern-session-info">
                                                <h6>
                                                    {t('student_attendance.session')}: {log.session.ficha.numero_ficha} - {new Date(log.session.date).toLocaleDateString()}
                                                </h6>
                                                {log.check_in_time && (
                                                    <div className="modern-time-info">
                                                        {t('student_attendance.time')}: {new Date(log.check_in_time).toLocaleTimeString()}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge 
                                                bg={getStatusColor(log.status)} 
                                                className="modern-badge"
                                            >
                                                {t(`student_dashboard.status_${log.status}`)}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                        
                                        <p>{t('student_attendance.no_records')}</p>
                                        <p>{t('student_attendance.adjust_filters')}</p>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        </>
    );
}
