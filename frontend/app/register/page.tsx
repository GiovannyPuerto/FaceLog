"use client";

import { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { Container, Card, Form, Button, Alert, Modal, Row, Col, Image } from 'react-bootstrap';

// --- Camera Capture Modal Component (using react-bootstrap) ---
const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera: ", error);
                alert("No se pudo acceder a la cámara. Asegúrate de tener una y de haber dado los permisos.");
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
            // Do not close modal here, allow multiple captures
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    return (
        <Modal show={isOpen} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Capturar Foto de Rostro</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <div style={{ position: 'relative', width: '100%' }}>
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px' }}></video>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ width: '66%', height: '80%', border: '4px dashed #0d6efd', borderRadius: '50%', opacity: 0.75 }}></div>
                    </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <p className="mt-2">Asegúrate de que tu rostro esté bien iluminado y centrado en el óvalo. Toma varias fotos desde diferentes ángulos.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                <Button variant="primary" onClick={handleCapture}>Capturar Otra</Button>
            </Modal.Footer>
        </Modal>
    );
};

// --- Main Register Page Component (using react-bootstrap) ---
export default function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', student_id: '', ficha_numero: '' });
    const [faceImages, setFaceImages] = useState([]); // Array of File objects
    const [faceImagePreviews, setFaceImagePreviews] = useState([]); // Array of URL strings
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const { register, error, loading } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCapture = (blob) => {
        const file = new File([blob], `face_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(file);
        setFaceImages(prev => [...prev, file]);
        setFaceImagePreviews(prev => [...prev, previewUrl]);
    };

    const handleRemoveImage = (indexToRemove) => {
        setFaceImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setFaceImagePreviews(prev => {
            URL.revokeObjectURL(prev[indexToRemove]); // Clean up URL object
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) { alert("Las contraseñas no coinciden."); return; }
        if (faceImages.length === 0) { alert("Por favor, toma al menos una foto de tu rostro para el registro."); return; }

        const dataToSubmit = new FormData();
        for (const key in formData) {
            dataToSubmit.append(key, formData[key]);
        }
        faceImages.forEach((file, index) => {
            dataToSubmit.append(`face_images[${index}]`, file); // Append each file with a unique name
        });

        await register(dataToSubmit);
    };

    return (
        <>
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <Card bg="secondary" text="white" style={{ width: '100%', maxWidth: '800px' }}>
                    <Card.Body className="p-4 p-md-5">
                        <h1 className="text-center mb-4">Registro de Aprendiz</h1>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="first_name" placeholder="Nombres" onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="last_name" placeholder="Apellidos" onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="username" placeholder="Nombre de usuario" onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="email" type="email" placeholder="Correo electrónico" onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="password" type="password" placeholder="Contraseña" onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="password2" type="password" placeholder="Confirmar contraseña" onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="student_id" placeholder="Documento de identidad" onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Control name="ficha_numero" placeholder="Número de ficha" onChange={handleChange} required /></Form.Group></Col>
                            </Row>
                            
                            <div className="text-center py-3">
                                <Form.Label className="d-block mb-2">Fotos de Rostro (Mínimo 1)</Form.Label>
                                <Button variant="info" onClick={() => setIsCameraOpen(true)}>Tomar Foto</Button>
                                <div className="mt-3 d-flex flex-wrap justify-content-center gap-2">
                                    {faceImagePreviews.map((previewUrl, index) => (
                                        <div key={index} className="position-relative">
                                            <Image src={previewUrl} alt={`Vista previa ${index + 1}`} roundedCircle style={{ width: '128px', height: '128px', objectFit: 'cover' }} />
                                            <Button variant="danger" size="sm" className="position-absolute top-0 end-0 rounded-circle" onClick={() => handleRemoveImage(index)} style={{ width: '24px', height: '24px', padding: '0', fontSize: '0.75rem' }}>&times;</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                            
                            <Button variant="success" type="submit" className="w-100 mt-3" disabled={loading || faceImages.length === 0}>
                                {loading ? 'Registrando...' : 'Crear Cuenta'}
                            </Button>
                        </Form>
                        <p className="text-center mt-3">
                            ¿Ya tienes una cuenta? <Link href="/login">Inicia sesión aquí</Link>
                        </p>
                    </Card.Body>
                </Card>
            </Container>
            <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
        </>
    );
}