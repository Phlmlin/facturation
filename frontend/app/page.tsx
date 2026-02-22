"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { ArrowRight, FileText, PieChart, Users } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">g</span>
          </div>
          <span className="text-xl font-bold text-white">GestionSaaS</span>
        </div>
        <div>
          {user ? (
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Aller au Dashboard
            </Link>
          ) : (
            <div className="space-x-4">
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Facturation simple et <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            efficace en Afrique
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Gérez vos devis, factures, clients et produits au même endroit.
          Conçu pour les entrepreneurs et PME souhaitant professionnaliser leur gestion.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25"
          >
            <span>{user ? "Accéder à mon espace" : "Démarrer gratuitement"}</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>

      {/* Features Preview */}
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
          <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
            <FileText size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Devis & Factures</h3>
          <p className="text-slate-400">
            Créez des documents professionnels en un clic, convertissez vos devis en factures et exportez au format PDF.
          </p>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
          <div className="w-14 h-14 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center mb-6">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Gestion Clients</h3>
          <p className="text-slate-400">
            Gardez un œil sur votre base de données clients, leur historique d'achats et leurs coordonnées.
          </p>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
            <PieChart size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Statistiques</h3>
          <p className="text-slate-400">
            Suivez votre chiffre d'affaires, vos revenus en attente et l'évolution de vos ventes en temps réel.
          </p>
        </div>
      </section>
    </div>
  );
}
