"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Nav } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
    const { user } = useAuth();
    const pathname = usePathname();

    if (!user) {
        return null;
    }

    const getNavLinks = (role) => {
        switch (role) {
            case 'student':
                return [
                    { href: '/dashboard/student', label: 'Mi Dashboard' },
                    { href: '/dashboard/student/attendance', label: 'Mi Asistencia'},
                    { href: '/dashboard/student/excuses', label: 'Mis Excusas'},
                    { href: '/dashboard/profile', label: 'Mi Perfil', icon: '👤' },
                ];
            case 'instructor':
                return [
                    { href: '/dashboard/instructor', label: 'Dashboard'},
                    { href: '/dashboard/instructor/manage-sessions', label: 'Gestionar Sesiones'},
                    { href: '/dashboard/instructor/attendance', label: 'Tomar Asistencia'},
                    { href: '/dashboard/instructor/manage-excuses', label: 'Gestionar Excusas' },
                    { href: '/dashboard/instructor/my-fichas', label: 'Mis Fichas'},
                    { href: '/dashboard/instructor/session-calendar', label: 'Calendario de Sesiones'},
                    { href: '/dashboard/profile', label: 'Mi Perfil'},
                ];
            case 'admin':
                return [
                    { href: '/dashboard/admin', label: 'Dashboard Admin', icon: '⚡' },
                    { href: '/dashboard/admin/manage-users', label: 'Gestionar Usuarios', icon: '👥' },
                    { href: '/dashboard/admin/manage-instructors', label: 'Gestionar Instructores', icon: '👨‍🏫' },
                    { href: '/dashboard/admin/manage-fichas', label: 'Gestionar Fichas', icon: '📚' },
                    { href: '/dashboard/admin/global-reports', label: 'Reportes Globales', icon: '📈' },
                    { href: '/dashboard/profile', label: 'Mi Perfil', icon: '👤' },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks(user.role);

    return (
        <>
            <style jsx global>{`
                :root {
                    --sidebar-bg: #ffffff;
                    --sidebar-border: #e9ecef;
                    --text-primary: #212529;
                    --text-secondary: #6c757d;
                    --link-hover-bg: rgba(102, 126, 234, 0.1);
                    --link-active-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --link-active-text: #ffffff;
                    --shadow-sidebar: 4px 0 20px rgba(0, 0, 0, 0.05);
                    --brand-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                [data-theme="dark"] {
                    --sidebar-bg: #0d1117;
                    --sidebar-border: #21262d;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --link-hover-bg: rgba(88, 166, 255, 0.1);
                    --link-active-bg: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --link-active-text: #ffffff;
                    --shadow-sidebar: 4px 0 20px rgba(0, 0, 0, 0.3);
                    --brand-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                }

                .modern-sidebar {
                    background: var(--sidebar-bg) !important;
                    border-right: 2px solid var(--sidebar-border) !important;
                    box-shadow: var(--shadow-sidebar) !important;
                    height: 100vh !important;
                    position: fixed  !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 225px !important;
                    padding-top: 90px !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    transition: all 0.3s ease !important;
                    z-index: 999 !important;
                    overflow-y: auto !important;
                }

                .modern-sidebar::-webkit-scrollbar {
                    width: 6px;
                }

                .modern-sidebar::-webkit-scrollbar-track {
                    background: var(--sidebar-bg);
                }

                .modern-sidebar::-webkit-scrollbar-thumb {
                    background: var(--sidebar-border);
                    border-radius: 3px;
                }

                .modern-sidebar::-webkit-scrollbar-thumb:hover {
                    background: var(--text-secondary);
                }

                .sidebar-sticky {
                    padding: 0 !important;
                }

                .modern-sidebar-header {
                    color: var(--text-primary) !important;
                    font-weight: 700 !important;
                    font-size: 1.1rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                    padding: 20px 15px 15px 15px !important;
                    margin: 0 !important;
                    background: var(--brand-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    background-clip: text !important;
                    position: relative;
                }

                .modern-sidebar-header::after {
                    content: '';
                    position: absolute;
                    bottom: 5px;
                    left: 15px;
                    right: 15px;
                    height: 3px;
                    background: var(--brand-gradient);
                    border-radius: 2px;
                }

                .modern-nav-item {
                    margin: 0 !important;
                    padding: 0 !important;
                }

                .modern-nav-link {
                    color: var(--text-primary) !important;
                    font-weight: 500 !important;
                    font-size: 0.95rem !important;
                    padding: 15px 15px !important;
                    margin: 0 10px 8px 10px !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                    text-decoration: none !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    position: relative !important;
                    border: 2px solid transparent !important;
                }

                .modern-nav-link:hover {
                    background: var(--link-hover-bg) !important;
                    color: var(--text-primary) !important;
                    text-decoration: none !important;
                    transform: translateX(3px) !important;
                    border-color: var(--sidebar-border) !important;
                }

                .modern-nav-link.active {
                    background: var(--link-active-bg) !important;
                    color: var(--link-active-text) !important;
                    font-weight: 600 !important;
                    transform: translateX(5px) !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
                    border-color: transparent !important;
                }

                .modern-nav-link.active:hover {
                    background: var(--link-active-bg) !important;
                    color: var(--link-active-text) !important;
                    transform: translateX(5px) !important;
                }

                

                .nav-link-text {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .modern-nav-link::before {
                    content: '';
                    position: absolute;
                    left: -10px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 0;
                    background: var(--brand-gradient);
                    border-radius: 0 2px 2px 0;
                    transition: height 0.3s ease;
                }

                .modern-nav-link.active::before {
                    height: 30px;
                }

                /* Responsive adjustments */
                @media (max-width: 991.98px) {
                    .modern-sidebar {
                        width: 220px !important;
                        padding-top: 80px !important;
                    }
                    
                    .modern-sidebar-header {
                        padding: 15px 20px 10px 20px !important;
                        font-size: 1rem !important;
                    }
                    
                    .modern-sidebar-header::after {
                        left: 20px;
                        right: 20px;
                    }
                    
                    .modern-nav-link {
                        padding: 12px 20px !important;
                        margin: 0 10px 6px 10px !important;
                        font-size: 0.9rem !important;
                    }
                }

                @media (max-width: 767.98px) {
                    .modern-sidebar {
                        transform: translateX(-100%);
                        width: 100% !important;
                        max-width: 300px !important;
                    }
                    
                    .sidebar-open .modern-sidebar {
                        transform: translateX(0);
                    }
                }

                /* Main content adjustment for sidebar */
                .main-content {
                    margin-left: 240px !important;
                    transition: margin-left 0.3s ease !important;
                }

                @media (max-width: 991.98px) {
                    .main-content {
                        margin-left: 220px !important;
                    }
                }

                @media (max-width: 767.98px) {
                    .main-content {  
                        margin-left: 0 !important;
                    }
                }
            `}</style>

            <Nav className="modern-sidebar d-none d-md-block">
                <div className="sidebar-sticky">
                    <h5 className="modern-sidebar-header">
                         Menú Principal
                    </h5>
                    
                    <div className="modern-nav-item">
                        {navLinks.map((link) => (
                            <Nav.Link
                                key={link.href}
                                as={Link}
                                href={link.href}
                                className={`modern-nav-link ${pathname === link.href ? 'active' : ''}`}
                            >
                                <span className="nav-link-icon">{link.icon}</span>
                                <span className="nav-link-text">{link.label}</span>
                            </Nav.Link>
                        ))}
                    </div>
                </div>
            </Nav>
        </>
    );
};

export default Sidebar;