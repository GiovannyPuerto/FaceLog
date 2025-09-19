"use client";

import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card bg="secondary" text="white" style={{ width: '100%', maxWidth: '400px' }}>
                <Card.Body className="p-4">
                    <h1 className="text-center mb-4">Iniciar Sesión</h1>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formBasicUsername">
                            <Form.Label>Usuario</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ingresa tu usuario" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Contraseña" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </Form.Group>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                            {loading ? 'Iniciando...' : 'Login'}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p>
                            ¿No tienes una cuenta? <Link href="/register">Regístrate aquí</Link>
                        </p>
                        <p>
                            <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}