"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import useAuth from '../../../../../hooks/useAuth';

export default function FichaAttendanceReportPage() {
    const { user } = useAuth();
    const params = useParams();
    const fichaId = params.id;
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            if (!user || !fichaId) return;
            try {
                setLoading(true);
                const response = await api.get(`attendance/fichas/${fichaId}/attendance-report/`);
                setReportData(response.data);
            } catch (err) {
                setError("No se pudo cargar el reporte de asistencia.");
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [user, fichaId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-500 text-white';
            case 'absent':
                return 'bg-red-500 text-white';
            case 'late':
                return 'bg-yellow-500 text-black';
            case 'excused':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-700';
        }
    };

    if (loading) return <div className="text-center p-10">Cargando reporte...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    if (!reportData) return <div className="text-center p-10">No hay datos para mostrar.</div>;

    const { ficha, sessions, students } = reportData;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Reporte de Asistencia - Ficha {ficha.numero_ficha}</h1>
            <p className="text-lg text-gray-300">{ficha.programa_formacion}</p>

            <div className="bg-gray-800 shadow-lg rounded-lg p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aprendiz</th>
                            {sessions.map(session => (
                                <th key={session.id} className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    {new Date(session.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                                    <br />
                                    <span className="font-normal normal-case">{session.start_time}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{student.full_name}</td>
                                {sessions.map(session => (
                                    <td key={`${student.id}-${session.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.attendances[session.id])}`}>
                                            {student.attendances[session.id] || 'N/A'}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}