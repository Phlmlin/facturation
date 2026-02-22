"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        companyName: '',
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/register', formData);
            login(res.data.accessToken, res.data.refreshToken);
            toast.success('Compte créé avec succès !');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Inscription</h1>
                    <p className="text-slate-400">Créez votre compte pour gérer vos factures</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nom de l'entreprise</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Ex: Ma Super PME"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="contact@exemple.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Création en cours...' : 'Créer mon compte'}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-400">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
