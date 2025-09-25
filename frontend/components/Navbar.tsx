"use client";
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon } from 'lucide-react';
import '../i18n';

export default function AppNavbar() {
    const { user, logout, toggleSidebar } = useAuth();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

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
                    height: 70px !important;
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 1010 !important;
                    display: flex;
                    align-items: center;
                }

                .modern-navbar-brand {
                    font-weight: 800 !important;
                    font-size: 1.8rem !important;
                    background: var(--brand-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    text-decoration: none !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
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
                    margin-right: 1rem !important;
                    padding: 6px 12px !important;
                    background: rgba(0, 0, 0, 0.03) !important;
                    border-radius: 20px !important;
                    border: 1px solid var(--navbar-border) !important;
                }

                [data-theme="dark"] .modern-welcome-text {
                    background: rgba(255, 255, 255, 0.05) !important;
                }

                .modern-user-name {
                    background: var(--brand-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
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
                    margin-left: 8px !important;
                }

                .modern-logout-btn {
                    background: var(--logout-gradient) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 8px 16px !important;
                    font-weight: 600 !important;
                    font-size: 0.9rem !important;
                    text-transform: uppercase !important;
                }

                .modern-logout-btn:hover {
                    background: var(--logout-hover) !important;
                    transform: translateY(-2px) !important;
                }

                .modern-nav-link {
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    padding: 8px 14px !important;
                    border-radius: 12px !important;
                    margin: 0 6px !important;
                }

                .modern-nav-link:hover {
                    background: rgba(0, 0, 0, 0.05) !important;
                }

                [data-theme="dark"] .modern-nav-link:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                .language-toggle-button, .theme-toggle-button {
                    background: rgba(0, 0, 0, 0.05) !important;
                    border: 1px solid var(--navbar-border) !important;
                    border-radius: 12px !important;
                    padding: 6px 12px !important;
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                }

                [data-theme="dark"] .language-toggle-button, [data-theme="dark"] .theme-toggle-button {
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                .modern-navbar .nav {
                    gap: 12px !important;
                }

                @media (max-width: 991.98px) {
                    .navbar-collapse {
                        transition: height 0.3s ease-in-out;
                        overflow: hidden;
                        height: 0;
                    }

                    .navbar-collapse.collapsing {
                        min-height: 0 !important;
                    }

                    .navbar-collapse.show {
                        height: auto;
                        border-top: 1px solid var(--navbar-border);
                        background-color: var(--navbar-bg);
                        border-bottom-left-radius: 12px;
                        border-bottom-right-radius: 12px;
                        padding: 1rem;
                    }
                }
            `}</style>

            <Navbar className="modern-navbar" expand="lg">
                <Container fluid>
                    {/* Botón para abrir/cerrar sidebar en móvil */}
                    <Button
                        variant="outline-secondary"
                        onClick={toggleSidebar}
                        className="d-lg-none me-2"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </Button>

                    {/* Logo / Marca */}
                    <Navbar.Brand as={Link} href="/" className="modern-navbar-brand me-auto">
                        
                        FaceLog
                    </Navbar.Brand>

                    {/* Botón de hamburguesa para colapsar el Navbar en móvil */}
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            {user ? (
                                <>
                                    <Navbar.Text className="modern-welcome-text d-none d-lg-flex align-items-center">
                                        {t('welcome')}, {" "}
                                        <span className="modern-user-name ms-1">{user.fullName}</span>
                                        <span className="modern-user-role ms-2">{user.role}</span>
                                    </Navbar.Text>
                                    <Button
                                        variant="danger"
                                        onClick={logout}
                                        className="modern-logout-btn ms-lg-2"
                                    >
                                        {t('logout')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} href="/login" className="modern-nav-link">
                                        {t('login')}
                                    </Nav.Link>
                                    <Nav.Link as={Link} href="/register" className="modern-nav-link">
                                        {t('register')}
                                    </Nav.Link>
                                </>
                            )}

                            <div className="d-flex align-items-center mt-2 mt-lg-0 ms-lg-3">
                                <Button onClick={toggleTheme} className="theme-toggle-button me-2">
                                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                </Button>

                                <Button onClick={toggleLanguage} className="language-toggle-button">
                                    <Globe size={18} />
                                    <span className="ms-1">{i18n.language.toUpperCase()}</span>
                                </Button>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}