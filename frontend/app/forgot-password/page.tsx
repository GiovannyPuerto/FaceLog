'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe } from 'lucide-react';
import '../../i18n';

export default function ForgotPasswordPage() {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const savedLang = localStorage.getItem('i18nextLng') || 'es';
        if (i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang);
        }
    }, [i18n]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post('auth/password/reset/', { email });
            const token = response.data.token;
            
            setSuccess(t('forgot_password_success_message'));
            
            setTimeout(() => {
                router.push(`/reset-password?token=${token}`);
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || t('forgot_password_error_message'));
            setLoading(false);
        }
    };

    return (
        <>
            <style jsx global>{`
                .control-buttons-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 1000;
                }

                .control-button {
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
                }

                .control-button:hover {
                    transform: scale(1.1) rotate(12deg);
                    box-shadow: var(--shadow-hover);
                }
                
                .language-text {
                    font-size: 0.9rem;
                    font-weight: 700;
                }

                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --text-primary: #212529;
                    --text-secondary: #6c757d;
                    --border-color: #e9ecef;
                    --input-bg: #ffffff;
                    --input-border: #ced4da;
                    --input-focus: #0d6efd;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.12);
                    --alert-danger-bg: #f8d7da;
                    --alert-danger-border: #f1aeb5;
                    --alert-danger-text: #842029;
                    --alert-success-bg: #d1e7dd;
                    --alert-success-border: #badbcc;
                    --alert-success-text: #0f5132;
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --border-color: #30363d;
                    --input-bg: #0d1117;
                    --input-border: #30363d;
                    --input-focus: #58a6ff;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --shadow-card: 0 15px 50px rgba(0, 0, 0, 0.6), 0 5px 15px rgba(0, 0, 0, 0.4);
                    --shadow-hover: 0 20px 60px rgba(0, 0, 0, 0.8), 0 8px 25px rgba(0, 0, 0, 0.6);
                    --alert-danger-bg: #2d1b1e;
                    --alert-danger-border: #8b2635;
                    --alert-danger-text: #f85149;
                    --alert-success-bg: #0f2419;
                    --alert-success-border: #238636;
                    --alert-success-text: #2ea043;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                }

                .modern-container {
                    background: var(--bg-primary);
                    transition: background-color 0.3s ease;
                }

                .modern-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1) !important;
                    backdrop-filter: blur(20px);
                    transition: all 0.3s ease;
                }

                .modern-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 25px rgba(0, 0, 0, 0.15) !important;
                }

                .modern-title {
                    color: var(--text-primary) !important;
                    font-weight: 700 !important;
                    font-size: 2rem !important;
                    position: relative;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 4px;
                    background: var(--button-gradient);
                    border-radius: 2px;
                }

                .modern-label {
                    color: var(--text-primary) !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    margin-bottom: 8px !important;
                }

                .modern-input {
                    background: var(--input-bg) !important;
                    border: 2px solid var(--input-border) !important;
                    border-radius: 15px !important;
                    padding: 15px 20px !important;
                    font-size: 1rem !important;
                    color: var(--text-primary) !important;
                    transition: all 0.3s ease !important;
                    box-shadow: none !important;
                }

                .modern-input::placeholder {
                    color: var(--text-secondary) !important;
                    opacity: 0.8;
                }

                .modern-input:focus {
                    border-color: var(--input-focus) !important;
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1) !important;
                    transform: translateY(-2px) !important;
                    background: var(--input-bg) !important;
                    color: var(--text-primary) !important;
                }

                [data-theme="dark"] .modern-input:focus {
                    box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.2) !important;
                }

                .modern-button {
                    background: var(--button-gradient) !important;
                    border: none !important;
                    border-radius: 15px !important;
                    padding: 15px 30px !important;
                    font-weight: 700 !important;
                    font-size: 1.1rem !important;
                    transition: all 0.3s ease !important;
                    position: relative;
                    overflow: hidden;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .modern-button:hover {
                    background: var(--button-hover) !important;
                    transform: translateY(-3px) !important;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
                }

                .modern-button:active {
                    transform: translateY(-1px) !important;
                }

                .modern-button:disabled {
                    opacity: 0.8;
                    cursor: not-allowed;
                    transform: none !important;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }

                .modern-alert {
                    border-radius: 15px !important;
                    padding: 15px 20px !important;
                    font-weight: 500 !important;
                    border-left: 5px solid !important;
                }

                .modern-alert.alert-danger {
                    background: var(--alert-danger-bg) !important;
                    border: 1px solid var(--alert-danger-border) !important;
                    color: var(--alert-danger-text) !important;
                    border-left-color: var(--alert-danger-text) !important;
                }

                .modern-alert.alert-success {
                    background: var(--alert-success-bg) !important;
                    border: 1px solid var(--alert-success-border) !important;
                    color: var(--alert-success-text) !important;
                    border-left-color: var(--alert-success-text) !important;
                }

                .modern-link {
                    color: var(--input-focus) !important;
                    text-decoration: none !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    position: relative;
                }

                .modern-link:hover {
                    color: var(--input-focus) !important;
                    text-decoration: none !important;
                    transform: translateY(-1px);
                }

                .modern-link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: var(--input-focus);
                    transition: width 0.3s ease;
                }

                .modern-link:hover::after {
                    width: 100%;
                }

                .modern-text {
                    color: var(--text-secondary) !important;
                    font-size: 0.95rem !important;
                    font-weight: 500 !important;
                }

                @media (max-width: 576px) {
                    .modern-card {
                        margin: 15px !important;
                        border-radius: 15px !important;
                    }
                    
                    .modern-title {
                        font-size: 1.7rem !important;
                    }
                    
                    .control-buttons-container {
                        top: 15px;
                        right: 15px;
                    }

                    .control-button {
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }
            `}</style>

            <div className="control-buttons-container">
                <div 
                    className="control-button"
                    onClick={toggleTheme}
                    title={t('common_change_theme')}
                >
                    {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                </div>
                <div 
                    className="control-button"
                    onClick={toggleLanguage}
                    title={t('language')}
                >
                    <Globe size={22} />
                    <span className="language-text ms-1">{i18n.language.toUpperCase()}</span>
                </div>
            </div>

            <Container 
                className="modern-container d-flex align-items-center justify-content-center" 
                style={{ minHeight: '100vh' }}
            >
                <Card className="modern-card w-100" style={{ maxWidth: '450px' }}>
                    <Card.Body className="p-4 p-md-5">
                        <div className="text-center mb-4">
                            <div className="d-flex justify-content-center align-items-center mb-3">
                                <div 
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'var(--button-gradient)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        marginRight: '15px',
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                                    }}
                                >
                                    🔑
                                </div>
                                <h1 className="modern-title mb-0">
                                    {t('forgot_password_page_title')}
                                </h1>
                            </div>
                            <p className="modern-text mb-4" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                {t('forgot_password_page_subtitle')}
                            </p>
                        </div>
                        
                        {success ? (
                            <Alert variant="success" className="modern-alert alert-success mb-4">
                                ✅ {success}
                            </Alert>
                        ) : (
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4" controlId="formBasicEmail">
                                    <Form.Label className="modern-label">
                                         {t('forgot_password_email_label')}
                                    </Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder={t('forgot_password_email_placeholder')} 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="modern-input"
                                    />
                                </Form.Group>

                                {error && (
                                    <Alert variant="danger" className="modern-alert alert-danger mb-4">
                                        ⚠️ {error}
                                    </Alert>
                                )}

                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="modern-button w-100 mb-4" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {t('forgot_password_sending_button')}
                                        </>
                                    ) : (
                                        <>
                                             {t('forgot_password_send_link_button')}
                                        </>
                                    )}
                                </Button>
                            </Form>
                        )}
                        
                        <div className="text-center">
                            <p className="modern-text mb-0">
                                {t('forgot_password_remembered_password')} {' '}
                                <Link href="/login" className="modern-link">
                                    {t('forgot_password_back_to_login')}
                                </Link>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}