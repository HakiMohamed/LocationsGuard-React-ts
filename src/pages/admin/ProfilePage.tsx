import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, UpdateProfileData } from '../../services/user.service';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import { 
  UserCircleIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  PhotoIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { UserRole, Device } from '../../types/user.types';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import defaultBanner from '../../assets/images/default-banner.png';
import defaultAvatar from '../../assets/images/default-avatar.png';

const ProfilePage = () => {
  const { user: authUser, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    city: '',
    address: '',
    drivingLicenseNumber: '',
    drivingLicenseDate: '',
    drivingLicenseExpirationDate: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      setFormData({
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        phoneNumber: authUser.phoneNumber || '',
        city: authUser.city || '',
        address: authUser.address || '',
        drivingLicenseNumber: authUser.drivingLicenseNumber || '',
        drivingLicenseDate: authUser.drivingLicenseDate ? new Date(authUser.drivingLicenseDate).toISOString().split('T')[0] : '',
        drivingLicenseExpirationDate: authUser.drivingLicenseExpirationDate ? new Date(authUser.drivingLicenseExpirationDate).toISOString().split('T')[0] : '',
      });
    }
    loadDevices();
  }, [authUser]);

  const loadDevices = async () => {
    try {
      const response = await userService.getDevices();
      setDevices(response.devices);
    } catch (error) {
      console.error('Erreur lors du chargement des appareils:', error);
      toast.error('Erreur lors du chargement des appareils');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Log avant l'ajout au FormData
      console.log("Données du formulaire:", formData);
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formDataToSend.append(key, value.toString());
          console.log(`Ajout au FormData: ${key} = ${value}`);
        }
      });

      // Ajouter l'avatar s'il existe
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      // Ajouter la licence s'elle existe
      if (licenseFile) {
        formDataToSend.append('drivingLicenseImage', licenseFile);
      }

      console.log('FormData content:');
      formDataToSend.forEach((value, key) => {
        console.log(key, value);
      });

      const updatedUser = await userService.updateProfile(formDataToSend);
      console.log("Réponse mise à jour:", updatedUser);
      updateProfile(updatedUser);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erreur détaillée:', error.response || error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await userService.deleteProfile();
      await logout();
      navigate('/login');
      toast.success('Profil supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du profil:', error);
      toast.error('Erreur lors de la suppression du profil');
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await userService.revokeDevice(deviceId);
      await loadDevices();
      toast.success('Appareil révoqué avec succès');
    } catch (error) {
      console.error('Erreur lors de la révocation de l\'appareil:', error);
      toast.error('Erreur lors de la révocation de l\'appareil');
    }
  };

  if (!authUser) return null;

  const isAdmin = authUser.role === UserRole.ADMIN;
  const isClient = authUser.role === UserRole.CLIENT;

  // Composant pour afficher les détails d'un appareil
  const DeviceCard = ({ device, onRevoke }: { device: Device; onRevoke: (id: string) => Promise<void> }) => {
    const [isRevoking, setIsRevoking] = useState(false);

    const handleRevoke = async () => {
      setIsRevoking(true);
      try {
        await onRevoke(device.deviceId);
      } finally {
        setIsRevoking(false);
      }
    };

    const statusColor = device.isActive
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-full ">
            {/* En-tête avec nom et statut */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                {device.isActive ? 'Actif' : 'Inactif'}
              </div>
            </div>
            
            {/* Détails de l'appareil */}
            <div className="space-y-2 text-sm text-gray-500">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Type: </span>
                  <span className="capitalize">{device.type}</span>
                </div>
                
                <div>
                  <span className="font-medium">IP: </span>
                  <span>{device.ip}</span>
                </div>
              </div>

              <div>
                <span className="font-medium">ID: </span>
                <span className="font-mono text-xs">{device.deviceId}</span>
              </div>
              
              <div>
                <span className="font-medium">Dernière connexion: </span>
                <span>{new Date(device.lastLogin).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de révocation */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRevoke}
            disabled={isRevoking}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium
              ${isRevoking 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
          >
            {isRevoking ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Révocation...
              </span>
            ) : (
              'Révoquer l\'accès'
            )}
          </button>
        </div>
      </div>
    );
  };

  // Ajouter cette section dans le composant ProfilePage
  const ProfileHeader = ({ user, isEditing, onAvatarChange, onBannerChange }) => {
    return (
      <div className="relative mb-8">
        {/* Banner */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          <img
            src={user.bannerUrl || defaultBanner}
            alt="Profile banner"
            className="h-full w-full object-cover"
          />
          {isEditing && (
            <label className="absolute bottom-4 right-4 cursor-pointer rounded-full bg-white/80 p-2 shadow-lg hover:bg-white">
              <CameraIcon className="h-5 w-5 text-gray-700" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => onBannerChange(e.target.files?.[0])}
              />
            </label>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative h-24 w-24">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={defaultAvatar}
                  alt="Default profile"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-600 p-2 shadow-lg hover:bg-blue-700">
                <CameraIcon className="h-4 w-4 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => onAvatarChange(e.target.files?.[0])}
                />
              </label>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="ml-32 mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto w-full">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <ProfileHeader
          user={authUser}
          isEditing={isEditing}
          onAvatarChange={(file) => {
            if (file) {
              setAvatarFile(file);
              // Preview immédiat optionnel
              const url = URL.createObjectURL(file);
              updateProfile({ ...authUser, avatarUrl: url });
            }
          }}
          onBannerChange={(file) => {
            if (file) {
              setBannerFile(file);
              // Preview immédiat optionnel
              const url = URL.createObjectURL(file);
              updateProfile({ ...authUser, bannerUrl: url });
            }
          }}
        />

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                id="firstName"
                label="Prénom"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                required
              />
              <Input
                id="lastName"
                label="Nom"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Informations de contact</h3>
              
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{authUser.email}</span>
                {authUser.isEmailVerified ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>

              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Numéro de téléphone"
                  className="!mt-0"
                />
                {authUser.isPhoneVerified ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Adresse</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="city"
                  label="Ville"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  disabled={!isEditing}
                  icon={MapPinIcon}
                />
                <Input
                  id="address"
                  label="Adresse"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Permis de conduire (uniquement pour les clients) */}
            {(isClient || isAdmin) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Permis de conduire</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    id="drivingLicenseNumber"
                    label="Numéro de permis"
                    type="text"
                    value={formData.drivingLicenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, drivingLicenseNumber: e.target.value }))}
                    disabled={!isEditing}
                    icon={IdentificationIcon}
                  />
                  <Input
                    id="drivingLicenseDate"
                    label="Date d'obtention"
                    type="date"
                    value={formData.drivingLicenseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, drivingLicenseDate: e.target.value }))}
                    disabled={!isEditing}
                    icon={CalendarIcon}
                  />
                  <Input
                    id="drivingLicenseExpirationDate"
                    label="Date d'expiration"
                    type="date"
                    value={formData.drivingLicenseExpirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, drivingLicenseExpirationDate: e.target.value }))}
                    disabled={!isEditing}
                    icon={CalendarIcon}
                  />
                </div>

                {isEditing && (
                  <div className="mt-4">
                    <ImageUpload
                      onFilesChange={(files) => setLicenseFile(files[0])}
                      maxFiles={1}
                      accept="image/*"
                      label="Photo du permis de conduire"
                      icon={PhotoIcon}
                    />
                  </div>
                )}

                {authUser.drivingLicenseImage && !isEditing && (
                  <div className="mt-2">
                    <img
                      src={authUser.drivingLicenseImage}
                      alt="Permis de conduire"
                      className="max-w-sm rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Informations système (uniquement pour admin) */}
            {isAdmin && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Informations système</h3>
                <p className="text-sm text-gray-600">
                  Créé le : {new Date(authUser.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Dernière mise à jour : {new Date(authUser.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Modifier
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Section Appareils connectés */}
      <div className="mt-8 bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Appareils connectés</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Total: {devices.length}</span>
              <span>•</span>
              <span>Actifs: {devices.filter(d => d.isActive).length}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {devices.length === 0 ? (
            <p className="text-center text-gray-500">Aucun appareil connecté</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {devices.map((device) => (
                <DeviceCard
                  key={device.deviceId}
                  device={device}
                  onRevoke={handleRevokeDevice}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bouton de suppression du profil */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-red-600">Zone dangereuse</h2>
        <p className="mt-2 text-sm text-gray-500">
          Une fois votre compte supprimé, toutes vos données seront définitivement effacées.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Supprimer mon compte
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-sm">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Confirmer la suppression
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProfile}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ProfilePage; 