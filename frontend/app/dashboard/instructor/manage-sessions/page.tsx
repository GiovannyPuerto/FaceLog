"use client";
// frontend/app/dashboard/instructor/manage-sessions/page.tsx
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Table, Form, Row, Col, Modal, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function ManageSessionsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [fichas, setFichas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [filters, setFilters] = useState({ date: '', ficha: '', is_active: '' });

    const fetchSessions = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/sessions/', { params: filters });
            setSessions(response.data.results || response.data);
        } catch (err) {
            setError(t('manage_sessions.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructorFichas = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            const response = await api.get('attendance/my-fichas/');
            setFichas(response.data.results || []);
        } catch (err) {
            console.error("Failed to fetch instructor fichas for filter/modal", err);
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchInstructorFichas();
    }, [user]);

    const handleDelete = async (sessionId) => {
        if (!confirm(t('manage_sessions.confirm_delete'))) return;
        try {
            await api.delete(`attendance/sessions/${sessionId}/`);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err) {
            alert(t('manage_sessions.error_deleting'));
        }
    };

    const handleOpenModal = (session = null) => {
        setEditingSession(session);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSession(null);
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        data.is_active = data.is_active === 'on' ? 'true' : 'false';

        const promise = editingSession
            ? api.patch(`attendance/sessions/${editingSession.id}/`, data)
            : api.post('attendance/sessions/', data);

        try {
            await promise;
            await fetchSessions();
            setShowModal(false);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido';
            alert(t('manage_sessions.error_saving', { error: errorMessage }));
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchSessions();
    };

    if (loading) {
        return (
            <div className="modern-loading">
                <Spinner animation="border" className="modern-spinner" />
                <div className="modern-loading-text">{t('manage_sessions.loading')}</div>
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
                    --text-primary: #000000ff;
                    --text-secondary: #6c757d;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --button-success: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    --button-success-hover: linear-gradient(135deg, #218838 0%, #1ea085 100%);
                    --button-danger: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    --button-danger-hover: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
                    --button-warning: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
                    --button-warning-hover: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --alert-danger-bg: #f8d7da;
                    --alert-danger-border: #f1aeb5;
                    --alert-danger-text: #842029;
                    --modal-bg: #ffffff;
                    --modal-border: #dee2e6;
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --button-success: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --button-success-hover: linear-gradient(135deg, #1a6928 0%, #238636 100%);
                    --button-danger: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --button-danger-hover: linear-gradient(135deg, #da3633 0%, #c93026 100%);
                    --button-warning: linear-gradient(135deg, #d29922 0%, #b08800 100%);
                    --button-warning-hover: linear-gradient(135deg, #b08800 0%, #9c7700 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --alert-danger-bg: #2d1b1e;
                    --alert-danger-border: #8b2635;
                    --alert-danger-text: #f85149;
                    --modal-bg: #21262d;
                    --modal-border: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                }

                .modern-sessions-container {
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

                .modern-button-success {
                    background: var(--button-success) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 10px 20px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .modern-button-success:hover {
                    background: var(--button-success-hover) !important;
                    transform: translateY(-1px) !important;
                }

                .modern-button-danger {
                    background: var(--button-danger) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 6px 12px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    font-size: 0.9rem;
                }

                .modern-button-danger:hover {
                    background: var(--button-danger-hover) !important;
                    transform: translateY(-1px) !important;
                }

                .modern-button-warning {
                    background: var(--button-warning) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 6px 12px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    color: #212529 !important;
                    font-size: 0.9rem;
                }

                .modern-button-warning:hover {
                    background: var(--button-warning-hover) !important;
                    transform: translateY(-1px) !important;
                    color: #212529 !important;
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

                .modern-table {
                    background: var(--bg-card) !important;
                }

                .modern-table th {
                    background: var(--button-gradient) !important;
                    color: white !important;
                    font-weight: 700 !important;
                    padding: 15px 12px !important;
                    font-size: 0.95rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    border: none !important;
                }

                .modern-table td {
                    padding: 12px !important;
                    border-bottom: 1px solid var(--border-color) !important;
                    color: var(--text-primary) !important;
                    background: var(--bg-card) !important;
                    font-weight: 500 !important;
                    vertical-align: middle !important;
                }

                .modern-table tbody tr:hover {
                    background: rgba(102, 126, 234, 0.05) !important;
                }

                [data-theme="dark"] .modern-table tbody tr:hover {
                    background: rgba(88, 166, 255, 0.1) !important;
                }

                .modern-filter-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 16px !important;
                    padding: 24px !important;
                    margin-bottom: 24px !important;
                    box-shadow: var(--shadow-card) !important;
                }

                .modern-modal .modal-content {
                    background: var(--modal-bg) !important;
                    border: 1px solid var(--modal-border) !important;
                    border-radius: 20px !important;
                    overflow: hidden;
                }

                .modern-modal-header {
                    background: var(--button-gradient) !important;
                    border: none !important;
                    padding: 24px 30px !important;
                }

                .modern-modal-title {
                    color: white !important;
                    font-weight: 700 !important;
                    font-size: 1.4rem !important;
                    margin: 0 !important;
                }

                .modern-modal-body {
                    padding: 30px !important;
                    background: var(--modal-bg) !important;
                }

                .modern-modal-footer {
                    background: var(--modal-bg) !important;
                    border: none !important;
                    padding: 20px 30px !important;
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

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-active {
                    background: var(--button-success);
                    color: white;
                }

                .status-inactive {
                    background: var(--text-secondary);
                    color: white;
                }

                

                @media (max-width: 991.98px) {
                    .modern-sessions-container {
                        margin-left: 220px;
                        padding: 20px;
                    }
                    
                    .modern-loading {
                        margin-left: 240px;
                        padding: 40px;
                    }
                }

                @media (max-width: 768px) {
                    .modern-sessions-container {
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
                    
                    

                   
                }
            `}</style>

            

            <div className="modern-sessions-container">
                <Container fluid className="h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="modern-title">
                            {t('manage_sessions.title')}
                        </h1>
                        <Button 
                            onClick={() => handleOpenModal()} 
                            className="modern-button-primary"
                        >
                            {t('manage_sessions.create_session')}
                        </Button>
                    </div>

                    {/* Sección de Filtros */}
                    <Card className="modern-filter-card">
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('manage_sessions.filter_by_ficha')}</Form.Label>
                                <Form.Select 
                                    name="ficha" 
                                    value={filters.ficha} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('manage_sessions.all_fichas')}</option>
                                    {fichas.map(f => (
                                        <option key={f.id} value={f.id}>{f.numero_ficha}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('manage_sessions.filter_by_date')}</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date" 
                                    value={filters.date} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="modern-label">{t('manage_sessions.filter_by_status')}</Form.Label>
                                <Form.Select 
                                    name="is_active" 
                                    value={filters.is_active} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('manage_sessions.all_statuses')}</option>
                                    <option value="true">{t('manage_sessions.status_active')}</option>
                                    <option value="false">{t('manage_sessions.status_inactive')}</option>
                                </Form.Select>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                                <Button 
                                    onClick={handleApplyFilters} 
                                    className="modern-button-primary w-100"
                                >
                                    {t('manage_sessions.apply_filters')}
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Tabla de Sesiones */}
                    <div className="d-none d-lg-block">
                        <Card className="modern-card">
                            <Table responsive className="modern-table mb-0">
                                <thead>
                                    <tr>
                                        <th>{t('manage_sessions.table_header_ficha')}</th>
                                        <th>{t('manage_sessions.table_header_date')}</th>
                                        <th>{t('manage_sessions.table_header_start')}</th>
                                        <th>{t('manage_sessions.table_header_end')}</th>
                                        <th>{t('manage_sessions.table_header_leniency')}</th>
                                        <th>{t('manage_sessions.table_header_status')}</th>
                                        <th>{t('manage_sessions.table_header_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">
                                                <span className="text-muted">{t('manage_sessions.no_sessions_found')}</span>
                                            </td>
                                        </tr>
                                    ) : (
                                        sessions.map(session => (
                                            <tr key={session.id}>
                                                <td>{session.ficha.numero_ficha}</td>
                                                <td>{session.date}</td>
                                                <td>{session.start_time}</td>
                                                <td>{session.end_time}</td>
                                                <td>{session.permisividad || 0} {t('manage_sessions.leniency_minutes')}</td>
                                                <td>
                                                    <span className={`status-badge ${session.is_active ? 'status-active' : 'status-inactive'}`}>
                                                        {session.is_active ? t('manage_sessions.status_active') : t('manage_sessions.status_inactive')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button onClick={() => handleOpenModal(session)} className="modern-button-warning" size="sm">{t('manage_sessions.edit_button')}</Button>
                                                        <Button onClick={() => handleDelete(session.id)} className="modern-button-danger" size="sm">{t('manage_sessions.delete_button')}</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </div>

                    {/* Mobile and Tablet Card View */}
                    <div className="d-lg-none">
                        {sessions.length === 0 ? (
                            <Card className="modern-card text-center py-4">
                                <span className="text-muted">{t('manage_sessions.no_sessions_found')}</span>
                            </Card>
                        ) : (
                            sessions.map(session => (
                                <Card key={session.id} className="modern-card mb-3">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold">{session.ficha.numero_ficha}</h5>
                                            <span className={`status-badge ${session.is_active ? 'status-active' : 'status-inactive'}`}>
                                                {session.is_active ? t('manage_sessions.status_active') : t('manage_sessions.status_inactive')}
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-2">{session.date}</p>
                                        <Row>
                                            <Col>
                                                <p className="small mb-1"><strong>{t('manage_sessions.table_header_start')}:</strong> {session.start_time}</p>
                                                <p className="small mb-1"><strong>{t('manage_sessions.table_header_end')}:</strong> {session.end_time}</p>
                                                <p className="small mb-0"><strong>{t('manage_sessions.table_header_leniency')}:</strong> {session.permisividad || 0} {t('manage_sessions.leniency_minutes')}</p>
                                            </Col>
                                        </Row>
                                        <hr />
                                        <div className="d-flex justify-content-end gap-2 mt-2">
                                            <Button onClick={() => handleOpenModal(session)} className="modern-button-warning" size="sm">{t('manage_sessions.edit_button')}</Button>
                                            <Button onClick={() => handleDelete(session.id)} className="modern-button-danger" size="sm">{t('manage_sessions.delete_button')}</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                        )}
                    </div>
                </Container>
            </div>

            {/* Modal para Crear/Editar Sesión */}
            <Modal 
                show={showModal} 
                onHide={handleCloseModal} 
                size="lg" 
                centered
                className="modern-modal"
            >
                <Modal.Header closeButton className="modern-modal-header">
                    <Modal.Title className="modern-modal-title">
                        {editingSession ? t('manage_sessions.modal_edit_title') : t('manage_sessions.modal_create_title')}
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handleSave}>
                    <Modal.Body className="modern-modal-body">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.table_header_ficha')}</Form.Label>
                                <Form.Select 
                                    name="ficha" 
                                    defaultValue={editingSession?.ficha.id}
                                    className="modern-input"
                                    required
                                >
                                    <option value="">{t('manage_sessions.modal_select_ficha')}</option>
                                    {fichas.map(f => (
                                        <option key={f.id} value={f.id}>{f.numero_ficha}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_date')}</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="date" 
                                    defaultValue={editingSession?.date}
                                    className="modern-input"
                                    required
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_start_time')}</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    name="start_time" 
                                    defaultValue={editingSession?.start_time}
                                    className="modern-input"
                                    required
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_end_time')}</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    name="end_time" 
                                    defaultValue={editingSession?.end_time}
                                    className="modern-input"
                                    required
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('manage_sessions.modal_leniency')}</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="permisividad" 
                                    defaultValue={editingSession?.permisividad || 0}
                                    className="modern-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </Col>
                            
                            <Col md={6} className="d-flex align-items-center">
                                <Form.Check 
                                    type="checkbox" 
                                    name="is_active" 
                                    label={t('manage_sessions.modal_active_session')}
                                    defaultChecked={editingSession?.is_active}
                                    className="modern-label mt-4"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    
                    <Modal.Footer className="modern-modal-footer">
                        <Button 
                            variant="secondary" 
                            onClick={handleCloseModal}
                            className="me-2"
                        >
                            {t('manage_sessions.modal_cancel')}
                        </Button>
                        <Button 
                            type="submit"
                            className="modern-button-success"
                        >
                            {t('manage_sessions.modal_save')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}