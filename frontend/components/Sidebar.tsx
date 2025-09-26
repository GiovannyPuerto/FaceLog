// frontend/components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import '../i18n';

const Sidebar = () => {
    const { user, isSidebarOpen, toggleSidebar } = useAuth();
    const pathname = usePathname();
    const { t } = useTranslation();

    if (!user) {
        return null;
    }

    const getNavLinks = (role) => {
        switch (role) {
            case 'student':
                return [
                    { href: '/dashboard/student', label: t('sidebar_my_dashboard') },
                    { href: '/dashboard/student/attendance', label: t('sidebar_my_attendance')},
                    { href: '/dashboard/student/excuses', label: t('sidebar_my_excuses')},
                    { href: '/dashboard/profile', label: t('sidebar_my_profile')},
                ];
            case 'instructor':
                return [
                    { href: '/dashboard/instructor', label: t('sidebar_dashboard')},
                    { href: '/dashboard/instructor/manage-sessions', label: t('sidebar_manage_sessions')},
                    { href: '/dashboard/instructor/attendance', label: t('sidebar_take_attendance')},
                    { href: '/dashboard/instructor/manage-excuses', label: t('sidebar_manage_excuses') },
                    { href: '/dashboard/instructor/my-fichas', label: t('sidebar_my_fichas')},
                    { href: '/dashboard/instructor/session-calendar', label: t('sidebar_session_calendar')},
                    { href: '/dashboard/profile', label: t('sidebar_my_profile')},
                ];
            case 'admin':
                return [
                    { href: '/dashboard/admin', label: t('sidebar_admin_dashboard') },
                    { href: '/dashboard/admin/manage-users', label: t('sidebar_manage_users') },
                    { href: '/dashboard/admin/manage-instructors', label: t('sidebar_manage_instructors') },
                    { href: '/dashboard/admin/manage-fichas', label: t('sidebar_manage_fichas')},
                    { href: '/dashboard/admin/global-reports', label: t('sidebar_global_reports')},
                    { href: '/dashboard/profile', label: t('sidebar_my_profile')},
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
                    width: 260px !important; /* Increased width for better spacing */
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
                    padding: 0 20px !important; /* Added horizontal padding to container */
                }

                .modern-sidebar-header {
                    color: var(--text-primary) !important;
                    font-weight: 700 !important;
                    font-size: 1.1rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                    padding: 25px 0 20px 0 !important; /* Increased vertical padding */
                    margin: 0 !important;
                    background: var(--brand-gradient) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    background-clip: text !important;
                    position: relative;
                    text-align: center; /* Center align header */
                }

                .modern-sidebar-header::after {
                    content: '';
                    position: absolute;
                    bottom: 8px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--brand-gradient);
                    border-radius: 2px;
                    margin: 0 20px; /* Margin for the line */
                }

                .modern-nav-item {
                    margin: 0 !important;
                    padding: 15px 0 !important; /* Added vertical padding to nav container */
                }

                .modern-nav-link {
                    color: var(--text-primary) !important;
                    font-weight: 500 !important;
                    font-size: 0.95rem !important;
                    padding: 16px 20px !important; /* Increased padding */
                    margin: 0 0 12px 0 !important; /* Increased bottom margin between links */
                    border-radius: 14px !important; /* Slightly more rounded */
                    transition: all 0.3s ease !important;
                    text-decoration: none !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important; /* Increased gap */
                    position: relative !important;
                    border: 2px solid transparent !important;
                    min-height: 48px !important; /* Ensure consistent height */
                }

                .modern-nav-link:hover {
                    background: var(--link-hover-bg) !important;
                    color: var(--text-primary) !important;
                    text-decoration: none !important;
                    transform: translateX(5px) !important; /* Increased translation */
                    border-color: var(--sidebar-border) !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; /* Added subtle shadow */
                }

                .modern-nav-link.active {
                    background: var(--link-active-bg) !important;
                    color: var(--link-active-text) !important;
                    font-weight: 600 !important;
                    transform: translateX(8px) !important; /* More translation for active state */
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
                    border-color: transparent !important;
                    margin-bottom: 16px !important; /* Extra margin for active link */
                }

                .modern-nav-link.active:hover {
                    background: var(--link-active-bg) !important;
                    color: var(--link-active-text) !important;
                    transform: translateX(8px) !important;
                }

                .nav-link-text {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.4; /* Better line height for readability */
                }

                .modern-nav-link::before {
                    content: '';
                    position: absolute;
                    left: -20px; /* Adjusted for new padding */
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 0;
                    background: var(--brand-gradient);
                    border-radius: 0 2px 2px 0;
                    transition: height 0.3s ease;
                }

                .modern-nav-link.active::before {
                    height: 35px; /* Slightly taller indicator */
                }

                /* Add separator between nav sections (optional) */
                .modern-nav-link:nth-last-child(2) {
                    margin-bottom: 20px !important;
                    border-bottom: 1px solid var(--sidebar-border) !important;
                    padding-bottom: 20px !important;
                }

                /* Responsive adjustments */
                @media (max-width: 991.98px) {
                    .modern-sidebar {
                        width: 240px !important;
                        padding-top: 80px !important;
                    }
                    
                    .sidebar-sticky {
                        padding: 0 15px !important;
                    }
                    
                    .modern-sidebar-header {
                        padding: 20px 0 15px 0 !important;
                        font-size: 1rem !important;
                    }
                    
                    .modern-sidebar-header::after {
                        margin: 0 15px;
                    }
                    
                    .modern-nav-link {
                        padding: 14px 16px !important;
                        margin: 0 0 10px 0 !important;
                        font-size: 0.9rem !important;
                    }
                }

                /* MÓVIL: Ocultar sidebar por defecto y mostrarlo cuando esté abierto */
                @media (max-width: 767.98px) {
                    .modern-sidebar {
                        transform: translateX(-100%) !important;
                        width: 280px !important;
                        transition: transform 0.3s ease-in-out !important;
                    }
                    
                    .modern-sidebar.sidebar-mobile-open {
                        transform: translateX(0) !important;
                    }
                    
                    .sidebar-sticky {
                        padding: 0 20px !important;
                    }
                    
                    .modern-nav-link {
                        padding: 16px 20px !important;
                        margin: 0 0 12px 0 !important;
                        min-height: 52px !important; /* Larger touch targets on mobile */
                    }
                }

                /* Main content adjustment for sidebar */
                .main-content {
                    margin-left: 280px !important; /* Adjusted for new sidebar width */
                    transition: margin-left 0.3s ease !important;
                }

                @media (max-width: 991.98px) {
                    .main-content {
                        margin-left: 260px !important;
                    }
                }

                @media (max-width: 767.98px) {
                    .main-content {  
                        margin-left: 0 !important;
                    }
                }

                /* Overlay para cerrar el sidebar en móvil */
                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 998;
                    display: none;
                }

                @media (max-width: 767.98px) {
                    .sidebar-overlay.show {
                        display: block;
                    }
                }
            `}</style>

            {/* Overlay para cerrar sidebar en móvil */}
            {isSidebarOpen && (
                <div 
                    className="sidebar-overlay show d-md-none" 
                    onClick={toggleSidebar}
                />
            )}

            <Nav className={`modern-sidebar ${isSidebarOpen ? 'sidebar-mobile-open' : ''} d-md-block`}>
                <div className="sidebar-sticky">
                    <h5 className="modern-sidebar-header">
                        {t('sidebar_main_menu')}
                    </h5>
                    
                    <div className="modern-nav-item">
                        {navLinks.map((link) => (
                            <Nav.Link
                                key={link.href}
                                as={Link}
                                href={link.href}
                                className={`modern-nav-link ${pathname === link.href ? 'active' : ''}`}
                                onClick={() => window.innerWidth <= 767 && toggleSidebar()}
                            >
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