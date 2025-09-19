"use client";

import { useState, useEffect, useRef } from 'react';

declare global {
    interface Window {
        faceapi: any;
    }
}
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

// Simple Modal Component
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
            {children}
        </div>
    </div>
);

// Helper to get color based on status
const getStatusColor = (status) => {
    switch (status) {
        case 'present': return 'bg-green-500';
        case 'absent': return 'bg-red-500';
        case 'late': return 'bg-yellow-500';
        case 'excused': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

export default function TakeAttendancePage() {
    const { user } = useAuth();
    const [todaysSessions, setTodaysSessions] = useState([]);
    const [selectedSessionObject, setSelectedSessionObject] = useState(null);
    const [session, setSession] = useState(null);
    const [attendanceLog, setAttendanceLog] = useState([]);
    const [recognitionStatus, setRecognitionStatus] = useState('Cargando modelos de IA...');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const submissionIntervalRef = useRef(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);

    // 1. Load FaceAPI Models
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
                setRecognitionStatus('Modelos cargados. Listo para iniciar sesión.');
            } catch (error) {
                console.error("Error loading face-api models:", error);
                setRecognitionStatus('Error al cargar modelos de IA. Refresca la página.');
            }
        };
        loadModels();
    }, []);

    // 2. Fetch instructor's sessions for today
    useEffect(() => {
        const fetchTodaysSessions = async () => {
            if (user?.role !== 'instructor') return;
            try {
                console.log("Requesting URL:", api.defaults.baseURL + 'attendance/today-sessions/');
                const response = await api.get('attendance/today-sessions/');
                setTodaysSessions(response.data.results || []);
            } catch (error) { 
                console.error("Failed to fetch today's sessions. Please ensure the backend server is running and accessible.", error); 
            }
        };
        if (user) fetchTodaysSessions();
    }, [user]);

    // 3. Start/Stop camera and detection based on session state
    useEffect(() => {
        const startCameraAndDetection = () => {
            navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onplaying = () => { // Use onplaying to ensure video dimensions are set
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

        // Cleanup function
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
            alert("Por favor, seleccione una sesión primero.");
            return;
        }
        setSession(selectedSessionObject);
    };

    const handleStopSession = () => {
        setSession(null);
        setSelectedSessionObject(null);
        setAttendanceLog([]);
        setRecognitionStatus('Sesión detenida. Listo para iniciar una nueva sesión.');
    };

    const handleDetection = async () => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) { // Check if video is ready
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
            setRecognitionStatus('Enviando para reconocimiento...');
            const formData = new FormData();
            formData.append('session_id', session.id);
            formData.append('image', blob, 'capture.jpg');
            try {
                const response = await api.post('face/recognize/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setRecognitionStatus(`Resultado: ${response.data.message || 'No se reconoció a nadie nuevo.'}`);
                fetchAttendanceLog();
            } catch (error) {
                setRecognitionStatus(`Error: ${error.response?.data?.error || 'Fallo en el reconocimiento'}`);
            }
        }, 'image/jpeg');
    };

    const fetchAttendanceLog = async () => {
        if (!session) return;
        try {
            const response = await api.get(`attendance/sessions/${session.id}/attendance-log/`);
            setAttendanceLog(response.data);
        } catch (error) { console.error("Failed to fetch attendance log", error); }
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
        setIsEditModalOpen(true);
    };

    const handleUpdateAttendance = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newStatus = formData.get('status');

        try {
            await api.patch(`attendance/attendance-log/${editingLog.id}/update/`, { status: newStatus });
            fetchAttendanceLog(); // Refresh log
            setIsEditModalOpen(false);
        } catch (err) {
            alert("Error al actualizar la asistencia.");
            console.error("Error updating attendance", err);
        }
    };

    if (!session) {
        return (
            <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-lg mx-auto mt-10 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Seleccionar Sesión de Hoy</h1>
                <p className="text-gray-400 mb-6">{recognitionStatus}</p>
                <select 
                    onChange={(e) => {
                        const sessionId = parseInt(e.target.value);
                        setSelectedSessionObject(todaysSessions.find(s => s.id === sessionId));
                    }} 
                    defaultValue="" 
                    disabled={!modelsLoaded || todaysSessions.length === 0} 
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 disabled:opacity-50"
                >
                    <option value="" disabled>
                        {todaysSessions.length > 0 ? 'Selecciona una Sesión Programada' : 'No hay sesiones para hoy'}
                    </option>
                    {todaysSessions.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.ficha.numero_ficha} - {s.ficha.programa_formacion} ({s.start_time} - {s.end_time})
                        </option>
                    ))}
                </select>
                <button 
                    onClick={handleBeginAttendance} 
                    disabled={!selectedSessionObject || !modelsLoaded} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300"
                >
                    Empezar Asistencia
                </button>
            </div>
        );
    }

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-white">Sesión Activa | Ficha: {session.ficha.numero_ficha}</h1>
                    <button onClick={handleStopSession} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Detener Sesión
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800 shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">Cámara de Reconocimiento</h2>
                        <div className="relative bg-black rounded-md overflow-hidden aspect-video">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
                        </div>
                        <p className="text-center text-gray-300 mt-4 h-6">{recognitionStatus}</p>
                    </div>
                    <div className="bg-gray-800 shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">Registro de Asistencia</h2>
                        <ul className="divide-y divide-gray-700 h-[480px] overflow-y-auto">
                            {attendanceLog.map(log => (
                                <li key={log.id} className="p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">{log.student.first_name} {log.student.last_name}</p>
                                        <p className="text-xs text-gray-400">ID: {log.student.student_id || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(log.status)}`}>
                                            {log.status}
                                        </span>
                                        <button onClick={() => handleOpenEditModal(log)} className="text-blue-400 hover:text-blue-300 text-sm">Editar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {isEditModalOpen && editingLog && (
                <Modal onClose={() => setIsEditModalOpen(false)}>
                    <h2 className="text-2xl font-bold text-white mb-4">Editar Asistencia de {editingLog.student.first_name}</h2>
                    <form onSubmit={handleUpdateAttendance} className="space-y-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-300">Estado</label>
                            <select name="status" id="status" defaultValue={editingLog.status} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required>
                                <option value="present">Presente</option>
                                <option value="absent">Ausente</option>
                                <option value="late">Tardanza</option>
                                <option value="excused">Excusado</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Guardar Cambios</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
