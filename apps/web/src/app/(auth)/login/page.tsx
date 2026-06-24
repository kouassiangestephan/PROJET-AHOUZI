'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Hotel, Eye, EyeOff, Lock, Mail, ArrowRight, BedDouble, BarChart3, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: BedDouble, title: 'Gestion des réservations', desc: 'Pilotez toutes vos réservations en temps réel' },
  { icon: BarChart3, title: 'Rapports & Analytics', desc: "Tableaux de bord et KPI pour piloter votre activité" },
  { icon: Users, title: 'Multi-établissements', desc: 'Gérez plusieurs hôtels depuis un seul espace' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const res = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data.data;
      setUser(user);
      setTokens(accessToken, refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col">
        {/* Background */}
        <div className="absolute inset-0 gradient-indigo" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.3) 0%, transparent 50%)',
        }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">AHOUZI</h1>
              <p className="text-white/60 text-[11px]">Platform</p>
            </div>
          </div>

          {/* Main text */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-[12px] font-medium">ERP Hôtelier — Côte d&apos;Ivoire</span>
              </div>
              <h2 className="text-[38px] font-bold text-white leading-tight">
                La gestion hôtelière<br />
                <span className="text-white/70">réinventée pour</span><br />
                l&apos;Afrique de l&apos;Ouest
              </h2>
              <p className="text-white/60 text-[15px] mt-4 leading-relaxed">
                Pilotez vos établissements, réservations, finances et équipes depuis une seule plateforme moderne.
              </p>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map(f => (
              <div key={f.title} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[13px]">{f.title}</p>
                  <p className="text-white/55 text-[12px]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 gradient-indigo rounded-xl flex items-center justify-center shadow-sm">
              <Hotel size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">AHOUZI</h1>
              <p className="text-indigo-500 text-[11px] font-medium">Gestion Hôtelière</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
            <p className="text-slate-500 text-[14px] mt-1">Bienvenue ! Connectez-vous à votre espace.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
              <p className="text-red-700 text-[13px] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-semibold text-slate-600">Adresse email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@ahouzi.ci"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 transition-all"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-semibold text-slate-600">Mot de passe</label>
                <a href="#" className="text-[12px] text-indigo-500 hover:text-indigo-700 font-medium">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-indigo text-white font-semibold text-[14px] shadow-md hover:opacity-90 disabled:opacity-60 transition-all mt-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Se connecter <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Comptes démo</p>
            <div className="space-y-1">
              {[
                { role: 'Super Admin', email: 'admin@ahouzi.ci', pwd: 'Admin@2024' },
                { role: 'Manager', email: 'manager@ahouzi.ci', pwd: 'Manager@2024' },
              ].map(c => (
                <div key={c.email} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">{c.role}</span>
                  <span className="text-slate-400 font-mono">{c.email}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-6">
            © {new Date().getFullYear()} AHOUZI Hotels & Résidences. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
