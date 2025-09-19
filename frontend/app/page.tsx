
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                switch (user.role) {
                    case 'instructor':
                        router.replace('/dashboard/instructor');
                        break;
                    case 'student':
                        router.replace('/dashboard/student');
                        break;
                    case 'admin':
                        router.replace('/dashboard/admin');
                        break;
                    default:
                        router.replace('/login');
                }
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading, router]);

    return <div>Loading...</div>; // Or a proper splash screen
}
