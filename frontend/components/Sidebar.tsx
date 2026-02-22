"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    Receipt,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, href: '/' },
    { name: 'Clients', icon: Users, href: '/clients' },
    { name: 'Produits & Services', icon: Package, href: '/products' },
    { name: 'Devis', icon: FileText, href: '/quotes' },
    { name: 'Factures', icon: Receipt, href: '/invoices' },
    { name: 'Paramètres', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">G</span>
                    GestionSaaS
                </h2>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                            <span className="font-medium">{item.name}</span>
                            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </div>
    );
}
