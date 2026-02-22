"use client";

import { useAuth } from '@/components/AuthContext';
import { Bell, Search, User } from 'lucide-react';

export default function Topbar() {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 max-w-md w-full">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="bg-transparent border-none focus:outline-none text-sm text-white w-full"
                />
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-800"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white">{user?.email || 'Chargement...'}</p>
                        <p className="text-xs text-slate-500">Administrateur</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-slate-800">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
