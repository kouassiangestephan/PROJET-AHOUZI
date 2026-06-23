'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Hotel, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data.data;
      setUser(user);
      setTokens(accessToken, refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1B2B5E] via-[#243571] to-[#1a3a6e] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-amber-400" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border-2 border-amber-400" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10 text-center text-white px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-amber-400 rounded-2xl p-4 shadow-2xl">
              <Hotel className="w-12 h-12 text-[#1B2B5E]" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 tracking-tight">AHOUZI</h1>
          <p className="text-amber-300 text-xl font-medium mb-6">Villas Ahouzi</p>
          <p className="text-blue-200 text-base max-w-sm mx-auto leading-relaxed">
            Gestion hôtelière d'excellence pour l'Afrique de l'Ouest
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Propriétés', value: '10+' },
              { label: 'Chambres', value: '200+' },
              { label: 'Clients', value: '5000+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-300">{stat.value}</div>
                <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-[#1B2B5E] rounded-2xl p-3">
              <Hotel className="w-8 h-8 text-amber-400" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-[#1B2B5E]">AHOUZI</h1>
              <p className="text-amber-600 text-sm">Villas Ahouzi</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-500 mt-1">Bienvenue ! Veuillez vous connecter.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="vous@ahouzi.ci"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1B2B5E] focus:ring-2 focus:ring-[#1B2B5E]/10 outline-none transition-all text-sm"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1B2B5E] focus:ring-2 focus:ring-[#1B2B5E]/10 outline-none transition-all text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#1B2B5E]" />
                  <span className="text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <a href="/forgot-password" className="text-sm text-[#1B2B5E] hover:text-amber-600 font-medium">
                  Mot de passe oublié ?
                </a>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1B2B5E] hover:bg-[#243571] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              © {new Date().getFullYear()} AHOUZI. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
