"use client";
//frontend/app/dashboard/admin/manage-users/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Table, Form, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';

const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return 'danger';
        case 'instructor': return 'warning';
        case 'student': return 'info';
        default: return 'secondary';
    }
};

const getRoleText = (role, t) => {
    switch (role) {
        case 'admin': return t('admin_manage_users.role_admin');
        case 'instructor': return t('admin_manage_users.role_instructor');
        case 'student': return t('admin_manage_users.role_student');
        default: return role;
    }
};

export default function ManageUsersPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filters, setFilters] = useState({ username: '', email: '', first_name: '', last_name: '', role: '', is_active: '' });

    const fetchUsers = async () => {
        if (!user || user.role !== 'admin') return;
        try {
            setLoading(true);
            const response = await api.get('auth/users/', { params: filters });
            setUsers(response.data.results || []);
        } catch (err) {
            setError(t("admin_manage_users.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user, filters]);

    const handleDelete = async (userId) => {
        if (!confirm(t("admin_manage_users.confirm_delete"))) return;
        try {
            await api.delete(`auth/users/${userId}/`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(t("admin_manage_users.error_deleting"));
        }
    };

    const handleOpenModal = (userToEdit = null) => {
        setEditingUser(userToEdit);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!editingUser) {
            data.role = data.role || 'student';
        }

        const promise = editingUser
            ? api.patch(`auth/users/${editingUser.id}/`, data)
            : api.post('auth/users/', data);

        try {
            await promise;
            await fetchUsers();
            setShowModal(false);
        } catch (err) {
            alert(t("admin_manage_users.error_saving", {
                error: err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || t("admin_manage_users.unknown_error")
            }));
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchUsers();
    };

    if (loading) {
        return (
            <div className="modern-loading">
                <Spinner animation="border" className="modern-spinner" />
                <div className="modern-loading-text">{t('admin_manage_users.loading')}</div>
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
                    --bg-secondary: #e9ecef;
                    --text-primary: #232129;
                    --text-secondary: #6c757d;
                    --text-muted: #8b949e;
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
                    --table-bg: #ffffff;
                    --table-text: #212529;
                    --table-hover-bg: #f8f9fa;
                    --input-bg: #ffffff;
                    --input-border: #ced4da;
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
                    --table-bg: #161b22;
                    --table-text: #f0f6fc;
                    --table-hover-bg: #21262d;
                    --input-bg: #21262d;
                    --input-border: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                }

                /* SOLUCIÓN ESPECÍFICA PARA EL LAYOUT DEL SIDEBAR */
                .modern-users-container {
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
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -15px;
                    left: 0;
                    width: 180px;
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

                .modern-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 20px !important;
                    box-shadow: var(--shadow-card) !important;
                    transition: all 0.3s ease !important;
                    overflow: hidden;
                    position: relative;
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
                    box-shadow: var(--shadow-hover) !important;
                }

                .modern-button-primary {
                    background: var(--button-gradient) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 12px 24px !important;
                    font-weight: 700 !important;
                    font-size: 1rem !important;
                    transition: all 0.3s ease !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: white !important;
                }

                .modern-button-primary:hover {
                    background: var(--button-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
                    color: white !important;
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
                    color: white !important;
                }

                .modern-button-success:hover {
                    background: var(--button-success-hover) !important;
                    transform: translateY(-1px) !important;
                    color: white !important;
                }

                .modern-button-danger {
                    background: var(--button-danger) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 6px 12px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    font-size: 0.9rem;
                    color: white !important;
                }

                .modern-button-danger:hover {
                    background: var(--button-danger-hover) !important;
                    transform: translateY(-1px) !important;
                    color: white !important;
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
                    background: var(--input-bg) !important;
                    border: 2px solid var(--input-border) !important;
                    border-radius: 12px !important;
                    padding: 12px 16px !important;
                    color: var(--text-primary) !important;
                    transition: all 0.3s ease !important;
                }

                .modern-input:focus {
                    border-color: var(--button-gradient) !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                    background: var(--input-bg) !important;
                    color: var(--text-primary) !important;
                }

                .modern-label {
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                    font-size: 0.9rem !important;
                    margin-bottom: 8px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }

                .filter-section {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .filter-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .filter-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    align-items: end;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                /* TABLA CORREGIDA - CONTRASTE MEJORADO */
                .modern-table {
                    background-color: var(--table-bg) !important;
                    border: none !important;
                }

                .modern-table th {
                    background: var(--button-gradient) !important;
                    color: white !important;
                    font-weight: 700 !important;
                    padding: 15px 12px !important;
                    font-size: 0.9rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    border: none !important;
                }

                .modern-table td {
                    padding: 12px !important;
                    border-bottom: 1px solid var(--border-color) !important;
                    /* CONTRASTE CORREGIDO AQUÍ */
                    color: var(--table-text) !important;
                    background: var(--table-bg) !important;
                    font-weight: 500 !important;
                    vertical-align: middle !important;
                }

                .modern-table tbody tr {
                    background: var(--table-bg) !important;
                }

                .modern-table tbody tr:hover {
                    background: var(--table-hover-bg) !important;
                }

                .modern-table tbody tr:hover td {
                    background: var(--table-hover-bg) !important;
                }

                .modern-badge {
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 6px 12px;
                    border-radius: 15px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
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
                    margin: 30px auto;
                    max-width: 500px;
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
                    .modern-users-container {
                        margin-left: 220px !important;
                    }
                }

                @media (max-width: 767.98px) {
                    .modern-users-container {
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
                    
                    .filter-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .theme-toggle {
                        top: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }

                /* Tabla responsive mejorada */
                @media (max-width: 767.98px) {
                    .modern-table thead {
                        display: none;
                    }

                    .modern-table tbody,
                    .modern-table tr {
                        display: block;
                        width: 100%;
                    }

                    .modern-table tr {
                        margin-bottom: 1rem;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: var(--shadow-card);
                    }

                    .modern-table td {
                        display: block;
                        text-align: right;
                        padding: 15px;
                        border: none;
                        border-bottom: 1px solid var(--border-color);
                        background: var(--table-bg) !important;
                    }

                    .modern-table td:last-child {
                        border-bottom: none;
                    }

                    .modern-table td::before {
                        content: attr(data-label);
                        float: left;
                        font-weight: 700;
                        color: var(--text-secondary);
                        padding-right: 15px;
                        text-transform: uppercase;
                        font-size: 0.8rem;
                        letter-spacing: 0.5px;
                    }
                }
            `}</style>


            <div className="modern-users-container">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="page-header">
                        <h1 className="modern-title">
                            {t('admin_manage_users.title') || 'Gestionar Usuarios'}
                        </h1>
                        <Button 
                            onClick={() => handleOpenModal()} 
                            className="modern-button-primary"
                        >
                            {t('admin_manage_users.create_user') || 'Crear Usuario'}
                        </Button>
                    </div>

                    <div className="filter-section">
                        <div className="filter-grid">
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_username') || 'Username'}
                                </label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={filters.username} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_email') || 'Email'}
                                </label>
                                <input 
                                    type="text" 
                                    name="email" 
                                    value={filters.email} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_role') || 'Rol'}
                                </label>
                                <select 
                                    name="role" 
                                    value={filters.role} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('admin_manage_users.all_roles') || 'Todos'}</option>
                                    <option value="student">{t('admin_manage_users.role_student') || 'Estudiante'}</option>
                                    <option value="instructor">{t('admin_manage_users.role_instructor') || 'Instructor'}</option>
                                    <option value="admin">{t('admin_manage_users.role_admin') || 'Admin'}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="modern-label">
                                    {t('admin_manage_users.filter_by_status') || 'Estado'}
                                </label>
                                <select
                                    name="is_active" 
                                    value={filters.is_active} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">{t('admin_manage_users.all_statuses') || 'Todos'}</option>
                                    <option value="true">{t('admin_manage_users.status_active') || 'Activo'}</option>
                                    <option value="false">{t('admin_manage_users.status_inactive') || 'Inactivo'}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <Button 
                                    onClick={handleApplyFilters} 
                                    className="modern-button-primary"
                                >
                                    {t('admin_manage_users.filter_button')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className="modern-card">
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th>{t('admin_manage_users.table_header_username') || 'Nombre'}</th>
                                    <th>{t('admin_manage_users.table_header_full_name') || 'Nombre Completo'}</th>
                                    <th>{t('admin_manage_users.table_header_email') || 'Email'}</th>
                                    <th>{t('admin_manage_users.table_header_role') || 'Rol'}</th>
                                    <th>{t('admin_manage_users.table_header_status') || 'Estado'}</th>
                                    <th>{t('admin_manage_users.table_header_actions') || 'Acciones'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            <span className="text-muted">
                                                {t('admin_manage_users.no_users') || 'No se encontraron usuarios'}
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id}>
                                            <td data-label="Username">{u.username}</td>
                                            <td data-label="Nombre">{u.first_name} {u.last_name}</td>
                                            <td data-label="Email">{u.email}</td>
                                            <td data-label="Rol">
                                                <Badge 
                                                    bg={getRoleColor(u.role)} 
                                                    className="modern-badge"
                                                >
                                                    {getRoleText(u.role, t)}
                                                </Badge>
                                            </td>
                                            <td data-label="Estado">
                                                <span className={`status-badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                                                    {u.is_active ? t('admin_manage_users.status_active') : t('admin_manage_users.status_inactive')}
                                                </span>
                                            </td>
                                            <td data-label="Acciones">
                                                <div className="d-flex gap-2">
                                                    <Button 
                                                        onClick={() => handleOpenModal(u)}
                                                        className="modern-button-warning"
                                                        size="sm"
                                                    >
                                                        {t('admin_manage_users.edit_button')}
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDelete(u.id)}
                                                        className="modern-button-danger"
                                                        size="sm"
                                                    >
                                                        {t('admin_manage_users.delete_button')}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </div>
            </div>

            {/* Modal para Crear/Editar Usuario */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                size="lg" 
                centered
                className="modern-modal"
            >
                <Modal.Header closeButton className="modern-modal-header">
                    <Modal.Title className="modern-modal-title">
                        {editingUser ? t('admin_manage_users.modal_edit_title') : t('admin_manage_users.modal_create_title')}
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handleSave}>
                    <Modal.Body className="modern-modal-body">
                        <Row className="g-3">
                            {!editingUser && (
                                <>
                                    <Col md={6}>
                                        <Form.Label className="modern-label">{t('admin_manage_users.modal_username_label')}</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="username" 
                                            defaultValue={editingUser?.username}
                                            className="modern-input"
                                            required
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="modern-label">{t('admin_manage_users.modal_password_label')}</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            name="password"
                                            className="modern-input"
                                            required={!editingUser}
                                        />
                                    </Col>
                                </>
                            )}
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('admin_manage_users.modal_name_label')}</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="first_name" 
                                    defaultValue={editingUser?.first_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label">{t('admin_manage_users.modal_lastname_label')}</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="last_name" 
                                    defaultValue={editingUser?.last_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={8}>
                                <Form.Label className="modern-label">{t('admin_manage_users.modal_email_label')}</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    name="email" 
                                    defaultValue={editingUser?.email}
                                    className="modern-input"
                                />
                            </Col>

                            {(!editingUser || editingUser.role !== 'admin') && (
                                <Col md={4}>
                                    <Form.Label className="modern-label">{t('admin_manage_users.modal_role_label')}</Form.Label>
                                    <Form.Select 
                                        name="role" 
                                        defaultValue={editingUser?.role}
                                        className="modern-input"
                                        required={!editingUser}
                                    >
                                        <option value="student">{t('admin_manage_users.role_student')}</option>
                                        <option value="instructor">{t('admin_manage_users.role_instructor')}</option>
                                    </Form.Select>
                                </Col>
                            )}

                            {editingUser?.role === 'student' && (
                                <Col md={6}>
                                    <Form.Label className="modern-label">{t('admin_manage_users.modal_student_id_label')}</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="student_id" 
                                        defaultValue={editingUser?.student_id}
                                        className="modern-input"
                                    />
                                </Col>
                            )}
                            
                            <Col md={12}>
                                <Form.Check 
                                    type="checkbox" 
                                    name="is_active" 
                                    label={t('admin_manage_users.modal_active_label')}
                                    defaultChecked={editingUser?.is_active}
                                    className="modern-label mt-3"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    
                    <Modal.Footer className="modern-modal-footer">
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowModal(false)}
                            className="me-2"
                        >
                            {t('admin_manage_users.modal_cancel')}
                        </Button>
                        <Button 
                            type="submit"
                            className="modern-button-success"
                        >
                            {t('admin_manage_users.modal_save')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}