
"use client";

import useAuth from '../hooks/useAuth';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function AppNavbar() { // Renamed to avoid conflict with react-bootstrap
    const { user, logout } = useAuth();

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} href="/">FaceLog 2.0</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {user ? (
                            <>
                                <Navbar.Text className="me-3">
                                    Bienvenido, <span className="fw-bold">{user.fullName}</span> ({user.role})
                                </Navbar.Text>
                                <Button variant="danger" onClick={logout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} href="/login">Login</Nav.Link>
                                <Nav.Link as={Link} href="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
