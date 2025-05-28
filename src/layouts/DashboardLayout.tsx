import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon as CarIcon,
  TagIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import LocationGuardLogo from '../assets/LocationGuard.png';
import { useAutomobile } from '../contexts/AutomobileContext';
import { useClient } from '../contexts/ClientContext';
import { useReservation } from '../contexts/ReservationContext';
import { useCategory } from '../contexts/CategoryContext';
import ReservationDetailsModal from '../components/Reservations/ReservationDetailsModal';
import MaintenanceDetailsModal from '../components/Maintenances/MaintenanceDetailsModal';
import { Category } from '../types/automobile.types';
import { Client } from '../types/client.types';
import { Reservation } from '../types/reservation.types';
import { MaintenanceWithNextDetails } from '../types/maintenance.types';
import CategoryDetailsModal from '../components/categories/CategoryDetailsModal';
import ClientDetailsModal from '../components/Clients/ClientDetailsModal';
import { DollarSignIcon } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Automobiles', href: '/admin/automobiles', icon: CarIcon },
  { name: 'Catégories', href: '/admin/categories', icon: TagIcon },
  { name: 'Clients', href: '/admin/clients', icon: UserGroupIcon },
  { name: 'Réservations', href: '/admin/reservations', icon: CalendarIcon },
  { name: 'Maintenances', href: '/admin/maintenances', icon: WrenchScrewdriverIcon },
  { name: 'Dépenses', href: '/admin/depenses', icon: DollarSignIcon  },
  { name: 'Paiements', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Statistiques', href: '/admin/statistics', icon: ChartBarIcon },
  { name: 'Locations', href: '/admin/locations', icon: MapPinIcon },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Mon Profil', href: '/admin/profile', icon: UserCircleIcon },
  { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon },
];

// Définition du type d'alerte de maintenance (adapté du backend)
type MaintenanceAlert = {
  automobileId: string;
  type: 'KILOMETER_ALERT' | 'DATE_ALERT' | 'NO_MAINTENANCE_HISTORY';
  maintenanceType: string;
  message: string;
  currentKilometers?: number;
  recommendedKilometers?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  recommendedDate?: string;
};

type MaintenanceAlertApiResponse = { success: boolean; data: MaintenanceAlert[] } | MaintenanceAlert[];

// Type Notification générique
export type Notification = {
  id: string;
  type: 'MAINTENANCE' | 'MESSAGE' | 'PAIEMENT' | string;
  title: string;
  message: string;
  date?: string;
  data?: unknown;
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored ? JSON.parse(stored) : false;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { getMaintenanceAlerts } = useMaintenance();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { automobiles } = useAutomobile();
  const { clients } = useClient();
  const { reservations } = useReservation();
  const { categories } = useCategory();
  const { maintenances } = useMaintenance();
  const [searchValue, setSearchValue] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  // Modals state
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithNextDetails | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data: MaintenanceAlertApiResponse = await getMaintenanceAlerts();
        const alerts = Array.isArray(data) ? data : (data as { data: MaintenanceAlert[] }).data || [];
        // Transformer chaque alerte en notification
        const maintenanceNotifications: Notification[] = alerts.map((alert, idx) => ({
          id: `maintenance-${alert.automobileId}-${alert.maintenanceType}-${idx}`,
          type: 'MAINTENANCE',
          title: 'Alerte maintenance',
          message: alert.message,
          date: alert.nextMaintenanceDate || alert.lastMaintenanceDate || undefined,
          data: alert,
        }));
        setNotifications(maintenanceNotifications); // plus tard, concaténer d'autres types ici
      } catch {
        setNotifications([]);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, [getMaintenanceAlerts]);

  // Fermer le menu notifications si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    }
    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Filtrage
  const search = searchValue.trim().toLowerCase();
  const filteredAutomobiles = search
    ? automobiles.filter(auto =>
        auto.brand.toLowerCase().includes(search) ||
        auto.model.toLowerCase().includes(search) ||
        auto.licensePlate.toLowerCase().includes(search)
      )
    : [];
  const filteredClients = search
    ? clients.filter(client =>
        (client.firstName + ' ' + client.lastName).toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search) ||
        (client.phoneNumber || '').toLowerCase().includes(search)
      )
    : [];
  const filteredReservations = search
    ? reservations.filter(res =>
        (res.client?.firstName + ' ' + res.client?.lastName).toLowerCase().includes(search) ||
        (res.automobile?.brand + ' ' + res.automobile?.model).toLowerCase().includes(search) ||
        res.status.toLowerCase().includes(search)
      )
    : [];
  const filteredCategories = search
    ? categories.filter(cat =>
        cat.name.toLowerCase().includes(search) ||
        (cat.description || '').toLowerCase().includes(search)
      )
    : [];
  const filteredMaintenances = search
    ? maintenances.filter(m =>
        (typeof m.automobile === 'object' && (
          m.automobile.brand.toLowerCase().includes(search) ||
          m.automobile.model.toLowerCase().includes(search)
        )) ||
        m.type.toLowerCase().includes(search) ||
        (m.description || '').toLowerCase().includes(search)
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col">
          {/* Solid Sidebar for Mobile */}
          <div className="flex h-full flex-col bg-gradient-to-b from-indigo-600 to-purple-700 shadow-2xl">
            {/* Header with logo */}
            <div className="flex h-20 items-center justify-between px-6 border-b border-indigo-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                  <img src={LocationGuardLogo} alt="LG" className="h-6 w-6 object-contain" />
                </div>
                <div className="text-white">
                  <h1 className="text-lg font-bold tracking-tight">LocationGuard</h1>
                  <p className="text-xs text-white/70">Admin Panel</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'bg-white/20 text-white shadow-lg border border-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`mr-4 transition-all duration-200 ${
                    location.pathname === item.href ? 'text-white' : 'text-white/70 group-hover:text-white'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  {location.pathname === item.href && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t border-white/20">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-3 text-sm font-medium text-white hover:bg-red-500/30 transition-all duration-200 shadow-lg"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'
      }`}>
        <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-indigo-600 to-purple-700 shadow-2xl">
          {/* Header with logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-indigo-500/20">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                  <img src={LocationGuardLogo} alt="LG" className="h-8 w-8 object-contain" />
                </div>
                <div className="text-white">
                  <h1 className="text-xl font-bold tracking-tight">LocationGuard</h1>
                  <p className="text-sm text-white/70">Admin Panel</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <img src={LocationGuardLogo} alt="LG" className="h-8 w-8 object-contain" />
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {sidebarCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-white/20 text-white shadow-lg border border-white/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <div className={`${sidebarCollapsed ? 'mx-auto' : 'mr-4'} transition-all duration-200 ${
                  location.pathname === item.href ? 'text-white' : 'text-white/70 group-hover:text-white'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {location.pathname === item.href && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center gap-3 rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-3 text-sm font-medium text-white hover:bg-red-500/30 transition-all duration-200 shadow-lg ${
                sidebarCollapsed ? 'w-12 h-12' : 'w-full'
              }`}
              title={sidebarCollapsed ? 'Déconnexion' : ''}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
      }`}>
        {/* Header - Non transparent */}
        <header className="sticky top-0 z-40 flex h-20 items-center gap-x-4 border-b border-gray-200 bg-white px-6 py-4 sm:gap-x-6 sm:px-8 lg:px-12 shadow-lg">
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la barre latérale</span>
            <MenuIcon className="w-6 h-6" />
          </button>

          {/* Global Search - Non transparent */}
          <form className="flex-1 max-w-xl mx-4 relative" autoComplete="off" onSubmit={e => e.preventDefault()}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <div className="text-indigo-400">
                  <HomeIcon className="w-5 h-5" />
                </div>
              </span>
              <input
                ref={searchRef}
                type="text"
                className="block w-full rounded-2xl border border-indigo-200 bg-indigo-50 pl-12 pr-4 py-3 text-gray-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white shadow-md transition-all duration-200 text-base"
                placeholder="Rechercher..."
                value={searchValue}
                onChange={e => {
                  setSearchValue(e.target.value);
                  setShowSearchDropdown(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (searchValue.length > 0) setShowSearchDropdown(true);
                }}
                autoComplete="off"
              />
              {/* Dropdown results - Non transparent */}
              {showSearchDropdown && searchValue && (
                <div ref={searchDropdownRef} className="fixed sm:absolute left-1/2 sm:left-0 right-0 sm:right-0 -translate-x-1/2 sm:translate-x-0 top-20 sm:top-auto mt-0 sm:mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl z-50 border border-gray-200 max-h-[80vh] sm:max-h-96 overflow-y-auto w-[95vw] sm:w-auto mx-auto">
                  {/* Automobiles */}
                  {filteredAutomobiles.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-xs font-bold text-indigo-700 flex items-center gap-2">
                        <CarIcon className="w-5 h-5" /> Automobiles
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredAutomobiles.slice(0,5).map(auto => (
                          <li key={auto._id}>
                            <button type="button" onClick={() => { navigate('/admin/automobiles', { state: { showModal: true, id: auto._id } }); setShowSearchDropdown(false); }} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-all">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg">
                                <CarIcon className="w-5 h-5" />
                              </span>
                              <div>
                                <div className="font-semibold text-gray-800">{auto.brand} {auto.model} ({auto.licensePlate})</div>
                                <div className="text-xs text-gray-500">{auto.category?.name} • {auto.year}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Clients */}
                  {filteredClients.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-xs font-bold text-indigo-700 flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5" /> Clients
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredClients.slice(0,5).map(client => (
                          <li key={client._id}>
                            <button type="button" onClick={() => { setSelectedClient(client); setShowClientModal(true); setShowSearchDropdown(false); }} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-all">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg">
                                <UserGroupIcon className="w-5 h-5" />
                              </span>
                              <div>
                                <div className="font-semibold text-gray-800">{client.firstName} {client.lastName}</div>
                                <div className="text-xs text-gray-500">{client.email} {client.phoneNumber && `• ${client.phoneNumber}`}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Réservations */}
                  {filteredReservations.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-xs font-bold text-indigo-700 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" /> Réservations
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredReservations.slice(0,5).map(res => (
                          <li key={res._id}>
                            <button type="button" onClick={() => { setSelectedReservation(res); setShowReservationModal(true); setShowSearchDropdown(false); }} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-all">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold shadow-lg">
                                <CalendarIcon className="w-5 h-5" />
                              </span>
                              <div>
                                <div className="font-semibold text-gray-800">{res.automobile?.brand} {res.automobile?.model} - {res.client?.firstName} {res.client?.lastName}</div>
                                <div className="text-xs text-gray-500">{res.status} • {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Catégories */}
                  {filteredCategories.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-xs font-bold text-indigo-700 flex items-center gap-2">
                        <TagIcon className="w-5 h-5" /> Catégories
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredCategories.slice(0,5).map(cat => (
                          <li key={cat._id}>
                            <button type="button" onClick={() => { setSelectedCategory(cat); setShowCategoryModal(true); setShowSearchDropdown(false); }} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-all">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                                <TagIcon className="w-5 h-5" />
                              </span>
                              <div>
                                <div className="font-semibold text-gray-800">{cat.name}</div>
                                <div className="text-xs text-gray-500">{cat.description}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Maintenances */}
                  {filteredMaintenances.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-xs font-bold text-indigo-700 flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-5 h-5" /> Maintenances
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredMaintenances.slice(0,5).map(m => (
                          <li key={m._id}>
                            <button type="button" onClick={() => { setSelectedMaintenance(m); setShowMaintenanceModal(true); setShowSearchDropdown(false); }} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-all">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg">
                                <WrenchScrewdriverIcon className="w-5 h-5" />
                              </span>
                              <div>
                                <div className="font-semibold text-gray-800">{
                                  m.automobile && typeof m.automobile === 'object' && 'brand' in m.automobile && 'model' in m.automobile
                                    ? `${m.automobile.brand} ${m.automobile.model}`
                                    : typeof m.automobile === 'string'
                                      ? m.automobile
                                      : 'Automobile'
                                }</div>
                                <div className="text-xs text-gray-500">{m.type} • {m.status} {m.date && `• ${new Date(m.date).toLocaleDateString()}`}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Aucun résultat */}
                  {filteredAutomobiles.length + filteredClients.length + filteredReservations.length + filteredCategories.length + filteredMaintenances.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">Aucun résultat</div>
                  )}
                </div>
              )}
            </div>
          </form>

          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch justify-end">
            <div className="flex items-center gap-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <span className="sr-only">Voir les notifications</span>
                  <BellIcon className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center animate-pulse shadow-lg">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {/* Menu déroulant des notifications - Non transparent */}
                {notificationsOpen && (
                  <div ref={notificationsRef} className="fixed sm:absolute left-1/2 sm:left-auto right-0 -translate-x-1/2 sm:translate-x-0 top-20 sm:top-auto mt-0 sm:mt-2 bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-2xl z-50 p-0 w-[95vw] sm:w-[28rem] max-h-[80vh] sm:max-h-96 overflow-y-auto mx-auto">
                    <div className="p-3 sm:p-4 font-semibold border-b border-gray-100 text-base sm:text-lg flex items-center gap-2">
                      <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 sm:p-6 text-gray-500 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <BellIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <span>Aucune notification</span>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                          <li key={notif.id} className="p-3 sm:p-4 flex gap-2 sm:gap-3 items-start hover:bg-gray-50 transition-all duration-200">
                            <div className="flex-shrink-0">
                              <div className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                                <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-800 text-sm sm:text-base">{notif.title}</span>
                                {notif.type === 'MAINTENANCE' && (
                                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-600 border border-blue-200">Maintenance</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mb-1">{notif.date && new Date(notif.date).toLocaleDateString()}</div>
                              <div className="text-gray-700 text-xs sm:text-sm line-clamp-2">{notif.message}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
                <button 
                  type="button" 
                  onClick={() => navigate('/admin/profile')}
                  className="flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl px-3 py-2 transition-all duration-200"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="hidden lg:block">Mon profil</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-8">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modals for details */}
      <ReservationDetailsModal
        isOpen={showReservationModal}
        onClose={() => { setShowReservationModal(false); setSelectedReservation(null); }}
        reservation={selectedReservation || null}
        onStatusChange={async () => {}}
      />
      <MaintenanceDetailsModal
        isOpen={showMaintenanceModal}
        onClose={() => { setShowMaintenanceModal(false); setSelectedMaintenance(null); }}
        maintenance={selectedMaintenance || undefined}
      />
      {/* Simple modal for client */}
      <ClientDetailsModal
        isOpen={showClientModal}
        onClose={() => { setShowClientModal(false); setSelectedClient(null); }}
        client={selectedClient || undefined}
      />
      {/* Simple modal for category */}
      <CategoryDetailsModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setSelectedCategory(null); }}
        category={selectedCategory || undefined}
      />
    </div>
  );
};

export default DashboardLayout;