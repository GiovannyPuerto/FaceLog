"use client";

import { useState, useEffect, useRef } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { Container, Card, Button, Modal, Form, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

declare global {
    interface Window {
        faceapi: any;
    }
}

// Helper para obtener color basado en estado
const getStatusColor = (status) => {
    switch (status) {
        case 'present': return 'success';
        case 'absent': return 'danger';
        case 'late': return 'warning';
        case 'excused': return 'info';
        default: return 'secondary';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'present': return '✅';
        case 'absent': return '❌';
        case 'late': return '⏰';
        case 'excused': return '📝';
        default: return '❓';
    }
};

export default function TakeAttendancePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [todaysSessions, setTodaysSessions] = useState([]);
    const [selectedSessionObject, setSelectedSessionObject] = useState(null);
    const [session, setSession] = useState(null);
    const [attendanceLog, setAttendanceLog] = useState([]);
    const [recognitionStatus, setRecognitionStatus] = useState(t('attendance_loading_models'));
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const submissionIntervalRef = useRef(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);

    const getStatusText = (status) => {
        switch (status) {
            case 'present': return t('attendance_status_present');
            case 'absent': return t('attendance_status_absent');
            case 'late': return t('attendance_status_late');
            case 'excused': return t('attendance_status_excused');
            default: return status;
        }
    };

    // 1. Cargar modelos de FaceAPI
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
                setRecognitionStatus(t('attendance_models_loaded'));
            } catch (error) {
                console.error("Error loading face-api models:", error);
                setRecognitionStatus(t('attendance_models_error'));
            }
        };
        loadModels();
    }, [t]);

    // 2. Obtener sesiones de hoy del instructor
    useEffect(() => {
        const fetchTodaysSessions = async () => {
            if (user?.role !== 'instructor') return;
            try {
                const response = await api.get('attendance/today-sessions/');
                setTodaysSessions(response.data.results || []);
            } catch (error) { 
                console.error("Failed to fetch today's sessions", error); 
            }
        };
        if (user) fetchTodaysSessions();
    }, [user]);

    // 3. Iniciar/detener cámara y detección
    useEffect(() => {
        const startCameraAndDetection = () => {
            navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onplaying = () => {
                            detectionIntervalRef.current = setInterval(handleDetection, 100);
                            submissionIntervalRef.current = setInterval(captureAndRecognize, 5000);
                        };
                    }
                })
                .catch(err => console.error("Error accessing camera: ", err));
        };

        if (session && modelsLoaded) {
            startCameraAndDetection();
        }

        return () => {
            clearInterval(detectionIntervalRef.current);
            clearInterval(submissionIntervalRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [session, modelsLoaded]);

    const handleBeginAttendance = () => {
        if (!selectedSessionObject) {
            alert(t('attendance_select_session_alert'));
            return;
        }
        setSession(selectedSessionObject);
    };

    const handleStopSession = () => {
        setSession(null);
        setSelectedSessionObject(null);
        setAttendanceLog([]);
        setRecognitionStatus(t('attendance_session_stopped'));
    };

    const handleDetection = async () => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            const displaySize = { width: video.clientWidth, height: video.clientHeight };
            window.faceapi.matchDimensions(canvas, displaySize);

            const detections = await window.faceapi.detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions());
            const resizedDetections = window.faceapi.resizeResults(detections, displaySize);
            
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            window.faceapi.draw.drawDetections(canvas, resizedDetections);
        }
    };

    const captureAndRecognize = () => {
        if (!videoRef.current || !session) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoRef.current.videoWidth;
        tempCanvas.height = videoRef.current.videoHeight;
        tempCanvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        tempCanvas.toBlob(async (blob) => {
            if (!blob) return;
            setRecognitionStatus(t('attendance_sending_for_recognition'));
            const formData = new FormData();
            formData.append('session_id', session.id);
            formData.append('image', blob, 'capture.jpg');
            try {
                const response = await api.post('face/recognize/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

                setRecognitionStatus(`${t('attendance_recognition_result')}${response.data.message || t('attendance_no_new_recognition')}`);

                
                if (response.data.recognized_students && response.data.recognized_students.length > 0) {
                    const recognizedNames = response.data.recognized_students.map(s => s.full_name).join(', ');
                    alert(`¡Bienvenido(a), ${recognizedNames}! Asistencia registrada.`);
                    setRecognitionStatus(`Reconocido: ${recognizedNames}`);
                } else {
                    setRecognitionStatus('No se reconoció a nadie nuevo.');
                }


                fetchAttendanceLog();
            } catch (error) {
                setRecognitionStatus(`${t('attendance_recognition_error')}${error.response?.data?.error || t('attendance_recognition_failed')}`);
            }
        }, 'image/jpeg');
    };

    const fetchAttendanceLog = async () => {
        if (!session) return;
        try {
            const response = await api.get(`attendance/sessions/${session.id}/attendance-log/`);
            setAttendanceLog(response.data);
        } catch (error) { 
            console.error("Failed to fetch attendance log", error); 
        }
    };

    useEffect(() => {
        if (session) {
            fetchAttendanceLog();
            const logInterval = setInterval(fetchAttendanceLog, 10000);
            return () => clearInterval(logInterval);
        }
    }, [session]);

    const handleOpenEditModal = (log) => {
        setEditingLog(log);
        setShowEditModal(true);
    };

    const handleUpdateAttendance = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newStatus = formData.get('status');

        try {
            await api.patch(`attendance/attendance-log/${editingLog.id}/update/`, { status: newStatus });
            fetchAttendanceLog();
            setShowEditModal(false);
        } catch (err) {
            alert(t('attendance_update_error_alert'));
            console.error("Error updating attendance", err);
        }
    };

    if (!session) {
        return (
            <>
                <style jsx global>{`
                    :root {
                        --bg-primary: #f8f9fa;
                        --bg-card: #ffffff;
                        --text-primary: #212529;
                        --text-secondary: #6c757d;
                        --border-color: #e9ecef;
                        --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                        --shadow-card: 0 15px 50px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1);
                        --shadow-hover: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 25px rgba(0, 0, 0, 0.15);
                    }

                    [data-theme="dark"] {
                        --bg-primary: #0d1117;
                        --bg-card: #161b22;
                        --text-primary: #f0f6fc;
                        --text-secondary: #8b949e;
                        --border-color: #30363d;
                        --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                        --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                        --shadow-card: 0 15px 50px rgba(0, 0, 0, 0.6), 0 5px 15px rgba(0, 0, 0, 0.4);
                        --shadow-hover: 0 20px 60px rgba(0, 0, 0, 0.8), 0 8px 25px rgba(0, 0, 0, 0.6);
                    }

                    body {
                        background: var(--bg-primary);
                        color: var(--text-primary);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        transition: all 0.3s ease;
                    }

                    .modern-attendance-container {
                        background: var(--bg-primary);
                        min-height: 100vh;
                        padding: 30px;
                        transition: background-color 0.3s ease;
                        
                    }

                    .modern-select-card {
                        background: var(--bg-card) !important;
                        border: 2px solid var(--border-color) !important;
                        border-radius: 25px !important;
                        box-shadow: var(--shadow-card) !important;
                        transition: all 0.3s ease !important;
                        max-width: 600px;
                        margin: 0 auto;
                        overflow: hidden;
                    }

                    .modern-select-card:hover {
                        transform: translateY(-5px);
                        box-shadow: var(--shadow-hover) !important;
                    }

                    .modern-select-title {
                        color: var(--text-primary);
                        font-weight: 800;
                        font-size: 1.8rem;
                        margin-bottom: 1rem;
                        background: var(--button-gradient);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        text-align: center;
                    }

                    .modern-select-description {
                        color: var(--text-secondary);
                        font-size: 1rem;
                        margin-bottom: 2rem;
                        text-align: center;
                        line-height: 1.5;
                    }

                    .modern-select {
                        background: var(--bg-card) !important;
                        border: 2px solid var(--border-color) !important;
                        border-radius: 15px !important;
                        padding: 15px 20px !important;
                        color: var(--text-primary) !important;
                        font-size: 1rem !important;
                        transition: all 0.3s ease !important;
                        margin-bottom: 2rem !important;
                    }

                    .modern-select:focus {
                        border-color: var(--button-gradient) !important;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                        background: var(--bg-card) !important;
                        color: var(--text-primary) !important;
                    }

                    .modern-select:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .modern-start-button {
                        background: var(--button-gradient) !important;
                        border: none !important;
                        border-radius: 15px !important;
                        padding: 15px 40px !important;
                        font-weight: 700 !important;
                        font-size: 1.1rem !important;
                        text-transform: uppercase !important;
                        letter-spacing: 1px !important;
                        transition: all 0.3s ease !important;
                        width: 100% !important;
                    }

                    .modern-start-button:hover:not(:disabled) {
                        background: var(--button-hover) !important;
                        transform: translateY(-3px) !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
                    }

                    .modern-start-button:disabled {
                        background: var(--text-secondary) !important;
                        cursor: not-allowed !important;
                        transform: none !important;
                        opacity: 0.6;
                    }

                    .theme-toggle {
                        position: fixed;
                        top: 20px;
                        right: 20px;
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
                        z-index: 9999;
                    }

                    .theme-toggle:hover {
                        transform: scale(1.1) rotate(180deg);
                        box-shadow: var(--shadow-hover);
                    }

                    @media (max-width: 991.98px) {
                        .modern-attendance-container {
                            margin-left: 220px;
                            padding: 20px;
                        }
                    }

                    @media (max-width: 768px) {
                        .modern-attendance-container {
                            margin-left: 0;
                            padding: 15px;
                        }
                        
                        .modern-select-title {
                            font-size: 1.5rem;
                        }
                        
                        .theme-toggle {
                            top: 15px;
                            right: 15px;
                            width: 45px;
                            height: 45px;
                            font-size: 1rem;
                        }
                    }
                `}</style>

                {/* Toggle de tema */}
                <div 
                    className="theme-toggle d-none d-md-flex"
                    onClick={() => {
                        const currentTheme = document.documentElement.getAttribute('data-theme');
                        document.documentElement.setAttribute('data-theme', 
                            currentTheme === 'dark' ? 'light' : 'dark'
                        );
                    }}
                    title={t('common_change_theme')}
                >
                    🌓
                </div>

                <div className="modern-attendance-container d-flex align-items-center justify-content-center">
                    <Card className="modern-select-card">
                        <Card.Body className="p-5">
                            <h1 className="modern-select-title">
                                {t('attendance_select_today_session')}
                            </h1>
                            <p className="modern-select-description">
                                {recognitionStatus}
                            </p>
                            
                            <Form.Select 
                                onChange={(e) => {
                                    const sessionId = parseInt(e.target.value);
                                    setSelectedSessionObject(todaysSessions.find(s => s.id === sessionId));
                                }} 
                                defaultValue="" 
                                disabled={!modelsLoaded || todaysSessions.length === 0}
                                className="modern-select"
                            >
                                <option value="" disabled>
                                    {todaysSessions.length > 0 ? t('attendance_select_scheduled_session') : t('attendance_no_sessions_today')}
                                </option>
                                {todaysSessions.map(s => (
                                    <option key={s.id} value={s.id}>
                                         {s.ficha.numero_ficha} - {s.ficha.programa_formacion} ({s.start_time} - {s.end_time})
                                    </option>
                                ))}
                            </Form.Select>
                            
                            <Button 
                                onClick={handleBeginAttendance} 
                                disabled={!selectedSessionObject || !modelsLoaded}
                                className="modern-start-button"
                            >
                                {t('attendance_start_button')}
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --text-primary: #212529;
                    --text-secondary: #6c757d;
                    --border-color: #e9ecef;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --button-danger: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    --button-danger-hover: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
                    --button-success: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    --button-success-hover: linear-gradient(135deg, #218838 0%, #1ea085 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --modal-bg: #ffffff;
                    --modal-border: #dee2e6;
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --border-color: #30363d;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --button-danger: linear-gradient(135deg, #f85149 0%, #da3633 100%);
                    --button-danger-hover: linear-gradient(135deg, #da3633 0%, #c93026 100%);
                    --button-success: linear-gradient(135deg, #238636 0%, #2ea043 100%);
                    --button-success-hover: linear-gradient(135deg, #1a6928 0%, #238636 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --modal-bg: #21262d;
                    --modal-border: #30363d;
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                }

                .modern-attendance-active-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px;
                    transition: background-color 0.3s ease;
                }

                .modern-session-header {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    padding: 20px 30px;
                    margin-bottom: 30px;
                    box-shadow: var(--shadow-card);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modern-session-title {
                    color: var(--text-primary);
                    font-weight: 800;
                    font-size: 1.8rem;
                    margin: 0;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .modern-stop-button {
                    background: var(--button-danger) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 12px 24px !important;
                    font-weight: 700 !important;
                    font-size: 1rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    transition: all 0.3s ease !important;
                }

                .modern-stop-button:hover {
                    background: var(--button-danger-hover) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
                }

                .modern-card {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 20px !important;
                    box-shadow: var(--shadow-card) !important;
                    transition: all 0.3s ease !important;
                    height: 100%;
                }

                .modern-card:hover {
                    box-shadow: var(--shadow-hover) !important;
                }

                .modern-card-title {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.3rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 10px;
                    border-bottom: 3px solid;
                    border-image: var(--button-gradient) 1;
                }

                .modern-video-container {
                    position: relative;
                    background: #000;
                    border-radius: 15px;
                    overflow: hidden;
                    aspect-ratio: 16/9;
                    margin-bottom: 20px;
                }

                .modern-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .modern-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                .modern-status-text {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    font-weight: 600;
                    text-align: center;
                    padding: 15px;
                    background: rgba(0, 0, 0, 0.02);
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                [data-theme="dark"] .modern-status-text {
                    background: rgba(255, 255, 255, 0.02);
                }

                .modern-attendance-list {
                    max-height: 500px;
                    overflow-y: auto;
                    padding: 0;
                    margin: 0;
                }

                .modern-attendance-list::-webkit-scrollbar {
                    width: 8px;
                }

                .modern-attendance-list::-webkit-scrollbar-track {
                    background: var(--border-color);
                    border-radius: 4px;
                }

                .modern-attendance-list::-webkit-scrollbar-thumb {
                    background: var(--text-secondary);
                    border-radius: 4px;
                }

                .modern-attendance-item {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s ease;
                }

                .modern-attendance-item:hover {
                    background: rgba(102, 126, 234, 0.05);
                }

                [data-theme="dark"] .modern-attendance-item:hover {
                    background: rgba(88, 166, 255, 0.1);
                }

                .modern-attendance-item:last-child {
                    border-bottom: none;
                }

                .modern-student-info h6 {
                    color: var(--text-primary);
                    font-weight: 700;
                    margin: 0 0 4px 0;
                    font-size: 1rem;
                }

                .modern-student-info small {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .modern-attendance-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .modern-edit-button {
                    background: none;
                    border: 2px solid var(--button-gradient);
                    color: var(--text-primary);
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-decoration: none;
                }

                .modern-edit-button:hover {
                    background: var(--button-gradient);
                    color: white;
                    transform: translateY(-1px);
                }

                .modern-badge {
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 8px 12px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .modern-modal .modal-content {
                    background: var(--modal-bg);
                    border: 1px solid var(--modal-border);
                    border-radius: 20px;
                    overflow: hidden;
                }

                .modern-modal-header {
                    background: var(--button-gradient);
                    border: none;
                    padding: 24px 30px;
                }

                .modern-modal-title {
                    color: white;
                    font-weight: 700;
                    font-size: 1.4rem;
                    margin: 0;
                }

                .modern-modal-body {
                    padding: 30px;
                    background: var(--modal-bg);
                }

                .modern-modal-footer {
                    background: var(--modal-bg);
                    border: none;
                    padding: 20px 30px;
                }

                .modern-input {
                    background: var(--bg-card) !important;
                    border: 2px solid var(--border-color) !important;
                    border-radius: 12px !important;
                    padding: 12px 15px !important;
                    color: var(--text-primary) !important;
                    transition: all 0.3s ease !important;
                }

                .modern-input:focus {
                    border-color: var(--button-gradient) !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                    background: var(--bg-card) !important;
                    color: var(--text-primary) !important;
                }

                .modern-label {
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: 1rem;
                    margin-bottom: 8px;
                }

                .modern-button-success {
                    background: var(--button-success) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 10px 20px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                }

                .modern-button-success:hover {
                    background: var(--button-success-hover) !important;
                    transform: translateY(-1px) !important;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .theme-toggle {
                    position: relative;
                    top: 25px;
                    right: 20px;
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
                    z-index: 9999;
                }

                .theme-toggle:hover {
                    transform: scale(1.1) rotate(180deg);
                    box-shadow: var(--shadow-hover);
                }

                @media (max-width: 991.98px) {
                    .modern-attendance-active-container {
                        margin-left: 220px;
                        padding: 20px;
                    }
                }

                @media (max-width: 768px) {
                    .modern-attendance-active-container {
                        margin-left: 0;
                        padding: 15px;
                    }
                    
                    .modern-session-header {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                        padding: 20px;
                    }
                    
                    .modern-session-title {
                        font-size: 1.4rem;
                    }
                    
                    .modern-attendance-list {
                        max-height: 400px;
                    }
                    
                    .modern-attendance-actions {
                        flex-direction: column;
                        gap: 8px;
                    }
                    
                    .theme-toggle {
                        top: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }
            `}</style>

            {/* Toggle de tema */}
            <div 
                className="theme-toggle d-none d-md-flex"
                onClick={() => {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    document.documentElement.setAttribute('data-theme', 
                        currentTheme === 'dark' ? 'light' : 'dark'
                    );
                }}
                title={t('common_change_theme')}
            >
                🌓
            </div>

            <div className="modern-attendance-active-container">
                <Container fluid className="h-100">
                    {/* Header de sesión activa */}
                    <div className="modern-session-header">
                        <h1 className="modern-session-title">
                            {t('attendance_active_session_title', { ficha: session.ficha.numero_ficha })}
                        </h1>
                        <Button onClick={handleStopSession} className="modern-stop-button">
                            {t('attendance_stop_session_button')}
                        </Button>
                    </div>

                    <Row className="g-4">
                        {/* Columna de la cámara */}
                        <Col lg={6}>
                            <Card className="modern-card">
                                <Card.Body className="p-4">
                                    <h2 className="modern-card-title">
                                        {t('attendance_camera_title')}
                                    </h2>
                                    <div className="modern-video-container">
                                        <video 
                                            ref={videoRef} 
                                            autoPlay 
                                            playsInline 
                                            muted 
                                            className="modern-video"
                                        />
                                        <canvas 
                                            ref={canvasRef} 
                                            className="modern-canvas"
                                        />
                                    </div>
                                    <div className="modern-status-text">
                                         {recognitionStatus}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Columna del registro de asistencia */}
                        <Col lg={6}>
                            <Card className="modern-card">
                                <Card.Body className="p-4">
                                    <h2 className="modern-card-title">
                                        {t('attendance_log_title', { count: attendanceLog.length })}
                                    </h2>
                                    <div className="modern-attendance-list">
                                        {attendanceLog.length === 0 ? (
                                            <div className="empty-state">
                                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👥</div>
                                                <p>{t('attendance_no_log_yet')}</p>
                                                <p>{t('attendance_students_will_appear_here')}</p>
                                            </div>
                                        ) : (
                                            attendanceLog.map(log => (
                                                <div key={log.id} className="modern-attendance-item">
                                                    <div className="modern-student-info">
                                                        <h6>{log.student.first_name} {log.student.last_name}</h6>
                                                        <small>{t('attendance_student_id', { id: log.student.student_id || 'N/A' })}</small>
                                                    </div>
                                                    <div className="modern-attendance-actions">
                                                        <Badge 
                                                            bg={getStatusColor(log.status)} 
                                                            className="modern-badge"
                                                        >
                                                            {getStatusIcon(log.status)} {getStatusText(log.status)}
                                                        </Badge>
                                                        <button 
                                                            onClick={() => handleOpenEditModal(log)}
                                                            className="modern-edit-button"
                                                        >
                                                            {t('attendance_edit_button')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Modal para editar asistencia */}
            <Modal 
                show={showEditModal} 
                onHide={() => setShowEditModal(false)} 
                centered
                className="modern-modal"
            >
                <Modal.Header closeButton className="modern-modal-header">
                    <Modal.Title className="modern-modal-title">
                        {t('attendance_edit_modal_title', { studentName: editingLog?.student.first_name })}
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handleUpdateAttendance}>
                    <Modal.Body className="modern-modal-body">
                        <Form.Group>
                            <Form.Label className="modern-label">{t('attendance_status_label')}</Form.Label>
                            <Form.Select 
                                name="status" 
                                defaultValue={editingLog?.status}
                                className="modern-input"
                                required
                            >
                                <option value="present">{t('attendance_status_present')}</option>
                                <option value="absent">{t('attendance_status_absent')}</option>
                                <option value="late">{t('attendance_status_late')}</option>
                                <option value="excused">{t('attendance_status_excused')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    
                    <Modal.Footer className="modern-modal-footer">
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowEditModal(false)}
                            className="me-2"
                        >
                            {t('common_cancel')}
                        </Button>
                        <Button 
                            type="submit"
                            className="modern-button-success"
                        >
                            {t('common_save_changes')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}