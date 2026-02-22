"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Building2, Mail, Phone, MapPin, Hash, Receipt, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        nif: '',
        rccm: '',
        currency: 'XOF',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/company')
            .then(res => {
                setFormData(res.data);
            })
            .catch(err => toast.error('Erreur chargement profil'))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/company', formData);
            toast.success('Profil mis à jour');
        } catch (err) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white">Paramètres Entreprise</h1>
                <p className="text-slate-400">Configurez les informations qui apparaîtront sur vos documents</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                        <Building2 className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-bold text-white">Informations Générales</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Nom de l'entreprise</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Email professionnel</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="email"
                                    className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Devise par défaut</label>
                            <div className="relative">
                                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <select
                                    className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                >
                                    <option value="XOF">Franc CFA (XOF)</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="USD">Dollar ($)</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-400">Adresse</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                                <textarea
                                    rows={3}
                                    className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                        <Hash className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-bold text-white">Identifiants Légaux</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">NIF (Numéro d'Identification Fiscale)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                placeholder="Ex: 12345678-X"
                                value={formData.nif}
                                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">RCCM</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                placeholder="Ex: RB/COT/2023 B 1234"
                                value={formData.rccm}
                                onChange={(e) => setFormData({ ...formData, rccm: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}
