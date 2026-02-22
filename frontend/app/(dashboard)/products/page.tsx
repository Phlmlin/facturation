"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Search, Edit2, Trash2, Tag, DollarSign, Percent } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    tax_rate: number;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchProducts = () => {
        api.get('/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce produit ?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Produit supprimé');
            fetchProducts();
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Produits & Services</h1>
                    <p className="text-slate-400">Gérez votre catalogue d'articles</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-indigo-500/20">
                    <Plus className="w-5 h-5" />
                    Nouveau Produit
                </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Article</th>
                                <th className="px-6 py-4 font-medium">Prix Unitaire</th>
                                <th className="px-6 py-4 font-medium">TVA</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 font-bold">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{product.name}</p>
                                                <p className="text-sm text-slate-500 line-clamp-1">{product.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-white font-medium">
                                            {Number(product.price).toLocaleString()} <span className="text-xs text-slate-500 ml-1 font-normal">XOF</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-medium">
                                            {product.tax_rate}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Aucun article trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
