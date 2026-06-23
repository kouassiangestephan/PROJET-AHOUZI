'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { Building2, Bell, Shield, Palette, Globe } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Les mots de passe ne correspondent pas', path: ['confirmPassword'] });
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = [
  { id: 'profile', label: 'Profil', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'system', label: 'Système', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const { user } = useAuthStore();

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '' },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSaveProfile = async (values: ProfileForm) => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const onChangePassword = async (values: PasswordForm) => {
    resetPwd();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez votre profil et les préférences système</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium">
          Modifications enregistrées avec succès.
        </div>
      )}

      <div className="flex gap-6">
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-[#1B2B5E] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfile(onSaveProfile)} className="space-y-5 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
                <p className="text-sm text-gray-500 mt-0.5">Mettez à jour vos informations de compte</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <Button type="button" variant="outline" size="sm">Changer la photo</Button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG ou GIF. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" error={profileErrors.firstName?.message} {...regProfile('firstName')} />
                <Input label="Nom" error={profileErrors.lastName?.message} {...regProfile('lastName')} />
              </div>
              <Input label="Email" type="email" error={profileErrors.email?.message} {...regProfile('email')} />
              <Input label="Téléphone" type="tel" placeholder="+225 07 00 00 00 00" {...regProfile('phone')} />
              <Button type="submit">Enregistrer les modifications</Button>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
                <p className="text-sm text-gray-500 mt-0.5">Gérez votre mot de passe et l&apos;authentification à deux facteurs</p>
              </div>
              <form onSubmit={handlePwd(onChangePassword)} className="space-y-4">
                <h3 className="font-medium text-gray-800">Changer le mot de passe</h3>
                <Input label="Mot de passe actuel" type="password" error={pwdErrors.currentPassword?.message} {...regPwd('currentPassword')} />
                <Input label="Nouveau mot de passe" type="password" error={pwdErrors.newPassword?.message} {...regPwd('newPassword')} />
                <Input label="Confirmer le nouveau mot de passe" type="password" error={pwdErrors.confirmPassword?.message} {...regPwd('confirmPassword')} />
                <Button type="submit">Mettre à jour le mot de passe</Button>
              </form>
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-medium text-gray-800 mb-3">Authentification à deux facteurs (2FA)</h3>
                <p className="text-sm text-gray-500 mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte avec Google Authenticator ou une application similaire.</p>
                <Button variant="outline">Activer la 2FA</Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configurez vos préférences de notification</p>
              </div>
              {[
                { label: 'Nouvelles réservations', desc: 'Recevoir une notification à chaque nouvelle réservation' },
                { label: 'Check-in / Check-out', desc: 'Rappels pour les arrivées et départs du jour' },
                { label: 'Alertes de stock', desc: 'Notification quand un article est en stock faible' },
                { label: 'Tickets de maintenance', desc: 'Mises à jour sur les tickets ouverts et résolus' },
                { label: 'Rapports hebdomadaires', desc: 'Récapitulatif hebdomadaire de la performance' },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#1B2B5E] peer-focus:ring-2 peer-focus:ring-[#1B2B5E]/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              ))}
              <Button>Enregistrer les préférences</Button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-5 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Apparence</h2>
                <p className="text-sm text-gray-500 mt-0.5">Personnalisez l&apos;interface de l&apos;application</p>
              </div>
              <Select
                label="Thème"
                options={[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }, { value: 'system', label: 'Système' }]}
                defaultValue="light"
              />
              <Select
                label="Langue"
                options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]}
                defaultValue="fr"
              />
              <Select
                label="Format de date"
                options={[{ value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA' }, { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA' }]}
                defaultValue="DD/MM/YYYY"
              />
              <Button>Appliquer</Button>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-5 max-w-md">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Paramètres système</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configuration générale de la plateforme</p>
              </div>
              <Input label="Nom de l'hôtel / Entreprise" defaultValue="AHOUZI Hotels & Résidences" />
              <Input label="Email de contact" type="email" defaultValue="contact@ahouzi.ci" />
              <Input label="Téléphone" defaultValue="+225 27 00 00 00 00" />
              <Select label="Devise par défaut" options={[{ value: 'XOF', label: 'XOF — Franc CFA' }, { value: 'EUR', label: 'EUR — Euro' }, { value: 'USD', label: 'USD — Dollar' }]} defaultValue="XOF" />
              <Select label="Fuseau horaire" options={[{ value: 'Africa/Abidjan', label: 'Abidjan (GMT+0)' }, { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' }]} defaultValue="Africa/Abidjan" />
              <Select label="Taux de TVA (%)" options={[{ value: '18', label: '18% (Côte d\'Ivoire)' }, { value: '20', label: '20%' }, { value: '0', label: 'Exonéré' }]} defaultValue="18" />
              <Button>Enregistrer la configuration</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
