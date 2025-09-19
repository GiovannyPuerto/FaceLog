
"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';

export default function SessionCalendarPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchSessions = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            // Fetch all sessions for the instructor
            const response = await api.get('attendance/sessions/');
            setSessions(response.data.results || response.data);
        } catch (err) {
            setError("No se pudieron cargar las sesiones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [user]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const getSessionsForDay = (day) => {
        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.toDateString() === day.toDateString();
        });
    };

    if (loading) return <div className="text-center p-10">Cargando calendario...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Calendario de Sesiones</h1>

            <div className="bg-gray-800 shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevMonth} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">&lt; Anterior</button>
                    <h2 className="text-xl font-semibold text-gray-200">{currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={handleNextMonth} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Siguiente &gt;</button>
                </div>

                <div className="grid grid-cols-7 text-center text-gray-400 font-bold mb-2">
                    <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-2"></div>
                    ))}
                    {daysInMonth.map(day => {
                        const daySessions = getSessionsForDay(day);
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                            <div key={day.toISOString()} className={`p-2 rounded-md ${isToday ? 'bg-blue-600' : 'bg-gray-700'} ${daySessions.length > 0 ? 'border border-blue-400' : ''}`}>
                                <p className="text-white font-semibold">{day.getDate()}</p>
                                {daySessions.length > 0 && (
                                    <div className="mt-1 space-y-1">
                                        {daySessions.map(session => (
                                            <div key={session.id} className="bg-blue-800 text-white text-xs p-1 rounded-sm truncate" title={`${session.ficha.numero_ficha} (${session.start_time})`}>
                                                {session.ficha.numero_ficha} ({session.start_time})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
