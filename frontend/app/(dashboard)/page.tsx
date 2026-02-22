"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    Receipt,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface Stats {
    invoices: {
        total_invoices: string;
        total_proforma: string;
        amount_paid: string;
        amount_pending: string;
        amount_overdue: string;
    };
    quotes: {
        total_quotes: string;
    };
    chart: { month: string; total: string }[];
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Chargement des statistiques...</div>;

    const kpis = [
        {
            label: 'Factures payées',
            value: `${Number(stats?.invoices.amount_paid || 0).toLocaleString()} XOF`,
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: 'En attente',
            value: `${Number(stats?.invoices.amount_pending || 0).toLocaleString()} XOF`,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            label: 'Total Devis',
            value: stats?.quotes.total_quotes || '0',
            icon: FileText,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
        },
        {
            label: 'Factures en retard',
            value: `${Number(stats?.invoices.amount_overdue || 0).toLocaleString()} XOF`,
            icon: AlertCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white">Tableau de Bord</h1>
                <p className="text-slate-400">Aperçu de la santé financière de votre entreprise</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-start justify-between group hover:border-indigo-500/50 transition-all">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">{kpi.label}</p>
                            <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
                        </div>
                        <div className={`${kpi.bg} ${kpi.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Revenus Encaissés (6 mois)
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.chart || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    {stats?.chart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#6366f1" fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Receipt className="w-12 h-12 text-indigo-500 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-white mb-2">Prêt à facturer ?</h3>
                    <p className="text-slate-400 text-sm mb-6">Simplifiez votre gestion et gagnez du temps sur votre comptabilité.</p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                        Nouveau document
                    </button>
                </div>
            </div>
        </div>
    );
}
