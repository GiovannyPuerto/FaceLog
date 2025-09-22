"use client";

import useAuth from '../hooks/useAuth';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function AppNavbar() {
    const { user, logout } = useAuth();

    return (
        <>
            <style jsx global>{`
                :root {
                    --navbar-bg: #ffffff;
                    --navbar-border: #e9ecef;
                    --text-primary: #212529;
                    --text-secondary: #6c757d;
                    --brand-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --logout-gradient: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                    --logout-hover: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
                    --shadow-navbar: 0 4px 20px rgba(0, 0, 0, 0.08);
                }

                [data-theme="dark"] {
                    --navbar-bg: #161b22;
                    --navbar-border: #30363d;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --brand-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --logout-gradient: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --logout-hover: linear-gradient(135deg, #ff6b6b 0%, #f85149 100%);
                    --shadow-navbar: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                .modern-navbar {
                    background: var(--navbar-bg) !important;
                    border-bottom: 2px solid var(--navbar-border) !important;
                    box-shadow: var(--shadow-navbar) !important;
                    padding: 1rem 0 !important;
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 1010 !important;
                    transition: all 0.3s ease !important;
                }

                .modern-navbar-brand {
                    font-weight: 800 !important;
                    font-size: 1.8rem !important;
                    background: var(--brand-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    background-clip: text !important;
                    text-decoration: none !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    transition: all 0.3s ease !important;
                }

                .modern-navbar-brand:hover {
                    transform: scale(1.02) !important;
                    text-decoration: none !important;
                }

                .modern-brand-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--brand-gradient);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .modern-welcome-text {
                    color: var(--text-primary) !important;
                    font-size: 1rem !important;
                    font-weight: 500 !important;
                    margin-right: 1.5rem !important;
                    padding: 8px 16px !important;
                    background: rgba(0, 0, 0, 0.03) !important;
                    border-radius: 25px !important;
                    border: 1px solid var(--navbar-border) !important;
                    transition: all 0.3s ease !important;
                }

                [data-theme="dark"] .modern-welcome-text {
                    background: rgba(255, 255, 255, 0.05) !important;
                }

                .modern-welcome-text:hover {
                    background: rgba(0, 0, 0, 0.05) !important;
                    transform: translateY(-1px) !important;
                }

                [data-theme="dark"] .modern-welcome-text:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                .modern-user-name {
                    background: var(--brand-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    background-clip: text !important;
                    font-weight: 700 !important;
                }

                .modern-user-role {
                    background: var(--logout-gradient) !important;
                    color: white !important;
                    padding: 2px 8px !important;
                    border-radius: 12px !important;
                    font-size: 0.8rem !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    margin-left: 8px !important;
                }

                .modern-logout-btn {
                    background: var(--logout-gradient) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 10px 20px !important;
                    font-weight: 600 !important;
                    font-size: 0.95rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
                }

                .modern-logout-btn:hover {
                    background: var(--logout-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
                }

                .modern-nav-link {
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    padding: 10px 20px !important;
                    border-radius: 12px !important;
                    margin: 0 8px !important;
                    transition: all 0.3s ease !important;
                    text-decoration: none !important;
                    position: relative !important;
                }

                .modern-nav-link:hover {
                    background: rgba(0, 0, 0, 0.05) !important;
                    transform: translateY(-1px) !important;
                    color: var(--text-primary) !important;
                    text-decoration: none !important;
                }

                [data-theme="dark"] .modern-nav-link:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                .modern-nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 3px;
                    background: var(--brand-gradient);
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }

                .modern-nav-link:hover::after {
                    width: 60%;
                }

                .navbar-toggler {
                    border: 2px solid var(--navbar-border) !important;
                    border-radius: 8px !important;
                    padding: 8px 12px !important;
                }

                .navbar-toggler:focus {
                    box-shadow: none !important;
                    border-color: var(--brand-gradient) !important;
                }

                @media (max-width: 991.98px) {
                    .modern-navbar-brand {
                        font-size: 1.5rem !important;
                    }
                    
                    .modern-brand-icon {
                        width: 35px;
                        height: 35px;
                        font-size: 1rem;
                    }
                    
                    .modern-welcome-text {
                        font-size: 0.9rem !important;
                        padding: 6px 12px !important;
                        margin-right: 1rem !important;
                        margin-bottom: 10px !important;
                    }
                    
                    .modern-logout-btn {
                        width: 100%;
                        margin-top: 10px;
                    }
                    
                    .modern-nav-link {
                        margin: 5px 0 !important;
                        text-align: center;
                    }
                }
            `}</style>

            <Navbar className="modern-navbar" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} href="/" className="modern-navbar-brand">
                        <div className="modern-brand-icon">
                            🔍
                        </div>
                        FaceLog 2.0
                    </Navbar.Brand>
                    
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            {user ? (
                                <>
                                    <Navbar.Text className="modern-welcome-text">
                                        Bienvenido, <span className="modern-user-name">{user.fullName}</span>
                                        <span className="modern-user-role">{user.role}</span>
                                    </Navbar.Text>
                                    <Button 
                                        variant="danger" 
                                        onClick={logout}
                                        className="modern-logout-btn"
                                    >
                                         Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} href="/login" className="modern-nav-link">
                                         Login
                                    </Nav.Link>
                                    <Nav.Link as={Link} href="/register" className="modern-nav-link">
                                         Register
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}