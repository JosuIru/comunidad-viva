import React, { useState, useEffect } from 'react';
import AdaptiveTourManager, { UserProfile } from '../lib/adaptiveTours';

interface ProfileOption {
  id: UserProfile;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'newbie',
    name: 'Nuevo Usuario',
    description: 'Primera vez en la plataforma. Necesito orientación completa.',
    icon: '👋',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    id: 'consumer',
    name: 'Consumidor',
    description: 'Principalmente busco y consumo recursos de la comunidad.',
    icon: '🔍',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  {
    id: 'provider',
    name: 'Proveedor',
    description: 'Creo y ofrezco recursos, servicios o productos.',
    icon: '⚡',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  {
    id: 'community_manager',
    name: 'Gestor de Comunidad',
    description: 'Organizo eventos y administro mi comunidad local.',
    icon: '🎯',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  {
    id: 'power_user',
    name: 'Usuario Experto',
    description: 'Ya conozco la plataforma y quiero funciones avanzadas.',
    icon: '🚀',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  },
];

interface ProfileSelectorProps {
  onProfileSelected?: (profile: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileSelected, isOpen, onClose }) => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>('newbie');

  useEffect(() => {
    setCurrentProfile(AdaptiveTourManager.detectUserProfile());
  }, []);

  const handleSelectProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
  };

  const handleConfirm = () => {
    if (selectedProfile) {
      AdaptiveTourManager.setUserProfile(selectedProfile);
      setCurrentProfile(selectedProfile);
      if (onProfileSelected) {
        onProfileSelected(selectedProfile);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecciona tu perfil
          </h2>
          <p className="text-gray-600">
            Esto nos ayuda a personalizar tu experiencia con tours y guías adaptadas a ti.
          </p>
          {currentProfile && (
            <div className="mt-2 text-sm text-gray-500">
              Perfil actual: <span className="font-semibold">{PROFILE_OPTIONS.find(p => p.id === currentProfile)?.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {PROFILE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectProfile(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedProfile === option.id
                  ? `${option.color} border-current ring-2 ring-offset-2 ring-current`
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-3">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{option.name}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedProfile}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedProfile
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirmar
          </button>
        </div>

        <div className="mt-4 text-xs text-center text-gray-500">
          Puedes cambiar tu perfil en cualquier momento desde la configuración
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;
