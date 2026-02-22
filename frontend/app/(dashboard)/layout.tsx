"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/components/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
