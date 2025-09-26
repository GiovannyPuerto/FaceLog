"use client";

import { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { Container, Card, Form, Button, Alert, Modal, Row, Col, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe } from 'lucide-react';
import '../../i18n';

// --- Camera Capture Modal Component (using react-bootstrap) ---
const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { t } = useTranslation();

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera: ", error);
                alert(t('register_camera_error_alert'));
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(onCapture, 'image/jpeg');
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    return (
        <Modal show={isOpen} onHide={onClose} size="lg" centered className="modern-modal">
            <Modal.Header closeButton className="modern-modal-header">
                <Modal.Title className="modern-modal-title">
                    {t('register_camera_modal_title')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center modern-modal-body">
                <div style={{ position: 'relative', width: '100%' }}>
                    <video ref={videoRef} autoPlay playsInline className="modern-video"></video>
                    <div className="camera-overlay">
                        <div className="face-guide"></div>
                    </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <p className="mt-3 modern-camera-text">
                    {t('register_camera_modal_instructions')}
                </p>
            </Modal.Body>
            <Modal.Footer className="modern-modal-footer">
                <Button variant="secondary" onClick={onClose} className="modern-button-secondary">
                    {t('register_camera_modal_close_button')}
                </Button>
                <Button variant="primary" onClick={handleCapture} className="modern-button-primary">
                    {t('register_camera_modal_capture_button')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// --- Main Register Page Component (using react-bootstrap) ---
export default function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', student_id: '', ficha_numero: '' });
    const { register, error, loading } = useAuth();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState('light');

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [faceImages, setFaceImages] = useState([]); // Stores actual image files/blobs
    const [faceImagePreviews, setFaceImagePreviews] = useState([]); // Stores URLs for previews

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

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // New functions
    const handleCapture = (imageBlob) => {
        const newImage = new File([imageBlob], `face_${Date.now()}.jpeg`, { type: 'image/jpeg' });
        setFaceImages((prevImages) => [...prevImages, newImage]);
        setFaceImagePreviews((prevPreviews) => [...prevPreviews, URL.createObjectURL(imageBlob)]);
        // Optionally close the modal after capture, or keep it open for multiple captures
        // setIsCameraOpen(false);
    };

    const handleRemoveImage = (indexToRemove) => {
        setFaceImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
        setFaceImagePreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) { alert(t("passwords_do_not_match")); return; }

        const dataToSubmit = new FormData();
        for (const key in formData) {
            dataToSubmit.append(key, formData[key]);
        }
        // Append face images to formData
        faceImages.forEach((image) => {
            dataToSubmit.append('face_images', image);
        });

        await register(dataToSubmit);
    };

    return (
        <>
            <style jsx global>{`
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
                    --button-success: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    --button-success-hover: linear-gradient(135deg, #218838 0%, #1ea085 100%);
                    --button-info: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);
                    --button-info-hover: linear-gradient(135deg, #138496 0%, #5a32a3 100%);
                    --shadow-card: 0 15px 50px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1);
                    --shadow-hover: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 25px rgba(0, 0, 0, 0.15);
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
                    --input-bg: #0d1117;
                    --input-border: #30363d;
                    --input-focus: #58a6ff;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --button-success: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --button-success-hover: linear-gradient(135deg, #1a6928 0%, #238636 100%);
                    --button-info: linear-gradient(135deg, #1f6feb 0%, #8b5cf6 100%);
                    --button-info-hover: linear-gradient(135deg, #1b5fc1 0%, #7c3aed 100%);
                    --shadow-card: 0 15px 50px rgba(0, 0, 0, 0.6), 0 5px 15px rgba(0, 0, 0, 0.4);
                    --shadow-hover: 0 20px 60px rgba(0, 0, 0, 0.8), 0 8px 25px rgba(0, 0, 0, 0.6);
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

                .modern-container {
                    background: var(--bg-primary);
                    transition: background-color 0.3s ease;
                    padding: 20px 15px;
                }

                .modern-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 20px !important;
                    box-shadow: var(--shadow-card) !important;
                    backdrop-filter: blur(20px);
                    transition: all 0.3s ease;
                }

                .modern-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-hover) !important;
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
                    width: 80px;
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
                    border-radius: 12px !important;
                    padding: 12px 16px !important;
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
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1) !important;
                    transform: translateY(-1px) !important;
                    background: var(--input-bg) !important;
                    color: var(--text-primary) !important;
                }

                [data-theme="dark"] .modern-input:focus {
                    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2) !important;
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
                    padding: 15px 30px !important;
                    font-weight: 700 !important;
                    font-size: 1.1rem !important;
                    transition: all 0.3s ease !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .modern-button-success:hover {
                    background: var(--button-success-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
                }

                .modern-button-info {
                    background: var(--button-info) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 12px 24px !important;
                    font-weight: 600 !important;
                    font-size: 1rem !important;
                    transition: all 0.3s ease !important;
                }

                .modern-button-info:hover {
                    background: var(--button-info-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
                }

                .modern-button-secondary {
                    background: var(--text-secondary) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 10px 20px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                }

                .modern-button-secondary:hover {
                    background: var(--text-primary) !important;
                    transform: translateY(-1px) !important;
                }

                .btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none !important;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }

                .modern-alert {
                    background: var(--alert-danger-bg) !important;
                    border: 1px solid var(--alert-danger-border) !important;
                    color: var(--alert-danger-text) !important;
                    border-radius: 12px !important;
                    padding: 15px 20px !important;
                    font-weight: 500 !important;
                    border-left: 5px solid var(--alert-danger-text) !important;
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

                .modern-photo-section {
                    background: rgba(0, 0, 0, 0.02);
                    border-radius: 16px;
                    padding: 24px;
                    margin: 20px 0;
                    border: 2px dashed var(--border-color);
                    transition: all 0.3s ease;
                }

                [data-theme="dark"] .modern-photo-section {
                    background: rgba(255, 255, 255, 0.02);
                }

                .modern-photo-section:hover {
                    border-color: var(--input-focus);
                    background: rgba(13, 110, 253, 0.05);
                }

                .photo-preview {
                    position: relative;
                    display: inline-block;
                    margin: 8px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .photo-preview:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                .photo-remove-btn {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 28px !important;
                    height: 28px !important;
                    border-radius: 50% !important;
                    background: #dc3545 !important;
                    border: 2px solid white !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 14px !important;
                    font-weight: bold !important;
                    color: white !important;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .photo-remove-btn:hover {
                    transform: scale(1.1);
                    background: #c82333 !important;
                }

                /* Modal Styles */
                .modern-modal .modal-content {
                    background: var(--modal-bg);
                    border: 1px solid var(--modal-border);
                    border-radius: 20px;
                    overflow: hidden;
                }

                .modern-modal-header {
                    background: var(--button-gradient);
                    border: none;
                    padding: 20px 30px;
                }

                .modern-modal-title {
                    color: white !important;
                    font-weight: 700;
                    font-size: 1.3rem;
                    margin: 0;
                }

                .modern-modal-body {
                    padding: 30px;
                    background: var(--modal-bg);
                }

                .modern-video {
                    width: 100%;
                    border-radius: 15px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .camera-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .face-guide {
                    width: 66%;
                    height: 80%;
                    border: 4px dashed var(--input-focus);
                    border-radius: 50%;
                    opacity: 0.8;
                    animation: breathe 2s ease-in-out infinite;
                }

                @keyframes breathe {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.02); }
                }

                .modern-camera-text {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .modern-modal-footer {
                    background: var(--modal-bg);
                    border: none;
                    padding: 20px 30px;
                }

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

                @media (max-width: 768px) {
                    .modern-card {
                        margin: 10px !important;
                        border-radius: 15px !important;
                    }
                    
                    .modern-title {
                        font-size: 1.6rem !important;
                    }
                    
                    .modern-photo-section {
                        padding: 16px;
                        margin: 15px 0;
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
                    
                    .photo-preview {
                        margin: 5px;
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

            <Container className="modern-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <Card className="modern-card w-100" style={{ maxWidth: '900px' }}>
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
                                    📝
                                </div>
                                <h1 className="modern-title mb-0">
                                    {t('register_page_title')}
                                </h1>
                            </div>
                            <p className="modern-text mb-4" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                {t('register_page_subtitle')}
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="first_name" 
                                            placeholder={t('register_first_name_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="last_name" 
                                            placeholder={t('register_last_name_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="username" 
                                            placeholder={t('register_username_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="email" 
                                            type="email" 
                                            placeholder={t('register_email_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="password" 
                                            type="password" 
                                            placeholder={t('register_password_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="password2" 
                                            type="password" 
                                            placeholder={t('register_confirm_password_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="student_id" 
                                            placeholder={t('register_student_id_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Control 
                                            name="ficha_numero" 
                                            placeholder={t('register_ficha_number_placeholder')} 
                                            onChange={handleChange} 
                                            required 
                                            className="modern-input"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <div className="modern-photo-section text-center">
                                <Form.Label className="modern-label d-block mb-3">
                                     {t('face_photos_title')}
                                </Form.Label>
                                <Button 
                                    variant="info" 
                                    onClick={() => setIsCameraOpen(true)}
                                    className="modern-button-info mb-3"
                                >
                                     {t('take_photo_button')}
                                </Button>
                                <div className="d-flex flex-wrap justify-content-center">
                                    {faceImagePreviews.map((previewUrl, index) => (
                                        <div key={index} className="photo-preview">
                                            <Image 
                                                src={previewUrl} 
                                                alt={t('photo_preview_alt', { index: index + 1 })} 
                                                roundedCircle 
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                                            />
                                            <div
                                                className="photo-remove-btn"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                ×
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {faceImagePreviews.length === 0 && (
                                    <p className="modern-text mt-3 mb-0">
                                         {t('no_photos_captured_yet')}
                                    </p>
                                )}
                            </div>
                            
                            {error && (
                                <Alert variant="danger" className="modern-alert mt-3">
                                    ⚠️ {error}
                                </Alert>
                            )}
                            
                            <Button 
                                variant="success" 
                                type="submit" 
                                className="modern-button-success w-100 mt-4" 
                                disabled={loading || faceImages.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {t('registering_button')}
                                    </>
                                ) : (
                                    <>
                                         {t('create_account_button')}
                                    </>
                                )}
                            </Button>
                        </Form>
                        <div className="text-center mt-4">
                            <p className="modern-text">
                                {t('already_have_account')} {' '}
                                <Link href="/login" className="modern-link">
                                    {t('login_here_link')}
                                </Link>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
            <CameraCaptureModal 
                isOpen={isCameraOpen} 
                onClose={() => setIsCameraOpen(false)} 
                onCapture={handleCapture} 
            />
        </>
    );
}