"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Table, Form, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';

// Helper para obtener color basado en rol
const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return 'danger';
        case 'instructor': return 'warning';
        case 'student': return 'info';
        default: return 'secondary';
    }
};



const getRoleText = (role) => {
    switch (role) {
        case 'admin': return 'Administrador';
        case 'instructor': return 'Instructor';
        case 'student': return 'Estudiante';
        default: return role;
    }
};

export default function ManageUsersPage() {
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
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user]);

    const handleDelete = async (userId) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
        try {
            await api.delete(`auth/users/${userId}/`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert("No se pudo eliminar el usuario.");
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
            alert(`Error al guardar el usuario: ${err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(', ') || 'Error desconocido'}`);
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
                <div className="modern-loading-text">Cargando usuarios...</div>
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

                .modern-users-container {
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
                    margin-left: 255px;
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
                    .modern-users-container {
                        margin-left: 220px;
                        padding: 20px;
                    }
                    
                    .modern-loading {
                        margin-left: 240px;
                        padding: 40px;
                    }
                }

                @media (max-width: 768px) {
                    .modern-users-container {
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
                    
                    .theme-toggle {
                        top: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 767.98px) {
                    .modern-card {
                        overflow-x: auto;   /* Habilita scroll lateral */
                    }        
                        
                    .modern-table {
                        min-width: 700px;   /* 👈 Ajusta ancho mínimo de la tabla */
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

            <div className="modern-users-container">
                <Container fluid className="h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="modern-title">
                             Gestionar Usuarios
                        </h1>
                        <Button 
                            onClick={() => handleOpenModal()} 
                            className="modern-button-primary"
                        >
                             Crear Usuario
                        </Button>
                    </div>

                    {/* Sección de Filtros */}
                    <Card className="modern-filter-card">
                        <Row className="g-3">
                            <Col md={2}>
                                <Form.Label className="modern-label"> Username</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="username" 
                                    value={filters.username} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="modern-label"> Email</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="email" 
                                    value={filters.email} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                />
                            </Col>
                            <Col md={2}>
                                <Form.Label className="modern-label"> Rol</Form.Label>
                                <Form.Select 
                                    name="role" 
                                    value={filters.role} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">Todos</option>
                                    <option value="student">Estudiante</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Administrador</option>
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Form.Label className="modern-label"> Estado</Form.Label>
                                <Form.Select
                                    name="is_active" 
                                    value={filters.is_active} 
                                    onChange={handleFilterChange}
                                    className="modern-input"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </Form.Select>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                                <Button 
                                    onClick={handleApplyFilters} 
                                    className="modern-button-primary w-100"
                                >
                                    🔍 Filtrar
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Tabla de Usuarios */}
                    <Card className="modern-card">
                        <Table responsive className="modern-table mb-0">
                            <thead>
                                <tr>
                                    <th> Username</th>
                                    <th> Nombre Completo</th>
                                    <th> Email</th>
                                    <th> Rol</th>
                                    <th> Estado</th>
                                    <th> Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            <span className="text-muted">
                                                 No hay usuarios para mostrar
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.username}</td>
                                            <td>{u.first_name} {u.last_name}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <Badge 
                                                    bg={getRoleColor(u.role)} 
                                                    className="modern-badge"
                                                >
                                                </Badge>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                                                    {u.is_active ? ' Activo' : ' Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button 
                                                        onClick={() => handleOpenModal(u)}
                                                        className="modern-button-warning"
                                                        size="sm"
                                                    >
                                                         Editar
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDelete(u.id)}
                                                        className="modern-button-danger"
                                                        size="sm"
                                                    >
                                                         Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Container>
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
                        {editingUser ? ' Editar Usuario' : ' Crear Nuevo Usuario'}
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handleSave}>
                    <Modal.Body className="modern-modal-body">
                        <Row className="g-3">
                            {!editingUser && (
                                <>
                                    <Col md={6}>
                                        <Form.Label className="modern-label"> Username</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="username" 
                                            defaultValue={editingUser?.username}
                                            className="modern-input"
                                            required
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="modern-label"> Contraseña</Form.Label>
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
                                <Form.Label className="modern-label"> Nombre</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="first_name" 
                                    defaultValue={editingUser?.first_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={6}>
                                <Form.Label className="modern-label"> Apellido</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="last_name" 
                                    defaultValue={editingUser?.last_name}
                                    className="modern-input"
                                />
                            </Col>
                            
                            <Col md={8}>
                                <Form.Label className="modern-label">Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    name="email" 
                                    defaultValue={editingUser?.email}
                                    className="modern-input"
                                />
                            </Col>

                            {(!editingUser || editingUser.role !== 'admin') && (
                                <Col md={4}>
                                    <Form.Label className="modern-label"> Rol</Form.Label>
                                    <Form.Select 
                                        name="role" 
                                        defaultValue={editingUser?.role}
                                        className="modern-input"
                                        required={!editingUser}
                                    >
                                        <option value="student"> Estudiante</option>
                                        <option value="instructor"> Instructor</option>
                                    </Form.Select>
                                </Col>
                            )}

                            {editingUser?.role === 'student' && (
                                <Col md={6}>
                                    <Form.Label className="modern-label"> ID de Estudiante</Form.Label>
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
                                    label=" Usuario Activo"
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
                             Cancelar
                        </Button>
                        <Button 
                            type="submit"
                            className="modern-button-success"
                        >
                             Guardar Usuario
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}