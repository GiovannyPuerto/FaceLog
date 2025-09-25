'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../context/AuthContext';
import AppNavbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';

function AppLayout({ children }) {
    const { user, isSidebarOpen } = useAuth();

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar fijo solo si hay usuario */}
            {user && <Sidebar />}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Navbar sticky */}
                {user && <AppNavbar />}

                {/* Contenido principal */}
                <main
                    className="main-content"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        marginTop: user ? '0px' : '0',
                        marginLeft: user 
                            ? (isSidebarOpen ? '225px' : '0px')  // 👈 aquí la magia
                            : '0',
                        transition: 'all 0.3s ease',
                        padding: '1rem'
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" data-bs-theme="dark">
            <head>
                <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
            </head>
            <body>
                <AuthProvider>
                    <AppLayout>{children}</AppLayout>
                </AuthProvider>
            </body>
        </html>
    );
}
