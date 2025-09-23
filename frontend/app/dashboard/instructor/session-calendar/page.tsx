"use client";

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import useAuth from '../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function SessionCalendarPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchSessions = async () => {
        if (!user || user.role !== 'instructor') return;
        try {
            setLoading(true);
            const response = await api.get('attendance/sessions/');
            setSessions(response.data.results || response.data);
        } catch (err) {
            setError(t('session_calendar.error_loading'));
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
            const adjustedSessionDate = new Date(sessionDate.getUTCFullYear(), sessionDate.getUTCMonth(), sessionDate.getUTCDate());
            return adjustedSessionDate.toDateString() === day.toDateString();
        });
    };

    const monthName = t('session_calendar.months', { returnObjects: true })[currentDate.getMonth()];

    return (
        <>
            <style jsx global>{`
                :root {
                    --bg-primary: #f8f9fa;
                    --bg-card: #ffffff;
                    --bg-secondary: #e9ecef;
                    --bg-calendar-cell: #f8f9fa;
                    --bg-calendar-today: #667eea;
                    --bg-calendar-has-session: #ffffff;
                    --bg-session-pill: #667eea;
                    --text-primary: #232129ff;
                    --text-secondary: #6c757d;
                    --text-muted: #8b949e;
                    --text-calendar-header: #495057;
                    --text-calendar-day: #212529;
                    --text-session: #ffffff;
                    --border-color: #e9ecef;
                    --border-session: #667eea;
                    --button-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --button-hover: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.08);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.12);
                    --shadow-calendar-cell: 0 2px 8px rgba(0, 0, 0, 0.05);
                    --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }

                [data-theme="dark"] {
                    --bg-primary: #0d1117;
                    --bg-card: #161b22;
                    --bg-secondary: #21262d;
                    --bg-calendar-cell: #21262d;
                    --bg-calendar-today: #58a6ff;
                    --bg-calendar-has-session: #161b22;
                    --bg-session-pill: #1f6feb;
                    --text-primary: #f0f6fc;
                    --text-secondary: #8b949e;
                    --text-muted: #6e7681;
                    --text-calendar-header: #f0f6fc;
                    --text-calendar-day: #f0f6fc;
                    --text-session: #ffffff;
                    --border-color: #30363d;
                    --border-session: #58a6ff;
                    --button-gradient: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
                    --button-hover: linear-gradient(135deg, #4493f8 0%, #1b5fc1 100%);
                    --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 12px 35px rgba(0, 0, 0, 0.4);
                    --shadow-calendar-cell: 0 2px 8px rgba(0, 0, 0, 0.2);
                    --info-gradient: linear-gradient(135deg, #58a6ff 0%, #388bfd 100%);
                }

                body {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                    min-height: 100vh;
                }

                .calendar-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    padding: 30px 20px;
                    transition: background-color 0.3s ease;
                }

                .modern-title {
                    color: var(--text-primary);
                    font-weight: 800;
                    font-size: 2.5rem;
                    margin-bottom: 2rem;
                    position: relative;
                    background: var(--button-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .modern-title::after {
                    content: '';
                    position: absolute;
                    bottom: -15px;
                    left: 0;
                    width: 150px;
                    height: 5px;
                    background: var(--button-gradient);
                    border-radius: 3px;
                }

                .calendar-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: var(--shadow-card);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .calendar-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--button-gradient);
                }

                .calendar-header {
                    padding: 2rem;
                    border-bottom: 2px solid var(--border-color);
                    background: var(--bg-secondary);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .calendar-nav-button {
                    background: var(--button-gradient);
                    border: none;
                    border-radius: 12px;
                    padding: 12px 20px;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .calendar-nav-button:hover {
                    background: var(--button-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .calendar-month-title {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 1.5rem;
                    text-align: center;
                    flex: 1;
                    text-transform: capitalize;
                }

                .calendar-content {
                    padding: 1.5rem;
                }

                .calendar-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    margin-bottom: 1rem;
                }

                .weekday-header {
                    padding: 1rem 0.5rem;
                    text-align: center;
                    color: var(--text-calendar-header);
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 8px;
                    margin-top: 1rem;
                }

                .calendar-day {
                    background: var(--bg-calendar-cell);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 0.75rem;
                    min-height: 100px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .calendar-day:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-calendar-cell);
                    border-color: var(--border-session);
                }

                .calendar-day.today {
                    background: var(--bg-calendar-today);
                    border-color: var(--bg-calendar-today);
                    color: white;
                    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
                }

                .calendar-day.has-sessions {
                    background: var(--bg-calendar-has-session);
                    border-color: var(--border-session);
                    border-width: 3px;
                }

                .calendar-day.has-sessions::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--info-gradient);
                }

                .day-number {
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: var(--text-calendar-day);
                    margin-bottom: 0.5rem;
                }

                .calendar-day.today .day-number {
                    color: white;
                }

                .sessions-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .session-pill {
                    background: var(--bg-session-pill);
                    color: var(--text-session);
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 8px;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .session-pill:hover {
                    transform: scale(1.05);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .loading-container, .error-container {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                    margin: 2rem 0;
                }

                .loading-text, .error-text {
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 1rem;
                }

                .error-text {
                    color: #f85149;
                }

                .loading-icon, .error-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .theme-toggle {
                    position: fixed;
                    top: 15px;
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

                @media (max-width: 768px) {
                    .calendar-container {
                        padding: 20px 15px;
                    }
                    
                    .modern-title {
                        font-size: 2rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .calendar-header {
                        padding: 1.5rem;
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .calendar-nav-button {
                        padding: 10px 16px;
                        font-size: 0.9rem;
                    }
                    
                    .calendar-month-title {
                        font-size: 1.3rem;
                        order: -1;
                        margin-bottom: 1rem;
                    }
                    
                    .calendar-content {
                        padding: 1rem;
                    }
                    
                    .calendar-day {
                        padding: 0.5rem;
                        min-height: 80px;
                    }
                    
                    .weekday-header {
                        padding: 0.75rem 0.25rem;
                        font-size: 0.8rem;
                    }
                    
                    .day-number {
                        font-size: 1rem;
                    }
                    
                    .session-pill {
                        font-size: 0.65rem;
                        padding: 0.2rem 0.4rem;
                    }
                    
                    .theme-toggle {
                        top: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .calendar-grid {
                        gap: 4px;
                    }
                    
                    .calendar-day {
                        padding: 0.4rem;
                        min-height: 70px;
                    }
                    
                    .day-number {
                        font-size: 0.9rem;
                        margin-bottom: 0.25rem;
                    }
                    
                    .session-pill {
                        font-size: 0.6rem;
                        padding: 0.15rem 0.3rem;
                    }
                    
                    .weekday-header {
                        padding: 0.5rem 0.1rem;
                        font-size: 0.7rem;
                    }
                }
            `}</style>

            {/* Theme Toggle */}
            <div 
                className="theme-toggle"
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

            <div className="calendar-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 className="modern-title">
                        {t('session_calendar.title')}
                    </h1>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-icon"></div>
                            <div className="loading-text">{t('session_calendar.loading')}</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon"></div>
                            <div className="error-text">{t('session_calendar.error_loading')}</div>
                        </div>
                    ) : (
                        <div className="calendar-card">
                            <div className="calendar-header">
                                <button onClick={handlePrevMonth} className="calendar-nav-button">
                                    {t('session_calendar.previous_month')}
                                </button>
                                <h2 className="calendar-month-title">
                                    {monthName} {currentDate.getFullYear()}
                                </h2>
                                <button onClick={handleNextMonth} className="calendar-nav-button">
                                    {t('session_calendar.next_month')}
                                </button>
                            </div>

                            <div className="calendar-content">
                                <div className="calendar-weekdays">
                                    <div className="weekday-header">{t('session_calendar.weekday_sun')}</div>
                                    <div className="weekday-header">{t('session_calendar.weekday_mon')}</div>
                                    <div className="weekday-header">{t('session_calendar.weekday_tue')}</div>
                                    <div className="weekday-header">{t('session_calendar.weekday_wed')}</div>
                                    <div className="weekday-header">{t('session_calendar.weekday_thu')}</div>
                                    <div className="weekday-header">{t('session_calendar.weekday_fri')}</div>
                                    <div className="weekday-header">{t('session_calendar.weekday_sat')}</div>
                                </div>
                                
                                <div className="calendar-grid">
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className="calendar-day" style={{ opacity: 0 }}></div>
                                    ))}
                                    {daysInMonth.map(day => {
                                        const daySessions = getSessionsForDay(day);
                                        const isToday = day.toDateString() === new Date().toDateString();
                                        const hasSession = daySessions.length > 0;
                                        
                                        return (
                                            <div 
                                                key={day.toISOString()} 
                                                className={`calendar-day ${isToday ? 'today' : ''} ${hasSession ? 'has-sessions' : ''}`}
                                                title={hasSession ? t(daySessions.length > 1 ? 'session_calendar.day_title_multiple_sessions' : 'session_calendar.day_title_single_session', { count: daySessions.length }) : ''}
                                            >
                                                <div className="day-number">{day.getDate()}</div>
                                                {hasSession && (
                                                    <div className="sessions-container">
                                                        {daySessions.map(session => (
                                                            <div 
                                                                key={session.id} 
                                                                className="session-pill"
                                                                title={t('session_calendar.session_pill_title', { ficha: session.ficha.numero_ficha, time: session.start_time })}
                                                            >
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
                    )}
                </div>
            </div>
        </>
    );
}