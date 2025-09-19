"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Nav } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
    const { user } = useAuth();
    const pathname = usePathname();

    if (!user) {
        return null; // Don't render sidebar if no user is logged in
    }

    const getNavLinks = (role) => {
        switch (role) {
            case 'student':
                return [
                    { href: '/dashboard/student', label: 'Mi Dashboard' },
                    { href: '/dashboard/student/attendance', label: 'Mi Asistencia' },
                    { href: '/dashboard/student/excuses', label: 'Mis Excusas' },
                    { href: '/dashboard/profile', label: 'Mi Perfil' },
                ];
            case 'instructor':
                return [
                    { href: '/dashboard/instructor', label: 'Dashboard' },
                    { href: '/dashboard/instructor/manage-sessions', label: 'Gestionar Sesiones' },
                    { href: '/dashboard/instructor/attendance', label: 'Tomar Asistencia' },
                    { href: '/dashboard/instructor/manage-excuses', label: 'Gestionar Excusas' },
                    { href: '/dashboard/instructor/my-fichas', label: 'Mis Fichas' },
                    { href: '/dashboard/instructor/session-calendar', label: 'Calendario de Sesiones' },
                    { href: '/dashboard/profile', label: 'Mi Perfil' },
                ];
            case 'admin':
                return [
                    { href: '/dashboard/admin', label: 'Dashboard Admin' },
                    { href: '/dashboard/admin/manage-users', label: 'Gestionar Usuarios' },
                    { href: '/dashboard/admin/manage-instructors', label: 'Gestionar Instructores' },
                    { href: '/dashboard/admin/manage-fichas', label: 'Gestionar Fichas' },
                    { href: '/dashboard/admin/global-reports', label: 'Reportes Globales' },
                    { href: '/dashboard/profile', label: 'Mi Perfil' },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks(user.role);

    return (
        <Nav className="col-md-12 d-none d-md-block bg-light sidebar py-3"
             style={{ height: '100vh', position: 'fixed', top: 0, left: 0, width: '220px', paddingTop: '70px' }}>
            <div className="sidebar-sticky">
                <h5 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                    <span>Menú</span>
                </h5>
                <Nav.Item>
                    {navLinks.map((link) => (
                        <Nav.Link
                            key={link.href}
                            as={Link}
                            href={link.href}
                            className={pathname === link.href ? 'active' : ''}
                        >
                            {link.label}
                        </Nav.Link>
                    ))}
                </Nav.Item>
            </div>
        </Nav>
    );
};

export default Sidebar;