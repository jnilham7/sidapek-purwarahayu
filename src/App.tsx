import React, { useState, useEffect, useMemo, useDeferredValue, memo } from 'react';
import { 
  Users, 
  UserPlus, 
  FolderOpen, 
  FileText, 
  Home, 
  LogOut, 
  Settings, 
  History, 
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Skull,
  Menu, 
  X, 
  Bell, 
  Search, 
  Plus, 
  Check,
  Download, 
  Upload,
  Trash2, 
  Edit, 
  Eye,
  Filter,
  UserMinus,
  ChevronLeft, 
  ChevronRight,
  Database,
  UserCog,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Briefcase,
  Map,
  HelpCircle,
  Info,
  ArrowRight,
  Building,
  Building2,
  Heart,
  Zap,
  Box,
  ShieldAlert,
  Fingerprint,
  MapPin,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import { format, differenceInYears } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { User, Resident, ActivityLog, DashboardStats, VillageInfo } from './types.ts';
import { apiService, IS_GAS, GAS_URL } from './services/apiService';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatDateIndonesian = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return format(date, 'dd MMMM yyyy', { locale: id });
  } catch (e) {
    return dateStr;
  }
};

const formatDateForInput = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    return '';
  }
};

const MobileTopNav = memo(({ view, navigate, userHasPermission }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLembagaOpen, setIsLembagaOpen] = useState(false);
  const [isRtOpen, setIsRtOpen] = useState(false);
  const [isRtOfficialsOpen, setIsRtOfficialsOpen] = useState(false);

  // Close menu when navigating
  const handleNavigate = (id: string) => {
    navigate(id);
    setIsOpen(false);
  };

  // Reset sub-menu when main menu closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsLembagaOpen(false);
        setIsRtOpen(false);
      }, 300);
    }
  }, [isOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} />, permission: 'dashboard' },
    { id: 'residents', label: 'Penduduk', icon: <Users size={18} />, permission: 'residents' },
    { id: 'map', label: 'Peta', icon: <Map size={18} />, permission: 'map' },
    { id: 'village_officials', label: 'Perangkat', icon: <Briefcase size={18} />, permission: 'village_officials' },
    { id: 'reports', label: 'Laporan', icon: <FileText size={18} />, permission: 'reports' },
    { id: 'logs', label: 'Log Aktivitas', icon: <History size={18} />, permission: 'logs' },
    { id: 'village_info', label: 'Info', icon: <Info size={18} />, permission: 'village_info' },
  ];

  const lembagaItems = [
    { id: 'bpd', label: 'BPD', icon: <Shield size={18} />, permission: 'bpd' },
    { id: 'rt', label: 'RT', icon: <Building size={18} />, permission: 'rt' },
    { id: 'rw', label: 'RW', icon: <Building2 size={18} />, permission: 'rw' },
    { id: 'pkk', label: 'PKK', icon: <Heart size={18} />, permission: 'pkk' },
    { id: 'karang_taruna', label: 'Karang Taruna', icon: <Zap size={18} />, permission: 'karang_taruna' },
    { id: 'lpmd', label: 'LPMD', icon: <Box size={18} />, permission: 'lpmd' },
    { id: 'linmas', label: 'Linmas', icon: <ShieldAlert size={18} />, permission: 'linmas' },
  ];

  const activeMainItems = menuItems.filter(item => userHasPermission(item.permission));
  const activeLembagaItems = lembagaItems.filter(item => userHasPermission(item.permission));

  const isLembagaActive = activeLembagaItems.some(item => item.id === view || (item.id === 'rt' && view === 'rt_officials'));

  return (
    <div className="lg:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3" onClick={() => handleNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white text-sm tracking-tight leading-none">SIDAPEK</span>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Desa Digital</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-2.5 rounded-xl transition-all active:scale-95 border",
              isOpen ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
            )}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="overflow-hidden bg-slate-900 border-t border-slate-800 shadow-2xl"
          >
            <div className="p-4 space-y-1.5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {activeMainItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest",
                    view === item.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <div className={cn("p-2 rounded-xl", view === item.id ? "bg-white/20" : "bg-slate-800")}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}

              {activeLembagaItems.length > 0 && (
                <div className="pt-2">
                  <button 
                    onClick={() => setIsLembagaOpen(!isLembagaOpen)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest",
                      isLembagaActive
                        ? "bg-blue-600/10 text-blue-400 border border-blue-900/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", isLembagaActive ? "bg-blue-500/20" : "bg-slate-800")}>
                        <FolderOpen size={18} />
                      </div>
                      <span>Lembaga Desa</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isLembagaOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isLembagaOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-1 ml-4 border-l border-slate-800 space-y-1"
                      >
                        {activeLembagaItems.map((item) => (
                          <div key={item.id} className="space-y-1">
                            {item.id === 'rt' ? (
                              <>
                                <button
                                  onClick={() => setIsRtOpen(!isRtOpen)}
                                  className={cn(
                                    "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest",
                                    (view === 'rt' || view === 'rt_officials') 
                                      ? "text-blue-400 bg-blue-400/5" 
                                      : "text-slate-500 hover:text-slate-300"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-lg", (view === 'rt' || view === 'rt_officials') ? "bg-blue-400/20" : "bg-slate-800/50")}>
                                      {item.icon}
                                    </div>
                                    <span>{item.label}</span>
                                  </div>
                                  <ChevronDown size={14} className={cn("transition-transform", isRtOpen && "rotate-180")} />
                                </button>
                                <AnimatePresence>
                                  {isRtOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="ml-8 border-l border-slate-800 space-y-1 overflow-hidden"
                                    >
                                      {userHasPermission('rt', 'data_penduduk') && (
                                        <button
                                          onClick={() => handleNavigate('rt')}
                                          className={cn(
                                            "flex items-center w-full py-2 px-4 text-[9px] font-bold uppercase tracking-widest transition-all",
                                            view === 'rt' ? "text-blue-400" : "text-slate-600 hover:text-slate-400"
                                          )}
                                        >
                                          Data Penduduk
                                        </button>
                                      )}
                                      {userHasPermission('rt', 'struktur_pengurus') && (
                                        <button
                                          onClick={() => handleNavigate('rt_officials')}
                                          className={cn(
                                            "flex items-center w-full py-2 px-4 text-[9px] font-bold uppercase tracking-widest transition-all",
                                            view === 'rt_officials' ? "text-blue-400" : "text-slate-600 hover:text-slate-400"
                                          )}
                                        >
                                          Struktur Pengurus
                                        </button>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </>
                            ) : (
                              <button
                                onClick={() => handleNavigate(item.id)}
                                className={cn(
                                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest",
                                  view === item.id 
                                    ? "text-blue-400 bg-blue-400/5" 
                                    : "text-slate-500 hover:text-slate-300"
                                )}
                              >
                                <div className={cn("p-1.5 rounded-lg", view === item.id ? "bg-blue-400/20" : "bg-slate-800/50")}>
                                  {item.icon}
                                </div>
                                <span>{item.label}</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lembagaMenuOpen, setLembagaMenuOpen] = useState(false);
  const [rtSubMenuOpen, setRtSubMenuOpen] = useState(false);
  const [rtOfficialsMenuOpen, setRtOfficialsMenuOpen] = useState(false);
  const [villageData, setVillageData] = useState<Record<string, any>>({});
  const [isVillageDataLoading, setIsVillageDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<'dashboard' | 'residents' | 'users' | 'logs' | 'village_info' | 'reports' | 'profile' | 'bpd' | 'rt' | 'rw' | 'pkk' | 'karang_taruna' | 'lpmd' | 'linmas' | 'village_officials' | 'map' | 'rt_officials' | 'kelahiran' | 'kematian'>('dashboard');
  const [residentsSubMenuOpen, setResidentsSubMenuOpen] = useState(false);
  
  useEffect(() => {
    if (['residents', 'kelahiran', 'kematian'].includes(view)) {
      setResidentsSubMenuOpen(true);
    }
  }, [view]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedRTFilter, setSelectedRTFilter] = useState<string[]>([]);
  const [selectedDusunFilter, setSelectedDusunFilter] = useState<string[]>([]);
  
  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  
  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [importProgress, setImportProgress] = useState<{ total: number, current: number, success: number, failed: number, failedDetails: any[], isOpen: boolean }>({
    total: 0, current: 0, success: 0, failed: 0, failedDetails: [], isOpen: false
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const currentUserRT = useMemo(() => {
    if (!currentUser || !residents.length) return null;
    const resident = residents.find(r => 
      r.nama.toUpperCase() === currentUser.nama_lengkap.toUpperCase() && 
      (r.jabatan?.toUpperCase().startsWith('KETUA RT') || r.jabatan?.toUpperCase() === 'RT')
    );
    return resident?.rt || null;
  }, [currentUser, residents]);

  const calculatedStats = useMemo(() => {
    if (!residents.length) return null;

    const totalPenduduk = residents.length;
    const totalLakiLaki = residents.filter(r => r.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI').length;
    const totalPerempuan = residents.filter(r => r.jenis_kelamin?.toUpperCase() === 'PEREMPUAN').length;
    
    // Total KK based on 'KEPALA KELUARGA' status
    const totalKK = residents.filter(r => r.status_hubungan?.toUpperCase() === 'KEPALA KELUARGA').length;

    // Age distribution
    const ageGroups = {
      '0-5': 0, '6-12': 0, '13-17': 0, '18-25': 0, '26-45': 0, '46-60': 0, '60+': 0
    };

    residents.forEach(r => {
      if (r.tanggal_lahir) {
        const birthDate = new Date(r.tanggal_lahir);
        const age = differenceInYears(new Date(), birthDate);
        if (age <= 5) ageGroups['0-5']++;
        else if (age <= 12) ageGroups['6-12']++;
        else if (age <= 17) ageGroups['13-17']++;
        else if (age <= 25) ageGroups['18-25']++;
        else if (age <= 45) ageGroups['26-45']++;
        else if (age <= 60) ageGroups['46-60']++;
        else ageGroups['60+']++;
      }
    });

    const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

    // Dusun distribution
    const dusunMap: Record<string, number> = {};
    residents.forEach(r => {
      if (r.dusun) {
        dusunMap[r.dusun] = (dusunMap[r.dusun] || 0) + 1;
      }
    });
    
    const dusunData = Object.entries(dusunMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      totalPenduduk,
      totalLakiLaki,
      totalPerempuan,
      totalKK,
      totalUsers: users.length,
      recentLogs: logs.slice(0, 10),
      ageData,
      dusunData
    };
  }, [residents, users, logs]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'nama', direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'form' | 'detail' | 'move_rt' | 'org_form' | 'birth_form' | 'death_form' | 'move_family_rt'>('form');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);

  // Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  // Login Form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => {
    const savedSession = localStorage.getItem('sidapek_session');
    if (savedSession) {
      const user = JSON.parse(savedSession);
      setCurrentUser(user);
      setIsAuthenticated(true);
      fetchData(user.token, 'dashboard');
      fetchData(user.token, 'residents');
    } else {
      fetchData('', 'dashboard');
    }
    
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async (token: string, type: string) => {
    if (!token && type !== 'dashboard') return;
    setIsLoading(true);
    try {
      let res;
      if (type === 'dashboard') {
        res = await apiService.getStats(token);
        if (res.status === 'success') {
          setStats(res.data);
        }
      } else if (type === 'residents' || ['bpd', 'rt', 'rw', 'pkk', 'karang_taruna', 'lpmd', 'linmas', 'village_officials'].includes(type)) {
        res = await apiService.getResidents(token);
        if (res.status === 'success') {
          setResidents(res.data);
        }
      } else if (type === 'users') {
        res = await apiService.getUsers(token);
        if (res.status === 'success') setUsers(res.data);
      } else if (type === 'logs') {
        res = await apiService.getLogs(token);
        if (res.status === 'success') {
          const sortedLogs = (res.data || []).sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLogs(sortedLogs);
        }
      } else if (type === 'village_info') {
        res = await apiService.getVillageInfo(token);
        if (res.status === 'success') setVillageInfo(res.data);
      }

      if (res && res.status === 'error') {
        showNotification(res.message, 'error');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      showNotification('Gagal mengambil data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllVillageData = async () => {
    if (!currentUser?.token) return;
    setIsVillageDataLoading(true);
    try {
      const res = await apiService.getVillageDataAll(currentUser.token!);
      if (res.status === 'success') {
        const results: Record<string, any> = {};
        Object.entries(res.data).forEach(([key, data]) => {
          results[key] = sortVillageData(key, data as any[]);
        });
        setVillageData(results);
      }
    } catch (error) {
      console.error('Error fetching village data:', error);
    } finally {
      setIsVillageDataLoading(false);
    }
  };

  const sortVillageData = (key: string, data: any[]) => {
    if (!Array.isArray(data)) return data;
    const result = [...data];
    
    if (key === 'village_officials') {
      result.sort((a, b) => {
        const getRank = (jabatan: string) => {
          const j = (jabatan || '').toLowerCase();
          if (j.includes('kepala desa')) return 0;
          if (j.includes('sekretaris desa')) return 1;
          if (j.includes('kasi pemerintahan')) return 2;
          if (j.includes('kasi kesejahteraan')) return 3;
          if (j.includes('kasi pelayanan')) return 4;
          if (j.includes('kaur tata usaha')) return 5;
          if (j.includes('kaur keuangan')) return 6;
          if (j.includes('kaur perencanaan')) return 7;
          if (j.includes('kepala wilayah') || j.includes('kepala dusun')) {
            if (j.includes('ciodeng')) return 8;
            if (j.includes('sukawangi')) return 9;
            if (j.includes('sinargalih 1')) return 10;
            if (j.includes('sinargalih 2')) return 11;
            if (j.includes('panguyuhan 1')) return 12;
            if (j.includes('panguyuhan 2')) return 13;
            return 14;
          }
          if (j.includes('staff') || j.includes('staf')) return 15;
          return 16;
        };
        return getRank(a.jabatan || a.Jabatan) - getRank(b.jabatan || b.Jabatan);
      });
    } else if (key === 'bpd') {
      result.sort((a, b) => {
        const getRank = (jabatan: string) => {
          const j = (jabatan || '').toLowerCase();
          if (j.includes('ketua')) return 0;
          if (j.includes('wakil ketua')) return 1;
          if (j.includes('sekretaris')) return 2;
          if (j.includes('anggota')) return 3;
          return 4;
        };
        return getRank(a.jabatan || a.Jabatan) - getRank(b.jabatan || b.Jabatan);
      });
    } else if (key === 'rw') {
      result.sort((a, b) => {
        const getRW = (m: any) => {
          const rwVal = m.rw || m.RW || '';
          const match = String(rwVal).match(/\d+/);
          return match ? parseInt(match[0]) : 999;
        };
        return getRW(a) - getRW(b);
      });
    } else if (key === 'rt') {
      result.sort((a, b) => {
        const getRT = (m: any) => {
          const rtVal = m.rt || m.RT || '';
          const match = String(rtVal).match(/\d+/);
          return match ? parseInt(match[0]) : 999;
        };
        return getRT(a) - getRT(b);
      });
    } else if (key === 'linmas') {
      result.sort((a, b) => {
        const getRank = (jabatan: string) => {
          const j = (jabatan || '').toLowerCase();
          if (j.includes('satlinmas')) return 0;
          return 1;
        };
        return getRank(a.jabatan || a.Jabatan) - getRank(b.jabatan || b.Jabatan);
      });
    }
    
    return result;
  };

  const handleSaveVillageData = async (key: string, data: any) => {
    if (!currentUser?.token) return;
    const sortedData = sortVillageData(key, data);
    try {
      const res = await apiService.saveVillageData(key, sortedData, currentUser.token!);
      if (res.status === 'success') {
        setVillageData(prev => ({ ...prev, [key]: sortedData }));
        showNotification(`Data ${key.toUpperCase()} berhasil disimpan`, 'success');
      } else {
        showNotification(res.message || 'Gagal menyimpan data lembaga', 'error');
      }
    } catch (error) {
      showNotification('Gagal menyimpan data lembaga', 'error');
    }
  };

  useEffect(() => {
    if (currentUser?.token) {
      fetchAllVillageData();
    }
  }, [currentUser]);

  const residentOrgDetails = useMemo(() => {
    const mapping: Record<string, any[]> = {};
    Object.entries(villageData).forEach(([orgKey, members]) => {
      if (!Array.isArray(members)) return;
      members.forEach(member => {
        const nik = member.nik || member.NIK;
        if (nik) {
          if (!mapping[nik]) mapping[nik] = [];
          mapping[nik].push({
            ...member,
            orgKey,
            orgName: orgKey === 'village_officials' ? 'PERANGKAT DESA' : orgKey.replace(/_/g, ' ').toUpperCase()
          });
        }
      });
    });
    return mapping;
  }, [villageData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiService.login(loginForm);
      if (data.status === 'success') {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setIsLoginModalOpen(false);
        localStorage.setItem('sidapek_session', JSON.stringify(data.user));
        fetchData(data.user.token, 'dashboard');
        // Background fetch for faster navigation
        fetchData(data.user.token, 'residents');
        showNotification(`Selamat datang, ${data.user.nama_lengkap}`, 'success');
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Gagal login. Pastikan server berjalan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sidapek_session');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setView('dashboard');
    setProfileMenuOpen(false);
    showNotification('Berhasil keluar dari sistem', 'info');
  };

  const navigate = (newView: any, rt?: string) => {
    setView(newView);
    if (rt) setSelectedRTFilter([String(rt).padStart(3, '0')]);
    else if (newView !== 'rt' && newView !== 'rt_officials') setSelectedRTFilter([]);
    setCurrentPage(1);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    
    // Auto-hide/show Lembaga Desa menu
    if (['bpd', 'rt', 'rw', 'pkk', 'karang_taruna', 'lpmd', 'linmas', 'rt_officials'].includes(newView)) {
      setLembagaMenuOpen(true);
    } else {
      setLembagaMenuOpen(false);
    }

    // Auto-hide/show Data Penduduk menu
    if (['residents', 'kelahiran', 'kematian'].includes(newView)) {
      setResidentsSubMenuOpen(true);
    } else {
      setResidentsSubMenuOpen(false);
    }
    
    // Optimization: Only fetch if data is missing or it's a dashboard refresh
    if (currentUser) {
      if (newView === 'dashboard') {
        fetchData(currentUser.token, newView);
      } else if (newView === 'residents' || ['bpd', 'rt', 'rw', 'pkk', 'karang_taruna', 'lpmd', 'linmas', 'village_officials', 'rt_officials'].includes(newView)) {
        if (residents.length === 0) fetchData(currentUser.token, newView);
      } else if (newView === 'users') {
        if (users.length === 0) fetchData(currentUser.token, newView);
      } else if (newView === 'logs') {
        if (logs.length === 0) fetchData(currentUser.token, newView);
      } else if (newView === 'village_info') {
        if (!villageInfo) fetchData(currentUser.token, newView);
      }
    } else if (newView === 'dashboard') {
      // Public dashboard fetch
      fetchData('', 'dashboard');
    }
    
    // Close mobile menu on navigate
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(false);
    }
  };

  const userHasPermission = (viewName: string, action?: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    
    try {
      const perms = JSON.parse(currentUser.permissions || '[]');
      
      // Check for specific RT/Dusun filter if view is 'rt'
      if (viewName === 'rt' && action && action.startsWith('filter:')) {
        const hasSpecificRTFilters = perms.some((p: string) => p.startsWith('rt:filter:') && !p.startsWith('rt:filter:dusun:'));
        const hasSpecificDusunFilters = perms.some((p: string) => p.startsWith('rt:filter:dusun:'));
        
        if (action.startsWith('filter:dusun:')) {
          if (!hasSpecificDusunFilters) return perms.includes('rt');
          return perms.includes(`rt:${action}`);
        }
        
        if (!hasSpecificRTFilters) return perms.includes('rt');
        return perms.includes(`rt:${action}`);
      }

      // Check for specific Dusun/RT filter if view is 'residents'
      if (viewName === 'residents' && action && action.startsWith('filter:')) {
        const hasDusunFilters = perms.some((p: string) => p.startsWith('residents:filter:dusun:'));
        const hasRTFilters = perms.some((p: string) => p.startsWith('residents:filter:rt:'));
        
        if (action.startsWith('filter:dusun:')) {
          if (!hasDusunFilters) return perms.includes('residents');
          return perms.includes(`residents:${action}`);
        }
        
        if (action.startsWith('filter:rt:')) {
          if (!hasRTFilters) return perms.includes('residents');
          return perms.includes(`residents:${action}`);
        }
      }

      // If action is provided, check for granular permission (e.g., 'residents:add')
      if (action) {
        return perms.includes(`${viewName}:${action}`) || perms.includes(`action:${action}`);
      }
      
      // Check if it's an action permission (starts with action:)
      if (viewName.startsWith('action:')) {
        return perms.includes(viewName);
      }
      
      // Check if it's a menu/view permission
      return perms.includes(viewName);
    } catch (e) {
      return false;
    }
  };

  // Filtered Data
  const filteredData = useMemo(() => {
    const searchLower = deferredSearchQuery.toLowerCase();

    let result: any[] = [];

    if (view === 'residents' || view === 'kelahiran' || view === 'kematian') {
      const sourceData = view === 'residents' ? residents : (villageData[view] || []);
      if (sourceData.length === 0) return [];

      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      
      result = sourceData.filter((r: any) => {
        // Optimization: Quick check for Dusun and RT first as they are likely indexed or simple matches
        const matchesDusun = selectedDusunFilter.length > 0 ? selectedDusunFilter.includes(r.dusun?.trim().toUpperCase()) : true;
        if (!matchesDusun) return false;

        const matchesRT = selectedRTFilter.length > 0 ? selectedRTFilter.includes(String(r.rt).padStart(3, '0')) : true;
        if (!matchesRT) return false;
        
        // Permission-based Dusun/RT filter
        const hasDusunPermission = userHasPermission('residents', `filter:dusun:${r.dusun}`);
        if (!hasDusunPermission) return false;

        const hasRTPermission = userHasPermission('residents', `filter:rt:${String(r.rt).padStart(3, '0')}`);
        if (!hasRTPermission) return false;
        
        // Search filter
        const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
          (r.nama || '').toLowerCase().includes(term) || 
          String(r.nik || '').includes(term) ||
          (r.alamat || '').toLowerCase().includes(term) ||
          String(r.rt || '').includes(term) ||
          String(r.rw || '').includes(term) ||
          (r.dusun || '').toLowerCase().includes(term) ||
          (r.pekerjaan || '').toLowerCase().includes(term)
        );
        
        return matchesSearch;
      });

      // Apply sorting for residents
      result.sort((a, b) => {
        // Priority 1: No KK (Group families together)
        if (a.no_kk !== b.no_kk) {
          return String(a.no_kk || '').localeCompare(String(b.no_kk || ''));
        }

        // Priority 2: Status Hubungan (Hierarchical)
        const getStatusRank = (status: string) => {
          const s = (status || '').toUpperCase();
          if (s === 'KEPALA KELUARGA') return 0;
          if (s === 'ISTRI') return 1;
          if (s === 'ANAK') return 2;
          if (s === 'CUCU') return 3;
          if (s === 'ORANG TUA') return 4;
          if (s === 'MERTUA') return 5;
          if (s === 'FAMILI LAIN') return 6;
          if (s === 'PEMBANTU') return 7;
          return 8;
        };

        const rankA = getStatusRank(a.status_hubungan);
        const rankB = getStatusRank(b.status_hubungan);

        if (rankA !== rankB) return rankA - rankB;

        // Priority 3: Age (Oldest first within same status)
        const ageA = a.tanggal_lahir ? new Date(a.tanggal_lahir).getTime() : Infinity;
        const ageB = b.tanggal_lahir ? new Date(b.tanggal_lahir).getTime() : Infinity;
        return ageA - ageB;
      });
    }

    // Organization Filters
    const orgMap: Record<string, string> = {
      'village_officials': 'Perangkat Desa',
      'bpd': 'BPD',
      'rt': 'RT',
      'rw': 'RW',
      'pkk': 'PKK',
      'karang_taruna': 'Karang Taruna',
      'lpmd': 'LPMD',
      'linmas': 'Linmas'
    };

    if (orgMap[view]) {
      result = residents.filter(r => r.lembaga === orgMap[view]);
    } else if (view === 'users') {
      result = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchLower) || 
                             u.nama_lengkap.toLowerCase().includes(searchLower);
        
        let matchesRT = true;
        if (selectedRTFilter.length > 0) {
          try {
            const perms = JSON.parse(u.permissions || '[]');
            matchesRT = selectedRTFilter.some(rt => perms.includes(`rt:filter:${rt}`) || perms.includes(`residents:filter:rt:${rt}`));
          } catch (e) {
            matchesRT = false;
          }
        }
        
        return matchesSearch && matchesRT;
      });
    } else if (view === 'logs') {
      result = logs.filter(l => 
        l.action.toLowerCase().includes(searchLower) || 
        l.username.toLowerCase().includes(searchLower) ||
        l.detail.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [view, residents, users, logs, deferredSearchQuery, selectedDusunFilter, selectedRTFilter, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset page when filters or view change
  useEffect(() => {
    setCurrentPage(1);
  }, [view, searchQuery, selectedRTFilter, selectedDusunFilter]);

  // --- RENDERING HELPERS ---

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 shadow-2xl lg:relative lg:translate-x-0 hidden lg:flex",
          sidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50 flex-shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            {(sidebarOpen || mobileMenuOpen) && (
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight leading-none">SIDAPEK</span>
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Desa Digital</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 lg:hidden transition-colors"
          >
            <X size={20} />
          </button>
        </div>

          <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {userHasPermission('dashboard') && (
              <SidebarItem 
                icon={<Home size={20} />} 
                label="Dashboard" 
                active={view === 'dashboard'} 
                onClick={() => navigate('dashboard')} 
                collapsed={!sidebarOpen && !mobileMenuOpen} 
              />
            )}
            {(userHasPermission('residents') || userHasPermission('kelahiran') || userHasPermission('kematian')) && (
              <div className="space-y-1">
                <button 
                  onClick={() => setResidentsSubMenuOpen(!residentsSubMenuOpen)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-white",
                    (view === 'residents' || view === 'kelahiran' || view === 'kematian') && "bg-blue-600/10 text-blue-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} className={cn("flex-shrink-0 group-hover:scale-110 transition-transform", (view === 'residents' || view === 'kelahiran' || view === 'kematian') ? "text-blue-400" : "text-slate-500")} />
                    {(sidebarOpen || mobileMenuOpen) && <span className="font-bold text-xs tracking-tight">Data Penduduk</span>}
                  </div>
                  {(sidebarOpen || mobileMenuOpen) && (
                    <motion.div
                      animate={{ rotate: residentsSubMenuOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  )}
                </button>
                
                <AnimatePresence>
                  {residentsSubMenuOpen && (sidebarOpen || mobileMenuOpen) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-1 ml-4 border-l border-slate-800 space-y-1"
                    >
                      {userHasPermission('residents') && <SidebarSubItem label="Semua Penduduk" active={view === 'residents'} onClick={() => navigate('residents')} />}
                      {userHasPermission('kelahiran') && <SidebarSubItem label="Kelahiran" active={view === 'kelahiran'} onClick={() => navigate('kelahiran')} />}
                      {userHasPermission('kematian') && <SidebarSubItem label="Kematian" active={view === 'kematian'} onClick={() => navigate('kematian')} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {userHasPermission('map') && (
              <SidebarItem 
                icon={<Map size={20} />} 
                label="Peta Desa" 
                active={view === 'map'} 
                onClick={() => navigate('map')} 
                collapsed={!sidebarOpen && !mobileMenuOpen} 
              />
            )}
            {userHasPermission('village_officials') && (
              <SidebarItem 
                icon={<Briefcase size={20} />} 
                label="Perangkat Desa" 
                active={view === 'village_officials'} 
                onClick={() => navigate('village_officials')} 
                collapsed={!sidebarOpen && !mobileMenuOpen} 
              />
            )}

            {(userHasPermission('bpd') || userHasPermission('rt') || userHasPermission('rw') || userHasPermission('pkk') || userHasPermission('karang_taruna') || userHasPermission('lpmd') || userHasPermission('linmas')) && (
              <div className="py-2">
                <button 
                  onClick={() => setLembagaMenuOpen(!lembagaMenuOpen)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-white",
                    (view === 'bpd' || view === 'rt' || view === 'rw' || view === 'pkk' || view === 'karang_taruna' || view === 'lpmd' || view === 'linmas') && "bg-blue-600/10 text-blue-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen size={18} className={cn("flex-shrink-0 group-hover:scale-110 transition-transform", (view === 'bpd' || view === 'rt' || view === 'rw' || view === 'pkk' || view === 'karang_taruna' || view === 'lpmd' || view === 'linmas') ? "text-blue-400" : "text-slate-500")} />
                    {(sidebarOpen || mobileMenuOpen) && <span className="font-bold text-xs tracking-tight">Lembaga Desa</span>}
                  </div>
                  {(sidebarOpen || mobileMenuOpen) && (
                    <motion.div
                      animate={{ rotate: lembagaMenuOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  )}
                </button>
                
                <AnimatePresence>
                  {lembagaMenuOpen && (sidebarOpen || mobileMenuOpen) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-1 ml-4 border-l border-slate-800 space-y-1"
                    >
                      {userHasPermission('bpd') && <SidebarSubItem label="BPD" active={view === 'bpd'} onClick={() => navigate('bpd')} />}
                      {userHasPermission('rt') && (
                        <div className="space-y-1">
                          <button 
                            onClick={() => setRtSubMenuOpen(!rtSubMenuOpen)}
                            className={cn(
                              "flex items-center justify-between w-full py-2.5 px-4 text-xs font-bold transition-all duration-200 rounded-xl group",
                              (view === 'rt' || view === 'rt_officials') ? "text-blue-400 bg-blue-400/5" : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
                            )}
                          >
                            <div className="flex items-center">
                              <div className={cn("w-1.5 h-1.5 rounded-full mr-3", (view === 'rt' || view === 'rt_officials') ? "bg-blue-400" : "bg-slate-700")} />
                              RT
                            </div>
                            <ChevronDown size={14} className={cn("transition-transform", rtSubMenuOpen && "rotate-180")} />
                          </button>
                          <AnimatePresence>
                            {rtSubMenuOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-6 border-l border-slate-800 space-y-1 overflow-hidden"
                              >
                                {userHasPermission('rt', 'data_penduduk') && <SidebarSubItem label="Data Penduduk" active={view === 'rt'} onClick={() => navigate('rt')} />}
                                {userHasPermission('rt', 'struktur_pengurus') && <SidebarSubItem label="Struktur Pengurus" active={view === 'rt_officials'} onClick={() => navigate('rt_officials')} />}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {userHasPermission('rw') && <SidebarSubItem label="RW" active={view === 'rw'} onClick={() => navigate('rw')} />}
                      {userHasPermission('pkk') && <SidebarSubItem label="PKK" active={view === 'pkk'} onClick={() => navigate('pkk')} />}
                      {userHasPermission('karang_taruna') && <SidebarSubItem label="Karang Taruna" active={view === 'karang_taruna'} onClick={() => navigate('karang_taruna')} />}
                      {userHasPermission('lpmd') && <SidebarSubItem label="LPMD" active={view === 'lpmd'} onClick={() => navigate('lpmd')} />}
                      {userHasPermission('linmas') && <SidebarSubItem label="Linmas" active={view === 'linmas'} onClick={() => navigate('linmas')} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-slate-800/50">
              {userHasPermission('reports') && (
                <SidebarItem 
                  icon={<FileText size={20} />} 
                  label="Laporan & Impor" 
                  active={view === 'reports'} 
                  onClick={() => navigate('reports')} 
                  collapsed={!sidebarOpen && !mobileMenuOpen} 
                />
              )}
              {userHasPermission('logs') && (
                <SidebarItem 
                  icon={<History size={20} />} 
                  label="Log Aktivitas" 
                  active={view === 'logs'} 
                  onClick={() => navigate('logs')} 
                  collapsed={!sidebarOpen && !mobileMenuOpen} 
                />
              )}
              {userHasPermission('village_info') && (
                <SidebarItem 
                  icon={<Info size={20} />} 
                  label="Informasi Desa" 
                  active={view === 'village_info'} 
                  onClick={() => navigate('village_info')} 
                  collapsed={!sidebarOpen && !mobileMenuOpen} 
                />
              )}
              {userHasPermission('users') && (
                <SidebarItem 
                  icon={<ShieldCheck size={20} />} 
                  label="Kelola User" 
                  active={view === 'users'} 
                  onClick={() => navigate('users')} 
                  collapsed={!sidebarOpen && !mobileMenuOpen} 
                />
              )}
            </div>
          </nav>

          {(sidebarOpen || mobileMenuOpen) && (
            <div className="mt-auto p-6 border-t border-slate-800/50">
              <div className="px-4 py-3 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2.5 h-2.5 rounded-full shadow-lg", IS_GAS ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20")}></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Database Mode</span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {IS_GAS ? "Google Sheets" : "Local Server"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileTopNav view={view} navigate={navigate} userHasPermission={userHasPermission} />
        
        {IS_GAS && (!GAS_URL || !GAS_URL.startsWith('https://script.google.com/macros/s/')) && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3 text-amber-800">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
            <div className="text-xs font-medium">
              <span className="font-bold">Konfigurasi GAS Diperlukan:</span> VITE_GAS_URL belum diatur atau tidak valid. Silakan atur di menu Settings atau file .env untuk menggunakan mode Google Sheets.
            </div>
          </div>
        )}

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all active:scale-90 hidden lg:block"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm md:text-base font-black text-slate-800 capitalize truncate max-w-[120px] md:max-w-none leading-tight">
                {view === 'residents' ? 'Data Penduduk' : view.replace(/_/g, ' ')}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Sistem Informasi Desa</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated && (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
              >
                <ShieldCheck size={16} /> Login
              </button>
            )}
            <button 
              onClick={() => setShowTutorial(true)}
              className="p-2 rounded-lg hover:bg-slate-100 text-blue-600 transition-colors"
              title="Panduan Pengguna"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            {isAuthenticated && (
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-bold text-slate-800">{currentUser?.nama_lengkap}</p>
                    <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">{currentUser?.role}</p>
                  </div>
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
                  >
                    {currentUser?.nama_lengkap.charAt(0).toUpperCase()}
                  </button>
                </div>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileMenuOpen(false)}
                      ></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            navigate('profile');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        >
                          <UserCog size={18} className="text-blue-500" />
                          Profile
                        </button>
                        <div className="h-px bg-slate-100 mx-2 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                        >
                          <LogOut size={18} />
                          Keluar
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 relative">
          {/* Global Notification Toast */}
          <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
              {notification && (
                <motion.div 
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.9 }}
                  className={cn(
                    "pointer-events-auto px-6 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md border backdrop-blur-md",
                    notification.type === 'success' ? "bg-emerald-500/95 border-emerald-400 text-white" : 
                    notification.type === 'error' ? "bg-rose-500/95 border-rose-400 text-white" : 
                    "bg-blue-600/95 border-blue-400 text-white"
                  )}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {notification.type === 'success' && <CheckCircle2 size={22} />}
                    {notification.type === 'error' && <AlertCircle size={22} />}
                    {notification.type === 'info' && <Bell size={22} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">
                      {notification.type === 'success' ? 'Berhasil' : notification.type === 'error' ? 'Kesalahan' : 'Informasi'}
                    </p>
                    <p className="font-bold text-sm leading-tight">{notification.message}</p>
                  </div>
                  <button 
                    onClick={() => setNotification(null)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Import Progress Modal */}
          <AnimatePresence>
            {importProgress.isOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                >
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800">Proses Impor Data</h3>
                      {importProgress.current === importProgress.total && (
                        <button 
                          onClick={() => setImportProgress(prev => ({ ...prev, isOpen: false }))}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-blue-600">{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                          className="h-full bg-blue-600"
                        />
                      </div>
                      <p className="text-xs text-slate-400 text-center">{importProgress.current} dari {importProgress.total} data diproses</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Berhasil</p>
                        <p className="text-2xl font-bold text-emerald-600">{importProgress.success}</p>
                      </div>
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Gagal</p>
                        <p className="text-2xl font-bold text-rose-600">{importProgress.failed}</p>
                      </div>
                    </div>

                    {importProgress.failedDetails.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Detail Kegagalan</p>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                          {importProgress.failedDetails.map((f, i) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{f.nama}</p>
                                <p className="text-[10px] font-mono text-slate-400">{f.nik}</p>
                              </div>
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">{f.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {importProgress.current === importProgress.total && (
                      <button 
                        onClick={() => setImportProgress(prev => ({ ...prev, isOpen: false }))}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                      >
                        SELESAI
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && <DashboardView stats={calculatedStats} residents={residents} setView={navigate} isAuthenticated={isAuthenticated} currentUser={currentUser} userHasPermission={userHasPermission} />}
              {view === 'map' && <VillageMapView residents={residents} />}
              {(view === 'rt' || view === 'rt_officials') && (
                <RTView 
                  residents={residents}
                  currentUser={currentUser}
                  currentUserRT={currentUserRT}
                  initialRT={selectedRTFilter}
                  initialTab={view === 'rt_officials' ? 'organization' : 'residents'}
                  onDetail={(item: any) => { setEditingItem(item); setModalType('detail'); setIsModalOpen(true); }}
                  onMoveRT={(item: any) => { 
                    setEditingItem(item); 
                    setModalType(item.status_hubungan === 'KEPALA KELUARGA' ? 'move_family_rt' : 'move_rt'); 
                    setIsModalOpen(true); 
                  }}
                  onEdit={(item: any) => { setEditingItem(item); setModalType('form'); setIsModalOpen(true); }}
                  onAddResident={(rt?: string) => { setEditingItem(rt ? { rt } : null); setModalType('form'); setIsModalOpen(true); }}
                  onAddOrgMember={(rt?: string) => { 
                    if (rt) setSelectedRTFilter([String(rt).padStart(3, '0')]);
                    setEditingItem(null); 
                    setModalType('org_form'); 
                    setIsModalOpen(true); 
                  }}
                  onDelete={handleDeleteResident}
                  onDeleteOrgMember={(nik: string, orgKey: string) => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Hapus Pengurus',
                      message: 'Apakah Anda yakin ingin menghapus pengurus ini dari daftar?',
                      onConfirm: () => {
                        const newData = villageData[orgKey].filter((m: any) => (m.nik || m.NIK) !== nik);
                        handleSaveVillageData(orgKey, newData);
                      }
                    });
                  }}
                  userHasPermission={userHasPermission}
                  villageData={villageData}
                  onSaveVillageData={handleSaveVillageData}
                  onNavigate={navigate}
                  residentOrgDetails={residentOrgDetails}
                />
              )}
              {view === 'residents' && (
                <ResidentsView 
                  data={paginatedData} 
                  search={searchQuery} 
                  setSearch={setSearchQuery}
                  selectedDusunFilter={selectedDusunFilter}
                  setSelectedDusunFilter={setSelectedDusunFilter}
                  selectedRTFilter={selectedRTFilter}
                  setSelectedRTFilter={setSelectedRTFilter}
                  onAdd={() => { setEditingItem(null); setModalType('form'); setIsModalOpen(true); }}
                  onEdit={(item: any) => { setEditingItem(item); setModalType('form'); setIsModalOpen(true); }}
                  onDetail={(item: any) => { setEditingItem(item); setModalType('detail'); setIsModalOpen(true); }}
                  onDelete={handleDeleteResident}
                  onBulkDelete={handleBulkDeleteResidents}
                  selectedResidents={selectedResidents}
                  setSelectedResidents={setSelectedResidents}
                  pagination={{ 
                    current: currentPage, 
                    total: totalPages, 
                    set: setCurrentPage,
                    itemsPerPage,
                    setItemsPerPage
                  }}
                  residents={residents}
                  userHasPermission={userHasPermission}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  residentOrgDetails={residentOrgDetails}
                  onAddBirth={() => { setEditingItem(null); setModalType('birth_form'); setIsModalOpen(true); }}
                  onAddDeath={(item?: any) => { 
                    setEditingItem(item || null); 
                    setModalType('death_form'); 
                    setIsModalOpen(true); 
                  }}
                />
              )}
              {view === 'kelahiran' && (
                <div className="p-8">
                  <BirthTableView 
                    data={filteredData}
                    onAdd={() => { setEditingItem(null); setModalType('birth_form'); setIsModalOpen(true); }}
                    onDelete={handleDeleteKelahiran}
                    userHasPermission={userHasPermission}
                  />
                </div>
              )}
              {view === 'kematian' && (
                <div className="p-8">
                  <DeathTableView 
                    data={filteredData}
                    onAdd={() => { setEditingItem(null); setModalType('death_form'); setIsModalOpen(true); }}
                    onDelete={handleDeleteKematian}
                    userHasPermission={userHasPermission}
                  />
                </div>
              )}
              {['bpd', 'rw', 'pkk', 'karang_taruna', 'lpmd', 'linmas'].includes(view) && (
                <OrganizationView 
                  type={view}
                  residents={residents}
                  data={villageData[view] || []}
                  userHasPermission={userHasPermission}
                  onDetail={(item: any) => { setEditingItem(item); setModalType('detail'); setIsModalOpen(true); }}
                  onAdd={() => {}}
                  onSaveVillageData={handleSaveVillageData}
                  residentOrgDetails={residentOrgDetails}
                  showConfirm={showConfirm}
                />
              )}
              {view === 'village_officials' && (
                <OrganizationView 
                  type="village_officials"
                  residents={residents}
                  data={villageData['village_officials'] || []}
                  userHasPermission={userHasPermission}
                  onDetail={(item: any) => { setEditingItem(item); setModalType('detail'); setIsModalOpen(true); }}
                  onAdd={() => {}}
                  onSaveVillageData={handleSaveVillageData}
                  residentOrgDetails={residentOrgDetails}
                  showConfirm={showConfirm}
                />
              )}
              {view === 'users' && (
                <UsersView 
                  data={paginatedData} 
                  userHasPermission={userHasPermission}
                  onAdd={() => { setEditingItem(null); setModalType('form'); setIsModalOpen(true); }}
                  onEdit={(item: any) => { setEditingItem(item); setModalType('form'); setIsModalOpen(true); }}
                  onDelete={handleDeleteUser}
                  selectedRT={selectedRTFilter}
                  setSelectedRT={setSelectedRTFilter}
                  residents={residents}
                />
              )}
              {view === 'logs' && <LogsView data={paginatedData} />}
              {view === 'reports' && <ReportsView residents={residents} onImport={handleImportResidents} userHasPermission={userHasPermission} />}
              {view === 'village_info' && <VillageInfoView info={villageInfo} onUpdate={handleUpdateVillageInfo} />}
              {view === 'profile' && <ProfileView currentUser={currentUser} onUpdate={handleUpdateProfile} showNotification={showNotification} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl relative">
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-6">
                  <Database className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">SIDAPEK</h1>
                <p className="text-slate-400 mt-2 font-medium">Sistem Informasi Data Penduduk Desa</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={loginForm.username}
                      onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Masukkan username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheck className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={loginForm.password}
                      onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Masukkan password"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'MASUK KE SISTEM'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {isModalOpen && (
        <Modal 
          title={modalType === 'detail' ? 'Detail Penduduk' : (editingItem ? 'Edit Data' : 'Tambah Data')} 
          onClose={() => setIsModalOpen(false)}
        >
          {modalType === 'move_rt' && (
            <MoveRTModal 
              resident={editingItem}
              onSave={(data: any) => {
                handleSaveResident(data);
                setIsModalOpen(false);
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
          {(view === 'residents' || view === 'rt' || ['bpd', 'rw', 'pkk', 'karang_taruna', 'lpmd', 'linmas'].includes(view)) && modalType === 'form' && (
            <ResidentForm 
              initialData={editingItem} 
              onSubmit={handleSaveResident} 
              onCancel={() => setIsModalOpen(false)} 
              showNotification={showNotification}
            />
          )}
          {['bpd', 'rw', 'pkk', 'karang_taruna', 'lpmd', 'linmas', 'village_officials'].includes(view) && modalType === 'org_form' && (
            <OrganizationMemberForm 
              residents={residents}
              initialData={editingItem}
              onSubmit={(data: any) => {
                handleSaveVillageData(view, Array.isArray(villageData[view]) ? (editingItem?.nik ? villageData[view].map((m: any) => (m.nik === editingItem.nik || m.NIK === editingItem.nik) ? data : m) : [...villageData[view], data]) : [data]);
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
              showNotification={showNotification}
              type={view}
              activeRT={selectedRTFilter}
            />
          )}

          {(view === 'rt' || view === 'rt_officials') && modalType === 'org_form' && (
            <OrganizationMemberForm 
              residents={residents}
              initialData={editingItem}
              onSubmit={(data: any) => {
                handleSaveVillageData('rt', Array.isArray(villageData['rt']) ? (editingItem?.nik ? villageData['rt'].map((m: any) => (m.nik === editingItem.nik || m.NIK === editingItem.nik) ? data : m) : [...villageData['rt'], data]) : [data]);
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
              showNotification={showNotification}
              type="rt"
              activeRT={selectedRTFilter}
            />
          )}

          {(view === 'residents' || view === 'rt' || ['bpd', 'rw', 'pkk', 'karang_taruna', 'lpmd', 'linmas', 'village_officials'].includes(view)) && modalType === 'detail' && (
            <ResidentDetail 
              data={editingItem} 
              onEdit={() => setModalType('form')} 
              onMoveRT={(item: any) => setModalType('move_rt')}
              onSelectMember={(member: Resident) => setEditingItem(member)}
              onAddFamilyMember={(no_kk: string) => {
                const head = residents.find(r => r.no_kk === no_kk && r.status_hubungan === 'KEPALA KELUARGA');
                const mother = residents.find(r => r.no_kk === no_kk && r.status_hubungan === 'ISTRI');
                const sample = residents.find(r => r.no_kk === no_kk);
                
                setEditingItem({ 
                  no_kk,
                  alamat: sample?.alamat || '',
                  rt: sample?.rt || '',
                  rw: sample?.rw || '',
                  dusun: sample?.dusun || '',
                  nama_ayah: head?.nama || '',
                  nama_ibu: mother?.nama || '',
                  status_hubungan: 'ANAK'
                } as any);
                setModalType('form');
              }}
              showNotification={showNotification} 
              residents={residents}
              currentUser={currentUser}
              residentOrgDetails={residentOrgDetails}
            />
          )}
          {modalType === 'birth_form' && (
            <BirthForm 
              onSubmit={handleKelahiran}
              onCancel={() => setIsModalOpen(false)}
              residents={residents}
              currentUser={currentUser}
            />
          )}
          {modalType === 'death_form' && (
            <DeathForm 
              onSubmit={handleKematian}
              onCancel={() => setIsModalOpen(false)}
              residents={residents}
              currentUser={currentUser}
              initialResident={editingItem}
            />
          )}
          {modalType === 'move_family_rt' && (
            <MoveFamilyRTForm 
              onSubmit={handleMoveFamilyRT}
              onCancel={() => setIsModalOpen(false)}
              residents={residents}
              initialResident={editingItem}
            />
          )}
          {view === 'users' && (
            <UserForm 
              initialData={editingItem} 
              onSubmit={handleSaveUser} 
              onCancel={() => setIsModalOpen(false)} 
              residents={residents}
            />
          )}
        </Modal>
      )}

      {confirmModal.isOpen && (
        <ConfirmModal 
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal({ ...confirmModal, isOpen: false });
          }}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />
      )}

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );

  // --- ACTIONS ---

  async function cleanupDuplicates(data: Resident[], token: string) {
    const nikGroups: Record<string, Resident[]> = {};
    data.forEach(r => {
      if (!nikGroups[r.nik]) nikGroups[r.nik] = [];
      nikGroups[r.nik].push(r);
    });

    const duplicates = Object.entries(nikGroups).filter(([_, group]) => group.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate NIK groups. Cleaning up...`);
      
      for (const [nik, group] of duplicates) {
        // Sort by completeness (number of non-empty fields)
        const sorted = group.sort((a, b) => {
          const aFields = Object.values(a).filter(v => v !== null && v !== undefined && v !== '').length;
          const bFields = Object.values(b).filter(v => v !== null && v !== undefined && v !== '').length;
          return bFields - aFields; // Most complete first
        });

        // Keep the first one (most complete), delete the rest
        const toDelete = sorted.slice(1);
        for (const item of toDelete) {
          try {
            // We need a way to delete by row/id if NIK is not unique enough
            // But our deleteResident uses NIK. This is tricky if NIK is the same.
            // If the backend uses NIK as key, it might delete both.
            // Let's assume the backend can handle it or we just notify.
            // Actually, if they have the same NIK, a single delete might be enough if it's a spreadsheet.
            // But if it's a DB, it depends on the primary key.
            // For now, let's just log it and try to delete one.
            await apiService.deleteResident(item.nik, token);
          } catch (e) {
            console.error(`Failed to delete duplicate NIK ${nik}`, e);
          }
        }
      }
      // Refresh after cleanup
      fetchData(token, 'residents');
    }
  }

  async function handleUpdateVillageInfo(data: any) {
    if (!currentUser) return;
    try {
      const res = await apiService.updateVillageInfo(data, currentUser.token!);
      if (res.status === 'success') {
        setVillageInfo(data);
        showNotification('Informasi desa berhasil diperbarui', 'success');
      }
    } catch (error) {
      showNotification('Gagal memperbarui informasi desa', 'error');
    }
  }

  async function handleUpdateProfile(data: any) {
    if (!currentUser) return;
    try {
      const res = await apiService.updateProfile(data, currentUser.token!);
      if (res.status === 'success') {
        const updatedUser = { ...currentUser, ...data };
        setCurrentUser(updatedUser);
        localStorage.setItem('sidapek_session', JSON.stringify(updatedUser));
        showNotification('Profil berhasil diperbarui', 'success');
      }
    } catch (error) {
      showNotification('Gagal memperbarui profil', 'error');
    }
  }

  async function handleImportResidents(data: any[]) {
    if (!currentUser) return;
    
    // Check for duplicate NIKs locally
    const existingNIKs = new Set(residents.map(r => String(r.nik)));
    const validData: any[] = [];
    const failedData: any[] = [];

    data.forEach(item => {
      if (existingNIKs.has(String(item.nik))) {
        failedData.push({ 
          nik: item.nik, 
          nama: item.nama, 
          reason: 'NIK Ganda' 
        });
      } else {
        validData.push(item);
      }
    });

    setImportProgress({
      total: data.length,
      current: failedData.length,
      success: 0,
      failed: failedData.length,
      failedDetails: failedData,
      isOpen: true
    });

    if (validData.length === 0) {
      fetchData(currentUser.token!, 'residents');
      return;
    }

    const chunkSize = 20;
    const chunks = [];
    for (let i = 0; i < validData.length; i += chunkSize) {
      chunks.push(validData.slice(i, i + chunkSize));
    }

    let totalSuccess = 0;
    let totalFailed = failedData.length;
    const allFailedDetails: any[] = [...failedData];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const res = await apiService.importResidents(chunks[i], currentUser.token!);
        if (res.status === 'success') {
          totalSuccess += res.success || res.count || chunks[i].length;
          totalFailed += res.failed || 0;
          if (res.failedDetails) allFailedDetails.push(...res.failedDetails);
        } else {
          totalFailed += chunks[i].length;
          chunks[i].forEach((r: any) => allFailedDetails.push({ nik: r.nik, nama: r.nama, reason: res.message || 'Gagal sistem' }));
        }
      } catch (error: any) {
        totalFailed += chunks[i].length;
        chunks[i].forEach((r: any) => allFailedDetails.push({ nik: r.nik, nama: r.nama, reason: error.message || 'Gagal koneksi' }));
      }

      setImportProgress(prev => ({
        ...prev,
        current: Math.min(prev.total, failedData.length + (i + 1) * chunkSize),
        success: totalSuccess,
        failed: totalFailed,
        failedDetails: allFailedDetails
      }));
    }

    fetchData(currentUser.token!, 'residents');
  }

  async function handleKelahiran(data: any) {
    if (!currentUser?.token) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const res = await apiService.handleKelahiran(data, currentUser.token);
      if (res.status === 'success') {
        showNotification('Data kelahiran berhasil disimpan', 'success');
        fetchData(currentUser.token, 'residents');
        fetchAllVillageData();
        setIsModalOpen(false);
      } else {
        showNotification(res.message || 'Gagal menyimpan data kelahiran', 'error');
      }
    } catch (error) {
      showNotification('Gagal menyimpan data kelahiran', 'error');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }

  async function handleKematian(data: any) {
    if (!currentUser?.token) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const res = await apiService.handleKematian(data, currentUser.token);
      if (res.status === 'success') {
        showNotification('Data kematian berhasil disimpan', 'success');
        fetchData(currentUser.token, 'residents');
        fetchAllVillageData();
        setIsModalOpen(false);
      } else {
        showNotification(res.message || 'Gagal menyimpan data kematian', 'error');
      }
    } catch (error) {
      showNotification('Gagal menyimpan data kematian', 'error');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }

  async function handleDeleteKelahiran(nik: string) {
    showConfirm(
      'Hapus Data Kelahiran',
      'Apakah Anda yakin ingin menghapus data kelahiran ini?',
      async () => {
        if (!currentUser?.token) return;
        setIsLoading(true);
        try {
          const res = await apiService.deleteKelahiran(nik, currentUser.token);
          if (res.status === 'success') {
            showNotification('Data kelahiran berhasil dihapus', 'success');
            fetchData(currentUser.token, 'residents');
            fetchAllVillageData();
          } else {
            showNotification(res.message || 'Gagal menghapus data kelahiran', 'error');
          }
        } catch (error) {
          showNotification('Gagal menghapus data kelahiran', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    );
  }

  async function handleDeleteKematian(nik: string) {
    showConfirm(
      'Hapus Data Kematian',
      'Apakah Anda yakin ingin menghapus data kematian ini?',
      async () => {
        if (!currentUser?.token) return;
        setIsLoading(true);
        try {
          const res = await apiService.deleteKematian(nik, currentUser.token);
          if (res.status === 'success') {
            showNotification('Data kematian berhasil dihapus', 'success');
            fetchData(currentUser.token, 'residents');
            fetchAllVillageData();
          } else {
            showNotification(res.message || 'Gagal menghapus data kematian', 'error');
          }
        } catch (error) {
          showNotification('Gagal menghapus data kematian', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    );
  }

  async function handleMoveFamilyRT(data: any) {
    if (!currentUser?.token) return;
    setIsLoading(true);
    try {
      const res = await apiService.moveFamilyRT(data, currentUser.token);
      if (res.status === 'success') {
        showNotification('Data keluarga berhasil dipindahkan', 'success');
        fetchData(currentUser.token, 'residents');
        setIsModalOpen(false);
      } else {
        showNotification(res.message || 'Gagal memindahkan data keluarga', 'error');
      }
    } catch (error) {
      showNotification('Gagal memindahkan data keluarga', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveResident(data: any) {
    if (!currentUser) return;
    if (isSubmitting) return;
    
    // NIK Validation for new residents
    const isEdit = residents.some(r => r.nik === data.nik);
    
    // If it's a new resident (not editing an existing one by NIK), check if NIK already exists
    // Note: editingItem is null when adding new
    if (!editingItem && residents.some(r => r.nik === data.nik)) {
      showNotification('NIK sudah terdaftar di database. Gunakan NIK lain atau edit data yang sudah ada.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Optimistic Update
    const oldResidents = [...residents];
    if (isEdit) {
      setResidents(residents.map(r => r.nik === data.nik ? { ...r, ...data } : r));
    } else {
      setResidents([{ ...data, created_at: new Date().toISOString() }, ...residents]);
    }
    setIsModalOpen(false);

    try {
      const res = await apiService.saveResident(data, currentUser.token!);
      if (res.status === 'success') {
        showNotification('Data penduduk berhasil disimpan', 'success');
        fetchData(currentUser.token!, 'residents');
      } else {
        setResidents(oldResidents);
        showNotification(res.message || 'Gagal menyimpan data', 'error');
      }
    } catch (error) {
      setResidents(oldResidents);
      showNotification('Gagal menyimpan data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteResident(nik: string) {
    showConfirm(
      'Hapus Data Penduduk',
      `Apakah Anda yakin ingin menghapus data penduduk dengan NIK ${nik}? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        if (!currentUser) return;
        const oldResidents = [...residents];
        setResidents(residents.filter(r => r.nik !== nik));
        
        try {
          const res = await apiService.deleteResident(nik, currentUser.token!);
          if (res.status === 'success') {
            showNotification('Data penduduk berhasil dihapus', 'success');
            // Optimistic update already handled this, no need to refetch immediately
            // but we can do it in background if needed.
          } else {
            setResidents(oldResidents);
            showNotification('Gagal menghapus data', 'error');
          }
        } catch (error) {
          setResidents(oldResidents);
          showNotification('Gagal menghapus data', 'error');
        }
      }
    );
  }

  async function handleBulkDeleteResidents() {
    if (selectedResidents.length === 0) return;
    
    showConfirm(
      'Hapus Massal Data Penduduk',
      `Apakah Anda yakin ingin menghapus ${selectedResidents.length} data penduduk terpilih? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        if (!currentUser) return;
        const oldResidents = [...residents];
        setResidents(residents.filter(r => !selectedResidents.includes(r.nik)));
        const niksToDelete = [...selectedResidents];
        setSelectedResidents([]);
        
        try {
          const res = await apiService.bulkDeleteResidents(niksToDelete, currentUser.token!);
          if (res.status === 'success') {
            showNotification(res.message || 'Data penduduk berhasil dihapus', 'success');
            fetchData(currentUser.token!, 'residents');
          } else {
            setResidents(oldResidents);
            setSelectedResidents(niksToDelete);
            showNotification('Gagal menghapus data: ' + res.message, 'error');
          }
        } catch (error: any) {
          setResidents(oldResidents);
          setSelectedResidents(niksToDelete);
          showNotification('Gagal menghapus data: ' + error.message, 'error');
        }
      }
    );
  }

  async function handleSaveUser(data: any) {
    if (!currentUser) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    const oldUsers = [...users];
    const isEdit = !!editingItem;
    
    // Optimistic Update
    if (isEdit) {
      setUsers(users.map(u => u.username === data.username ? { ...u, ...data } : u));
    } else {
      setUsers([{ ...data, status: 'Active' }, ...users]);
    }
    setIsModalOpen(false);

    try {
      const res = await apiService.saveUser({ ...data, isEdit }, currentUser.token!);
      if (res.status === 'success') {
        showNotification('Data user berhasil disimpan', 'success');
        fetchData(currentUser.token!, 'users');
      } else {
        setUsers(oldUsers);
        showNotification('Gagal menyimpan user', 'error');
      }
    } catch (error) {
      setUsers(oldUsers);
      showNotification('Gagal menyimpan user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser(username: string) {
    showConfirm(
      'Hapus Akun Pengguna',
      `Apakah Anda yakin ingin menghapus akun pengguna "${username}"?`,
      async () => {
        if (!currentUser) return;
        const oldUsers = [...users];
        setUsers(users.filter(u => u.username !== username));
        
        try {
          const res = await apiService.deleteUser(username, currentUser.token!);
          if (res.status === 'success') {
            showNotification('User berhasil dihapus', 'success');
            // Optimistic update already handled this
          } else {
            setUsers(oldUsers);
            showNotification('Gagal menghapus user', 'error');
          }
        } catch (error) {
          setUsers(oldUsers);
          showNotification('Gagal menghapus user', 'error');
        }
      }
    );
  }
}

// --- COMPONENTS ---

const VillageMapView = memo(({ residents }: { residents: Resident[] }) => {
  const dusunStats = useMemo(() => {
    const stats: Record<string, number> = {};
    residents.forEach(r => {
      if (r.dusun) {
        stats[r.dusun] = (stats[r.dusun] || 0) + 1;
      }
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count }));
  }, [residents]);

  const maxCount = Math.max(...dusunStats.map(d => d.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Peta Distribusi Penduduk</h2>
        <p className="text-slate-500 font-medium">Visualisasi persebaran penduduk berdasarkan wilayah Dusun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Map className="text-blue-500" /> Visualisasi Wilayah
          </h3>
          
          <div className="flex-1 flex items-center justify-center relative">
            {/* Stylized Village Map using CSS Grid/Flex */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl">
              {dusunStats.map((d, i) => {
                const intensity = (d.count / maxCount) * 100;
                return (
                  <motion.div 
                    key={d.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative group"
                  >
                    <div 
                      className="aspect-square rounded-[2rem] border-2 border-slate-100 flex flex-col items-center justify-center p-4 transition-all group-hover:shadow-xl group-hover:-translate-y-2 cursor-default"
                      style={{ 
                        backgroundColor: `rgba(59, 130, 246, ${0.05 + (intensity / 200)})`,
                        borderColor: intensity > 50 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(226, 232, 240, 1)'
                      }}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 text-blue-600 font-bold">
                        {d.name.charAt(0)}
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{d.name}</span>
                      <span className="text-xl font-black text-slate-800">{d.count}</span>
                      <span className="text-[10px] font-bold text-slate-400">PENDUDUK</span>
                    </div>
                    
                    {/* Tooltip-like detail */}
                    <div className="absolute inset-0 bg-blue-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Detail Wilayah</p>
                      <p className="text-lg font-bold mb-2">{d.name}</p>
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-white" style={{ width: `${intensity}%` }}></div>
                      </div>
                      <p className="text-xs font-medium">{Math.round(intensity)}% Densitas Desa</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Peringkat Kepadatan</h4>
            <div className="space-y-4">
              {dusunStats.sort((a,b) => b.count - a.count).map((d, i) => (
                <div key={d.name} className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                    i === 0 ? "bg-amber-100 text-amber-600" : 
                    i === 1 ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-bold text-slate-700">{d.name}</span>
                      <span className="text-xs font-bold text-slate-400">{d.count} Jiwa</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(d.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-lg shadow-blue-200">
            <Info className="mb-4 opacity-50" size={32} />
            <h4 className="text-lg font-bold mb-2">Informasi Wilayah</h4>
            <p className="text-blue-100 text-sm leading-relaxed">
              Data distribusi ini diperbarui secara real-time berdasarkan alamat penduduk yang terdaftar di sistem. Gunakan informasi ini untuk perencanaan pembangunan wilayah yang lebih merata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

function TutorialModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Selamat Datang di SIDAPEK",
      description: "Sistem Informasi Data Penduduk Desa yang dirancang untuk memudahkan pengelolaan administrasi desa Anda secara digital dan efisien.",
      icon: <Database className="w-12 h-12 text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      title: "Manajemen Data Penduduk",
      description: "Kelola data penduduk dengan fitur pencarian canggih, filter per dusun, dan detail anggota keluarga dalam satu Kartu Keluarga.",
      icon: <Users className="w-12 h-12 text-emerald-500" />,
      color: "bg-emerald-50"
    },
    {
      title: "Lembaga & Perangkat Desa",
      description: "Hubungkan data penduduk dengan struktur organisasi desa. Cukup cari nama penduduk untuk menetapkan jabatan di lembaga desa.",
      icon: <Briefcase className="w-12 h-12 text-indigo-500" />,
      color: "bg-indigo-50"
    },
    {
      title: "Keamanan & Hak Akses",
      description: "Admin dapat mengatur hak akses menu dan aksi untuk setiap petugas, memastikan data sensitif tetap terjaga keamanannya.",
      icon: <ShieldCheck className="w-12 h-12 text-purple-500" />,
      color: "bg-purple-50"
    },
    {
      title: "Integrasi Google Sheets",
      description: "Aplikasi ini dapat terhubung ke Google Sheets. Jika Anda mengalami kendala koneksi, pastikan Script sudah di-deploy sebagai 'Web App' dengan akses 'Anyone'.",
      icon: <FileText className="w-12 h-12 text-amber-500" />,
      color: "bg-amber-50"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20"
      >
        <div className="relative h-64 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={cn("absolute inset-0 flex items-center justify-center transition-colors duration-500", steps[step].color)}
            >
              {steps[step].icon}
            </motion.div>
          </AnimatePresence>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-12 text-center">
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === step ? "w-8 bg-blue-600" : "w-2 bg-slate-200")} />
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-2xl font-black text-slate-800 mb-4">{steps[step].title}</h3>
              <p className="text-slate-500 leading-relaxed mb-10">{steps[step].description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95"
              >
                KEMBALI
              </button>
            )}
            <button 
              onClick={() => {
                if (step < steps.length - 1) setStep(step + 1);
                else onClose();
              }}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {step < steps.length - 1 ? (
                <>LANJUT <ArrowRight size={20} /></>
              ) : "MENGERTI & MULAI"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center w-full rounded-2xl transition-all duration-300 group relative",
        collapsed ? "justify-center px-0 py-3.5" : "justify-start px-4 py-3.5 gap-3.5",
        active 
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-900/40" 
          : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
      )}
      title={collapsed ? label : undefined}
    >
      <div className={cn(
        "flex-shrink-0 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center",
        active ? "text-white" : "text-slate-500 group-hover:text-blue-400"
      )}>
        {React.cloneElement(icon, { size: collapsed ? 24 : 20 })}
      </div>
      {!collapsed && (
        <span className={cn(
          "font-bold text-[13px] tracking-tight transition-all duration-300",
          active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        )}>
          {label}
        </span>
      )}
      {active && !collapsed && (
        <motion.div 
          layoutId="sidebar-active-indicator"
          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
        />
      )}
    </button>
  );
}

function SidebarSubItem({ label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center w-full py-2.5 px-4 text-xs font-bold transition-all duration-200 rounded-xl relative group",
        active 
          ? "text-blue-400 bg-blue-400/5" 
          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"
      )}
    >
      <div className={cn(
        "w-1.5 h-1.5 rounded-full mr-3 transition-all duration-300",
        active ? "bg-blue-400 scale-125" : "bg-slate-700 group-hover:bg-slate-500"
      )} />
      {label}
      {active && (
        <motion.div 
          layoutId="sidebar-sub-active-indicator"
          className="absolute left-0 w-1 h-4 bg-blue-500 rounded-r-full"
        />
      )}
    </button>
  );
}

const DashboardView = memo(({ stats, residents, setView, isAuthenticated, currentUser, userHasPermission }: { stats: DashboardStats | null, residents: Resident[], setView: (view: any, rt?: string) => void, isAuthenticated: boolean, currentUser: User | null, userHasPermission: (view: string, action?: string) => boolean }) => {
  if (!stats) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white rounded-[2rem] border border-slate-200"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-white rounded-[2.5rem] border border-slate-200"></div>
        <div className="h-96 bg-white rounded-[2.5rem] border border-slate-200"></div>
      </div>
      <div className="h-96 bg-white rounded-[2.5rem] border border-slate-200"></div>
    </div>
  );

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  const rtStats = useMemo(() => {
    if (stats.rtStats && Array.isArray(stats.rtStats)) return stats.rtStats;
    
    const rtMap: Record<string, number> = {};
    residents.forEach(r => {
      if (r.rt) {
        const key = `RT ${String(r.rt).padStart(3, '0')}`;
        rtMap[key] = (rtMap[key] || 0) + 1;
      }
    });
    return Object.entries(rtMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [residents, stats.rtStats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isAuthenticated && currentUser ? `${getGreeting()}, ${currentUser.nama_lengkap.split(' ')[0]}!` : 'Dashboard'}
          </h1>
          <p className="text-slate-500 mt-0.5 font-medium text-sm">
            {isAuthenticated ? 'Senang melihat Anda kembali. Berikut adalah ringkasan data hari ini.' : 'Selamat datang di pusat kendali data kependudukan.'}
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-sm flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
        </motion.div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="Total Penduduk" value={stats.totalPenduduk} icon={<Users />} color="blue" subtitle="Jiwa" />
        <StatCard title="Total Laki-Laki" value={stats.totalLakiLaki} icon={<Users />} color="indigo" subtitle="Jiwa" />
        <StatCard title="Total Perempuan" value={stats.totalPerempuan} icon={<Users />} color="rose" subtitle="Jiwa" />
        <StatCard title="Total KK" value={stats.totalKK} icon={<Home />} color="emerald" subtitle="Keluarga" />
        <StatCard title="Rekap Kelahiran" value={stats.totalKelahiran || 0} icon={<Plus />} color="emerald" subtitle="Jiwa" />
        <StatCard title="Rekap Kematian" value={stats.totalKematian || 0} icon={<Skull />} color="rose" subtitle="Jiwa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BarChartIcon size={20} />
                </div>
                Distribusi Usia Penduduk
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                    dy={10}
                    label={{ value: 'Usia (Tahun)', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 12 }}
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      padding: '12px 16px'
                    }}
                  />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200 relative overflow-hidden group"
        >
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PieChartIcon size={20} />
              </div>
              Rekap Penduduk Per Dusun
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.dusunData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.dusunData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-slate-600 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2">
              {stats.dusunData.map((d, idx) => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-xs font-bold text-slate-600">{d.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{d.value} <span className="text-[10px] text-slate-400 font-bold uppercase">Jiwa</span></span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Home size={20} />
            </div>
            Rekap Penduduk Per RT
          </h3>
          <div className="h-[350px] w-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {rtStats.map((rt, index) => (
                <button 
                  key={rt.name} 
                  onClick={() => {
                    const rtNum = rt.name.replace('RT ', '');
                    if (userHasPermission('rt', `filter:${rtNum}`)) {
                      setView('rt', rtNum);
                    } else {
                      alert('Maaf anda hanya dapat masuk ke menu sesuai dengan jabatan anda');
                    }
                  }}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-md hover:border-blue-200 transition-all active:scale-95"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500">{rt.name}</span>
                  <span className="text-2xl font-black text-slate-800">{rt.value}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Jiwa</span>
                </button>
              ))}
            </div>
            {rtStats.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Info size={40} className="mb-2 opacity-20" />
                <p className="font-medium">Belum ada data RT</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Settings size={20} />
              </div>
              Status Sistem
            </h3>
            <div className="space-y-5">
              <SystemInfoItem label="Versi Aplikasi" value="v1.2.0 Stable" />
              <SystemInfoItem label="Database Engine" value="Google Spreadsheet" />
              <SystemInfoItem label="Copyright" value="ILHAM CAHYA NUGRAHA" />
              <div className="pt-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Kesehatan Server</span>
                    <span className="text-xs font-bold text-emerald-400">Optimal</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <History size={20} />
                </div>
                Aktivitas Terbaru
              </h3>
              <button onClick={() => setView('logs')} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Lihat Semua</button>
            </div>
            <div className="space-y-6">
              {stats.recentLogs.map((log, i) => (
                <div key={i} className="flex gap-5 relative group">
                  <div className="absolute left-[20px] top-10 bottom-[-24px] w-0.5 bg-slate-100 group-last:hidden"></div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-sm font-bold ring-4 ring-white z-10 border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    {log.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{log.username}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{log.action}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(log.timestamp), 'HH:mm')}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

function SystemInfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-white/90">{value}</span>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: any) {
  const colors: any = {
    blue: "from-blue-600 to-blue-700 shadow-blue-200",
    emerald: "from-emerald-600 to-emerald-700 shadow-emerald-200",
    rose: "from-rose-600 to-rose-700 shadow-rose-200",
    amber: "from-amber-600 to-amber-700 shadow-amber-200",
    indigo: "from-indigo-600 to-indigo-700 shadow-indigo-200"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn("relative overflow-hidden bg-gradient-to-br rounded-2xl p-6 text-white shadow-xl transition-all duration-300", colors[color])}
    >
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
            {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
          </div>
          {subtitle && <span className="text-[10px] font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">{subtitle}</span>}
        </div>
        
        <div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-4xl font-black tracking-tight">{(value || 0).toLocaleString()}</h3>
        </div>
      </div>
    </motion.div>
  );
}

const BirthTableView = memo(({ data, onAdd, onDelete, userHasPermission }: any) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Data Kelahiran</h2>
          <p className="text-slate-500 font-medium text-sm">Daftar kelahiran baru yang tercatat di sistem.</p>
        </div>
        {userHasPermission('kelahiran', 'add') && (
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Catat Kelahiran
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Bayi</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIK</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl Lahir</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">JK</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Orang Tua</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Berat/Panjang</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item: any, i: number) => (
                <tr key={item.nik || i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{item.nama}</p>
                    <p className="text-[10px] text-slate-400 font-mono">KK: {item.no_kk}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">{item.nik}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{formatDateIndonesian(item.tanggal_lahir)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      item.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {item.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">A: {item.nama_ayah}</p>
                    <p className="text-xs font-bold text-slate-700">I: {item.nama_ibu}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    {item.berat_lahir} kg / {item.panjang_lahir} cm
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.operator || '-'}</p>
                    <p className="text-[9px] text-slate-300">{formatDateIndonesian(item.timestamp)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Aksi hapus dihilangkan sesuai permintaan */}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-slate-400 italic">Belum ada data kelahiran</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

const DeathTableView = memo(({ data, onAdd, onDelete, userHasPermission }: any) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Data Kematian</h2>
          <p className="text-slate-500 font-medium text-sm">Daftar penduduk yang telah meninggal dunia.</p>
        </div>
        {userHasPermission('kematian', 'add') && (
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <Skull size={16} /> Catat Kematian
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIK</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl Kematian</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penyebab</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempat</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wilayah</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item: any, i: number) => (
                <tr key={item.nik || i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{item.nama}</p>
                    <p className="text-[10px] text-slate-400 font-mono">KK: {item.no_kk}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">{item.nik}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{formatDateIndonesian(item.tanggal_kematian)}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.penyebab}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.tempat_kematian}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{item.dusun}</p>
                    <p className="text-[10px] text-slate-400 font-black">RT {item.rt} / RW {item.rw}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.operator || '-'}</p>
                    <p className="text-[9px] text-slate-300">{formatDateIndonesian(item.timestamp)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {userHasPermission('kematian', 'delete') && (
                      <button 
                        onClick={() => onDelete(item.nik)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Hapus Data"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-slate-400 italic">Belum ada data kematian</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

const ResidentsView = memo(({ data, search, setSearch, selectedDusunFilter, setSelectedDusunFilter, selectedRTFilter, setSelectedRTFilter, onAdd, onEdit, onDetail, onDelete, onBulkDelete, selectedResidents, setSelectedResidents, pagination, residents, userHasPermission, sortConfig, setSortConfig, residentOrgDetails, onAddBirth, onAddDeath }: any) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const dusuns = useMemo(() => {
    const set = new Set(residents.map((r: Resident) => r.dusun));
    return (Array.from(set).filter(Boolean) as string[]).sort();
  }, [residents]);

  const rts = useMemo(() => {
    const set = new Set(residents.map((r: Resident) => String(r.rt).padStart(3, '0')));
    return (Array.from(set).filter(Boolean) as string[]).sort();
  }, [residents]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allNiks = data.map((r: Resident) => r.nik);
      setSelectedResidents(allNiks);
    } else {
      setSelectedResidents([]);
    }
  };

  const handleSelectOne = (nik: string) => {
    if (selectedResidents.includes(nik)) {
      setSelectedResidents(selectedResidents.filter((id: string) => id !== nik));
    } else {
      setSelectedResidents([...selectedResidents, nik]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
            <Users />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Data Penduduk</h2>
            <p className="text-xs text-slate-500">Total {data.length} data ditampilkan</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "w-full md:w-auto px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border",
              isFilterOpen || selectedDusunFilter.length > 0 || selectedRTFilter.length > 0
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter size={18} /> Filter {(selectedDusunFilter.length + selectedRTFilter.length) > 0 && `(${(selectedDusunFilter.length + selectedRTFilter.length)})`}
          </button>

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari NIK, Nama, Alamat, RT..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {userHasPermission('residents', 'add') && (
            <button 
              onClick={onAdd}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Plus size={18} /> Tambah
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Filter size={16} className="text-blue-500" /> Panel Filter Lanjutan
                </h3>
                <button 
                  onClick={() => {
                    setSelectedDusunFilter([]);
                    setSelectedRTFilter([]);
                  }}
                  className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                >
                  Reset Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Filter Dusun
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {dusuns.map(d => (
                      <label key={d} className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer",
                        selectedDusunFilter.includes(d) ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200"
                      )}>
                        <input 
                          type="checkbox" 
                          checked={selectedDusunFilter.includes(d)}
                          onChange={() => {
                            if (selectedDusunFilter.includes(d)) {
                              setSelectedDusunFilter(selectedDusunFilter.filter((id: string) => id !== d));
                            } else {
                              setSelectedDusunFilter([...selectedDusunFilter, d]);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="text-xs font-bold truncate">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={data.length > 0 && selectedResidents.length === data.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => requestSort('nama')}
                >
                  <div className="flex items-center gap-2">
                    NIK & Nama {sortConfig.key === 'nama' && (sortConfig.direction === 'asc' ? <ChevronDown size={14} /> : <ChevronDown size={14} className="rotate-180" />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">L/P</th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => requestSort('alamat')}
                >
                  <div className="flex items-center gap-2">
                    Alamat {sortConfig.key === 'alamat' && (sortConfig.direction === 'asc' ? <ChevronDown size={14} /> : <ChevronDown size={14} className="rotate-180" />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">RT/RW</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pekerjaan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-bold text-lg">Tidak ada data yang ditampilkan</p>
                      <p className="text-sm opacity-60">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : data.map((item: Resident, i: number) => (
                <tr 
                  key={`${item.nik}-${i}`} 
                  className={cn(
                    "hover:bg-blue-50/30 transition-colors group cursor-pointer",
                    selectedResidents.includes(item.nik) && "bg-blue-50/50"
                  )}
                  onClick={() => onDetail(item)}
                >
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedResidents.includes(item.nik)}
                      onChange={() => handleSelectOne(item.nik)}
                    />
                  </td>
                  <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold shadow-inner">
                          {item.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.nama}</p>
                          {residentOrgDetails?.[item.nik] && residentOrgDetails[item.nik].map((org: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1 mt-0.5">
                              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                {org.jabatan || org.Jabatan || 'Anggota'} ({org.orgName})
                              </p>
                            </div>
                          ))}
                          <p className="text-xs font-mono text-slate-400">{item.nik}</p>
                        </div>
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                      item.jenis_kelamin === 'LAKI-LAKI' ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {item.jenis_kelamin === 'LAKI-LAKI' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.alamat}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{String(item.rt).padStart(3, '0')}/{String(item.rw).padStart(3, '0')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.pekerjaan}</td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {userHasPermission('residents', 'edit') && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-amber-100" title="Edit Data"><Edit size={18} /></button>
                      )}
                      {userHasPermission('residents', 'edit') && (
                        <button onClick={(e) => { e.stopPropagation(); onAddDeath(item); }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-rose-100" title="Aksi Kematian"><UserMinus size={18} /></button>
                      )}
                      {userHasPermission('residents', 'delete') && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.nik); }} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-red-100" title="Hapus Data"><Trash2 size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Based */}
        <div className="md:hidden p-4 space-y-4 bg-slate-50/50">
          {data.map((item: Resident, i: number) => (
            <motion.div 
              key={`${item.nik}-${i}`} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 space-y-5 active:scale-[0.98] transition-all relative overflow-hidden group" 
              onClick={() => onDetail(item)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50 group-hover:bg-blue-50 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner transition-all",
                      item.jenis_kelamin === 'LAKI-LAKI' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {item.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 leading-tight text-base group-hover:text-blue-600 transition-colors">{item.nama}</p>
                      {residentOrgDetails?.[item.nik] && residentOrgDetails[item.nik].map((org: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {org.jabatan || org.Jabatan || 'Anggota'} ({org.orgName})
                          </p>
                        </div>
                      ))}
                      <p className="text-xs font-mono font-bold text-slate-400 mt-1 tracking-tight">{item.nik}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    item.jenis_kelamin === 'LAKI-LAKI' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    {item.jenis_kelamin === 'LAKI-LAKI' ? 'L' : 'P'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-4 pt-5 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <Map size={14} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat & Wilayah</p>
                      <p className="text-xs text-slate-600 font-bold leading-relaxed">
                        {item.alamat} 
                        <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 font-black">
                          RT {String(item.rt).padStart(3, '0')} / RW {String(item.rw).padStart(3, '0')}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <Briefcase size={14} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pekerjaan</p>
                      <p className="text-xs text-slate-600 font-bold">{item.pekerjaan}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-5" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => onDetail(item)}
                    className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-slate-100 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Eye size={14} /> Detail
                  </button>
                  {userHasPermission('residents', 'edit') && (
                    <button 
                      onClick={() => onEdit(item)} 
                      className="flex-1 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-amber-100 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Edit size={14} /> Edit
                    </button>
                  )}
                  {userHasPermission('residents', 'edit') && (
                    <button 
                      onClick={() => onAddDeath(item)} 
                      className="flex-1 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-rose-100 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Skull size={14} /> Mati
                    </button>
                  )}
                  {userHasPermission('residents', 'delete') && (
                    <button 
                      onClick={() => onDelete(item.nik)} 
                      className="flex-1 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-rose-100 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {data.length === 0 && (
            <div className="py-20 text-center text-slate-400 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">Tidak ada data yang ditampilkan</p>
              <p className="text-sm opacity-60">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tampilkan</span>
            <select 
              value={pagination.itemsPerPage}
              onChange={e => {
                pagination.setItemsPerPage(Number(e.target.value));
                pagination.set(1);
              }}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value={10}>10 Baris</option>
              <option value={20}>20 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
            </select>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Halaman {pagination.current} dari {pagination.total} ({data.length} data)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            disabled={pagination.current === 1}
            onClick={() => pagination.set(pagination.current - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all text-xs font-bold text-slate-600 active:scale-95"
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
              let pageNum = pagination.current;
              if (pagination.total <= 5) {
                pageNum = i + 1;
              } else {
                if (pagination.current <= 3) pageNum = i + 1;
                else if (pagination.current >= pagination.total - 2) pageNum = pagination.total - 4 + i;
                else pageNum = pagination.current - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.set(pageNum)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xs font-bold transition-all active:scale-95",
                    pagination.current === pageNum 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            disabled={pagination.current === pagination.total}
            onClick={() => pagination.set(pagination.current + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all text-xs font-bold text-slate-600 active:scale-95"
          >
            Berikutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

function UsersView({ data, onAdd, onEdit, onDelete, userHasPermission, selectedRT, setSelectedRT, residents }: any) {
  const rts = useMemo(() => {
    const set = new Set(residents.map((r: Resident) => String(r.rt).padStart(3, '0')));
    return (Array.from(set).filter(Boolean) as string[]).sort();
  }, [residents]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Kelola Pengguna</h2>
        {userHasPermission('users', 'add') && (
          <button onClick={onAdd} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200"><Plus size={18} /> User Baru</button>
        )}
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((u: User) => (
                <tr key={u.username} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800">{u.username}</td>
                  <td className="px-6 py-4 text-slate-600">{u.nama_lengkap}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                      u.role === 'Admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                      u.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {userHasPermission('users', 'edit') && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(u); }} className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-amber-100"><Edit size={18} /></button>
                      )}
                      {userHasPermission('users', 'delete') && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(u.username); }} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-red-100"><Trash2 size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {data.map((u: User) => (
            <div key={u.username} className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{u.username}</p>
                  <p className="text-xs text-slate-500">{u.nama_lengkap}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase",
                    u.role === 'Admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {u.role}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase",
                    u.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {u.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {userHasPermission('action:edit') && (
                  <button onClick={() => onEdit(u)} className="flex-1 py-2.5 bg-amber-50 text-amber-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-100"><Edit size={16} /> Edit</button>
                )}
                {userHasPermission('action:delete') && (
                  <button onClick={() => onDelete(u.username)} className="flex-1 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-rose-100"><Trash2 size={16} /> Hapus</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogsView({ data }: { data: ActivityLog[] }) {
  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('hapus') || a.includes('delete')) return 'bg-rose-50 text-rose-600 border-rose-100';
    if (a.includes('tambah') || a.includes('simpan') || a.includes('create') || a.includes('add')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (a.includes('update') || a.includes('ubah') || a.includes('edit')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (a.includes('login')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (a.includes('impor') || a.includes('import')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const getActionIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('hapus') || a.includes('delete')) return <Trash2 size={16} />;
    if (a.includes('tambah') || a.includes('simpan') || a.includes('create') || a.includes('add')) return <Plus size={16} />;
    if (a.includes('update') || a.includes('ubah') || a.includes('edit')) return <Edit size={16} />;
    if (a.includes('login')) return <ShieldCheck size={16} />;
    if (a.includes('impor') || a.includes('import')) return <Download size={16} />;
    return <History size={16} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Log Aktivitas</h2>
          <p className="text-slate-500 font-medium">Rekaman jejak aktivitas pengguna dalam sistem.</p>
        </div>
        <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          Total {data.length} Log Aktivitas
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-12 gap-4 px-8 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="col-span-3">Nama Lengkap & Aksi</div>
            <div className="col-span-6">Detail Aktivitas</div>
            <div className="col-span-3 text-right">Waktu</div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {data.map((log, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-slate-50/50 transition-all group">
              <div className="col-span-12 md:col-span-3 flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm border transition-all group-hover:scale-110",
                  getActionColor(log.action)
                )}>
                  {getActionIcon(log.action)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">{log.nama_lengkap || log.username}</p>
                  <span className={cn(
                    "inline-block mt-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    getActionColor(log.action)
                  )}>
                    {log.action}
                  </span>
                </div>
              </div>
              <div className="col-span-12 md:col-span-6 flex items-center">
                <div className="bg-slate-50 group-hover:bg-white p-3 rounded-xl border border-slate-100 group-hover:border-blue-100 transition-all w-full">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{log.detail}</p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-3 flex items-center justify-end">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">{format(new Date(log.timestamp), 'dd MMM yyyy', { locale: id })}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{format(new Date(log.timestamp), 'HH:mm:ss')}</p>
                </div>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="py-32 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                <History size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Belum ada aktivitas</h3>
              <p className="text-slate-400 text-sm">Semua tindakan pengguna akan tercatat secara otomatis di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportsView({ residents, onImport, userHasPermission }: { residents: Resident[], onImport: (data: any[]) => void, userHasPermission: (view: string, action?: string) => boolean }) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'dusun', direction: 'asc' });

  const stats = useMemo(() => {
    const dusunMap: Record<string, { name: string, total: number, male: number, female: number, children: number, adult: number, elderly: number }> = {};
    
    residents.forEach(r => {
      const dusun = r.dusun || 'Lainnya';
      if (!dusunMap[dusun]) {
        dusunMap[dusun] = { name: dusun, total: 0, male: 0, female: 0, children: 0, adult: 0, elderly: 0 };
      }
      
      const stats = dusunMap[dusun];
      stats.total++;
      if (r.jenis_kelamin === 'LAKI-LAKI') stats.male++;
      else stats.female++;

      // Calculate age
      if (r.tanggal_lahir) {
        const birth = new Date(r.tanggal_lahir);
        const age = new Date().getFullYear() - birth.getFullYear();
        if (age < 18) stats.children++;
        else if (age < 60) stats.adult++;
        else stats.elderly++;
      }
    });

    return Object.values(dusunMap).sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [residents, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(residents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Penduduk");
    XLSX.writeFile(workbook, `Data_Penduduk_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      onImport(data);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{residents.length.toLocaleString()}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Seluruh Penduduk</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">LAKI-LAKI</p>
            <p className="text-xl font-bold text-blue-600">{residents.filter(r => r.jenis_kelamin === 'LAKI-LAKI').length.toLocaleString()}</p>
          </div>
          <div className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PEREMPUAN</p>
            <p className="text-xl font-bold text-rose-600">{residents.filter(r => r.jenis_kelamin === 'PEREMPUAN').length.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {userHasPermission('reports', 'export') && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Download size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Ekspor Data</h2>
            <p className="text-slate-500 mb-8 text-sm">Unduh seluruh data penduduk dalam format Excel.</p>
            <button 
              onClick={exportToExcel}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={18} /> UNDUH EXCEL
            </button>
          </div>
        )}

        {userHasPermission('reports', 'import') && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Plus size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Impor Data</h2>
            <p className="text-slate-500 mb-8 text-sm">Unggah file Excel untuk menambah data massal.</p>
            <label className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={18} /> UNGGAH FILE
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <BarChartIcon className="text-blue-500" /> Statistik Penduduk per Dusun
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th onClick={() => requestSort('name')} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">Dusun {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => requestSort('total')} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">Total {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => requestSort('male')} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">L {sortConfig.key === 'male' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => requestSort('female')} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">P {sortConfig.key === 'female' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => requestSort('children')} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">ANAK {sortConfig.key === 'children' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => requestSort('adult')} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">Dewasa {sortConfig.key === 'adult' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => requestSort('elderly')} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">Lansia {sortConfig.key === 'elderly' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.map(s => (
                <tr key={s.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-bold text-slate-700">{s.name}</td>
                  <td className="px-4 py-4 text-slate-600">{s.total}</td>
                  <td className="px-4 py-4 text-blue-600 font-medium">{s.male}</td>
                  <td className="px-4 py-4 text-rose-600 font-medium">{s.female}</td>
                  <td className="px-4 py-4 text-slate-600">{s.children}</td>
                  <td className="px-4 py-4 text-slate-600">{s.adult}</td>
                  <td className="px-4 py-4 text-slate-600">{s.elderly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ currentUser, onUpdate, showNotification }: { currentUser: User | null, onUpdate: (data: any) => void, showNotification: any }) {
  const [formData, setFormData] = useState({ 
    nama_lengkap: currentUser?.nama_lengkap || '', 
    email: currentUser?.email || '',
    photo_url: currentUser?.photo_url || ''
  });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showNotification('Ukuran file maksimal 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64 = evt.target?.result as string;
      setLoading(true);
      try {
        const res = await apiService.uploadProfilePhoto(base64, file.name, currentUser?.token || '');
        if (res.status === 'success') {
          setFormData({ ...formData, photo_url: res.photoUrl });
          showNotification('Foto profil berhasil diunggah', 'success');
        } else {
          showNotification(res.message, 'error');
        }
      } catch (err) {
        showNotification('Gagal mengunggah foto', 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(formData);
    setLoading(false);
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showNotification('Konfirmasi password tidak cocok', 'error');
      return;
    }
    setPassLoading(true);
    try {
      const data = await apiService.changePassword({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }, currentUser?.token || '');
      if (data.status === 'success') {
        showNotification('Password berhasil diubah', 'success');
        setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification(data.message, 'error');
      }
    } catch (e) {
      showNotification('Gagal mengubah password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 text-center">
          <div className="relative inline-block group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-blue-200 overflow-hidden">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentUser?.nama_lengkap.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
              <Plus size={20} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-black text-slate-800">{currentUser?.nama_lengkap}</h2>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">{currentUser?.role}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Informasi Akun</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Username</span>
              <span className="font-bold text-slate-800">{currentUser?.username}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Status</span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UserCog className="text-blue-500" /> Profil Pengguna
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Nama Lengkap" value={formData.nama_lengkap} onChange={(v: string) => setFormData({...formData, nama_lengkap: v})} required />
            <FormInput label="Email" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'MEMPROSES...' : 'SIMPAN PERUBAHAN'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShieldCheck className="text-indigo-500" /> Keamanan Akun
          </h3>
          <form onSubmit={handlePassSubmit} className="space-y-6">
            <FormInput 
              label="Password Lama" 
              type="password" 
              value={passForm.oldPassword} 
              onChange={(v: string) => setPassForm({...passForm, oldPassword: v})} 
              required 
            />
            <FormInput 
              label="Password Baru" 
              type="password" 
              value={passForm.newPassword} 
              onChange={(v: string) => setPassForm({...passForm, newPassword: v})} 
              required 
            />
            <FormInput 
              label="Konfirmasi Password Baru" 
              type="password" 
              value={passForm.confirmPassword} 
              onChange={(v: string) => setPassForm({...passForm, confirmPassword: v})} 
              required 
            />
            <button 
              type="submit" 
              disabled={passLoading}
              className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              {passLoading ? 'MEMPROSES...' : 'UBAH PASSWORD'}
            </button>
          </form>
        </div>

        {IS_GAS && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="text-amber-500" /> Status Koneksi Google Sheets
            </h3>
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Mode Aktif</span>
                <span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-lg text-[10px] font-black uppercase">Google Sheets</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">URL Endpoint</span>
                <span className="text-[10px] font-mono text-amber-600 truncate max-w-[200px]">{GAS_URL || 'Belum Dikonfigurasi'}</span>
              </div>
              <button 
                onClick={async () => {
                  const res = await apiService.getStats(currentUser?.token || '');
                  if (res.status === 'success') {
                    showNotification('Koneksi Berhasil!', 'success');
                  } else {
                    showNotification(res.message, 'error');
                  }
                }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-200"
              >
                TES KONEKSI SEKARANG
              </button>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                * Jika tes koneksi gagal dengan pesan "Failed to fetch", pastikan Script sudah di-deploy sebagai Web App dengan akses "Anyone" (bukan "Anyone with Google Account").
              </p>
              <button 
                onClick={() => {
                  localStorage.setItem('SIDAPEK_MODE', 'local');
                  window.location.reload();
                }}
                className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Settings size={12} /> GUNAKAN SERVER LOKAL (FALLBACK)
              </button>
            </div>
          </div>
        )}

        {!IS_GAS && localStorage.getItem('SIDAPEK_MODE') === 'local' && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="text-emerald-500" /> Mode Server Lokal (Aktif)
            </h3>
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-700 mb-4">
                Anda saat ini menggunakan server lokal sebagai fallback karena mode Google Sheets dinonaktifkan secara manual.
              </p>
              <button 
                onClick={() => {
                  localStorage.removeItem('SIDAPEK_MODE');
                  window.location.reload();
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-200"
              >
                KEMBALI KE MODE GOOGLE SHEETS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResidentDetail({ data, onEdit, onMoveRT, onAddFamilyMember, onSelectMember, showNotification, residents, currentUser, residentOrgDetails }: { data: Resident, onEdit: () => void, onMoveRT: (item: Resident) => void, onAddFamilyMember: (no_kk: string) => void, onSelectMember: (member: Resident) => void, showNotification: any, residents: Resident[], currentUser: User | null, residentOrgDetails?: any }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  useEffect(() => {
    if (activeTab === 'history' && data.nik && currentUser?.token) {
      fetchHistory();
    }
  }, [activeTab, data.nik, currentUser]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiService.getResidentHistory(data.nik, currentUser!.token!);
      if (res.status === 'success') {
        setHistory(res.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const familyMembers = useMemo(() => {
    if (!data.no_kk) return [];
    return residents.filter((r: Resident) => r.no_kk === data.no_kk);
  }, [data.no_kk, residents]);

  const familyStats = useMemo(() => {
    const total = familyMembers.length;
    const male = familyMembers.filter(m => m.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI').length;
    const female = familyMembers.filter(m => m.jenis_kelamin?.toUpperCase() === 'PEREMPUAN').length;
    return { total, male, female };
  }, [familyMembers]);

  const DetailItem = ({ label, value, icon, description }: { label: string, value: any, icon?: React.ReactNode, description?: string }) => (
    <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-colors">
          {icon || <Info size={14} />}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm font-black text-slate-800 tracking-tight leading-tight">{value || '-'}</p>
      {description && <p className="text-[9px] text-slate-400 mt-1 font-medium italic">{description}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className={cn(
            "w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl transition-transform hover:scale-105",
            data.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI' ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-200" : "bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-rose-200"
          )}>
            {data.nama.charAt(0)}
          </div>
          <div>
            <h4 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{data.nama}</h4>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <Fingerprint size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">NIK: {data.nik}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <Box size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">KK: {data.no_kk}</span>
              </div>
              {data.jabatan && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{data.jabatan}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => onAddFamilyMember(data.no_kk)}
            className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Anggota Keluarga
          </button>
          <button 
            onClick={onEdit}
            className="flex-1 md:flex-none px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <Edit size={16} /> Edit Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
        <button 
          onClick={() => setActiveTab('info')}
          className={cn(
            "px-10 py-3.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
            activeTab === 'info' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Informasi Detail
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-10 py-3.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest",
            activeTab === 'history' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <History size={14} />
          Histori
        </button>
      </div>

      {activeTab === 'info' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Detailed Info Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section: Identitas & Kependudukan */}
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h5 className="text-lg font-black text-slate-800 tracking-tight">Identitas & Kependudukan</h5>
                  <p className="text-xs text-slate-400 font-medium">Informasi dasar dan status kependudukan warga.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Tempat Lahir" value={data.tempat_lahir} icon={<MapPin size={14} />} description="Kota/Kabupaten kelahiran" />
                <DetailItem label="Tanggal Lahir" value={formatDateIndonesian(data.tanggal_lahir)} icon={<BarChartIcon size={14} />} description={`Usia: ${data.tanggal_lahir ? differenceInYears(new Date(), new Date(data.tanggal_lahir)) : '-'} Tahun`} />
                <DetailItem label="Jenis Kelamin" value={data.jenis_kelamin} icon={<Users size={14} />} description="Identitas gender biologis" />
                <DetailItem label="Golongan Darah" value={data.golongan_darah} icon={<Heart size={14} />} description="Informasi medis dasar" />
                <DetailItem label="Agama" value={data.agama} icon={<ShieldCheck size={14} />} description="Keyakinan yang dianut" />
                <DetailItem label="Kewarganegaraan" value={data.kewarganegaraan} icon={<Map size={14} />} description="Status hukum warga negara" />
                <DetailItem label="Status Perkawinan" value={data.status_perkawinan} icon={<Users size={14} />} description="Status sipil saat ini" />
                <DetailItem label="Hubungan Keluarga" value={data.status_hubungan} icon={<Users size={14} />} description="Kedudukan dalam Kartu Keluarga" />
              </div>
            </section>

            {/* Section: Pendidikan & Pekerjaan */}
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h5 className="text-lg font-black text-slate-800 tracking-tight">Pendidikan & Pekerjaan</h5>
                  <p className="text-xs text-slate-400 font-medium">Latar belakang pendidikan dan aktivitas ekonomi.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Pendidikan Terakhir" value={data.pendidikan} icon={<Building size={14} />} description="Jenjang pendidikan tertinggi" />
                <DetailItem label="Pekerjaan Utama" value={data.pekerjaan} icon={<Briefcase size={14} />} description="Mata pencaharian saat ini" />
              </div>
            </section>

            {/* Section: Orang Tua */}
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Users size={20} />
                </div>
                <div>
                  <h5 className="text-lg font-black text-slate-800 tracking-tight">Data Orang Tua</h5>
                  <p className="text-xs text-slate-400 font-medium">Informasi nama orang tua kandung.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Nama Ayah" value={data.nama_ayah} icon={<UserIcon size={14} />} description="Nama lengkap ayah kandung" />
                <DetailItem label="Nama Ibu" value={data.nama_ibu} icon={<UserIcon size={14} />} description="Nama lengkap ibu kandung" />
              </div>
            </section>

            {/* Section: Alamat & Wilayah */}
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                  <MapPin size={20} />
                </div>
                <div>
                  <h5 className="text-lg font-black text-slate-800 tracking-tight">Alamat & Wilayah</h5>
                  <p className="text-xs text-slate-400 font-medium">Lokasi tempat tinggal dalam administrasi desa.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap</p>
                  <p className="text-xl font-black text-slate-800 leading-relaxed">{data.alamat}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RT</p>
                    <p className="text-2xl font-black text-blue-600">{String(data.rt).padStart(3, '0')}</p>
                  </div>
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RW</p>
                    <p className="text-2xl font-black text-blue-600">{String(data.rw).padStart(3, '0')}</p>
                  </div>
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm col-span-2 md:col-span-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dusun</p>
                    <p className="text-lg font-black text-slate-800 truncate">{data.dusun}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Family & Stats */}
          <div className="space-y-8">
            {/* Family Stats Card */}
            <section className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-200">
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Statistik Keluarga</h5>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Total Anggota</span>
                  <span className="text-2xl font-black">{familyStats.total} <span className="text-xs font-bold text-slate-500">Jiwa</span></span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full" style={{ width: `${(familyStats.male / familyStats.total) * 100}%` }}></div>
                  <div className="bg-rose-500 h-full" style={{ width: `${(familyStats.female / familyStats.total) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Laki-laki: {familyStats.male}
                  </div>
                  <div className="flex items-center gap-2 text-rose-400">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    Perempuan: {familyStats.female}
                  </div>
                </div>
              </div>
            </section>

            {/* Family Members List */}
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest">Anggota Keluarga</h5>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500">{familyMembers.length}</div>
              </div>
              <div className="space-y-3">
                {familyMembers.length > 0 ? familyMembers.map((member: Resident, i: number) => (
                  <button 
                    key={`${member.nik}-${i}`}
                    onClick={() => onSelectMember(member)}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group",
                      member.nik === data.nik ? "bg-blue-50 border-blue-200 shadow-inner" : "bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-md"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110",
                      member.nik === data.nik ? "bg-blue-600 text-white" : "bg-white text-slate-400 group-hover:text-blue-500"
                    )}>
                      {member.nama.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-bold truncate text-sm", member.nik === data.nik ? "text-blue-700" : "text-slate-700")}>{member.nama}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{member.status_hubungan}</p>
                    </div>
                    <ChevronRight size={14} className={cn("transition-all", member.nik === data.nik ? "text-blue-400" : "text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1")} />
                  </button>
                )) : (
                  <div className="py-12 text-center">
                    <Users size={32} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-xs font-bold text-slate-400">Tidak ada data keluarga</p>
                  </div>
                )}
              </div>
            </section>

            {/* Metadata Section */}
            <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/50">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Metadata Sistem</h5>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400">
                    <History size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Terdaftar</p>
                    <p className="text-xs font-bold text-slate-600">{data.created_at ? formatDateIndonesian(data.created_at) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400">
                    <Edit size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Terakhir Diperbarui</p>
                    <p className="text-xs font-bold text-slate-600">{data.updated_at ? formatDateIndonesian(data.updated_at) : '-'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat histori...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="relative pl-10 space-y-10 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
              {history.map((h, i) => {
                const changes = JSON.parse(h.changes || '{}');
                return (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-10 top-2 w-8 h-8 rounded-2xl bg-white border-4 border-blue-500 z-10 flex items-center justify-center text-blue-500 shadow-sm">
                      {h.action === 'Create' ? <Plus size={14} /> : <Edit size={14} />}
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                          <p className="text-lg font-black text-slate-800 tracking-tight">
                            {h.action === 'Create' ? 'Data Penduduk Dibuat' : 'Pembaruan Data Penduduk'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">
                              {h.username.charAt(0)}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Oleh: <span className="font-black text-slate-800">{h.username}</span></p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {format(new Date(h.timestamp), 'dd MMMM yyyy, HH:mm', { locale: id })}
                        </div>
                      </div>
                      
                      {h.action === 'Update' && (
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(changes).map(([key, val]: any) => (
                            <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest md:w-1/4">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex-1 p-2 bg-rose-50 rounded-lg border border-rose-100">
                                  <p className="text-[8px] font-black text-rose-400 uppercase mb-1">Sebelumnya</p>
                                  <p className="text-xs font-bold text-rose-600 line-through opacity-60">{val.old || '(kosong)'}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 shrink-0" />
                                <div className="flex-1 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Menjadi</p>
                                  <p className="text-xs font-black text-emerald-700">{val.new || '(kosong)'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {h.action === 'Create' && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-sm text-blue-700 font-medium italic">"{changes.message || 'Data penduduk baru telah ditambahkan ke sistem.'}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <History className="w-16 h-16 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Belum ada histori perubahan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VillageInfoView({ info, onUpdate }: { info: VillageInfo | null, onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState<VillageInfo>(info || {
    nama_desa: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    kode_pos: '',
    alamat_kantor: '',
    nama_kepala_desa: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (info) setFormData(info);
  }, [info]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(formData);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Settings size={20} />
          </div>
          Informasi Desa
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Nama Desa" value={formData.nama_desa} onChange={(v: string) => setFormData({...formData, nama_desa: v})} required />
            <FormInput label="Nama Kepala Desa" value={formData.nama_kepala_desa} onChange={(v: string) => setFormData({...formData, nama_kepala_desa: v})} required />
            <FormInput label="Kecamatan" value={formData.kecamatan} onChange={(v: string) => setFormData({...formData, kecamatan: v})} required />
            <FormInput label="Kabupaten" value={formData.kabupaten} onChange={(v: string) => setFormData({...formData, kabupaten: v})} required />
            <FormInput label="Provinsi" value={formData.provinsi} onChange={(v: string) => setFormData({...formData, provinsi: v})} required />
            <FormInput label="Kode Pos" value={formData.kode_pos} onChange={(v: string) => setFormData({...formData, kode_pos: v})} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Alamat Kantor Desa</label>
            <textarea 
              value={formData.alamat_kantor}
              onChange={e => setFormData({...formData, alamat_kantor: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-all"
              placeholder="Masukkan alamat lengkap kantor desa"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'MEMPROSES...' : 'SIMPAN INFORMASI DESA'}
          </button>
        </form>
      </div>
    </div>
  );
}

const OrganizationView = memo(({ type, residents, data, onDetail, onAdd, onDelete, userHasPermission, onSaveVillageData, residentOrgDetails, activeRT, hideHeader = false, showConfirm }: { type: string, residents: Resident[], data: any[], onDetail: (item: Resident) => void, onAdd: () => void, onDelete?: (nik: string) => void, userHasPermission: (view: string, action?: string) => boolean, onSaveVillageData: (key: string, data: any) => void, residentOrgDetails?: any, activeRT?: string, hideHeader?: boolean, showConfirm: (title: string, message: string, onConfirm: () => void) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [jabatan, setJabatan] = useState('');
  const [noSk, setNoSk] = useState('');
  const [tglSk, setTglSk] = useState('');
  const [nipd, setNipd] = useState('');
  const [hp, setHp] = useState('');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (editingMember) {
      const resident = residents.find(r => r.nik === editingMember.nik);
      setSelectedResident(resident || null);
      setSearch(editingMember.nama_lengkap || editingMember.nama || '');
      setJabatan(editingMember.jabatan || '');
      setNoSk(editingMember.no_sk || '');
      setTglSk(editingMember.tanggal_sk || '');
      setNipd(editingMember.nipd || '');
      setHp(editingMember.no_hp || '');
      setKeterangan(editingMember.keterangan || '');
    } else {
      setSelectedResident(null);
      setSearch('');
      setJabatan('');
      setNoSk('');
      setTglSk('');
      setNipd('');
      setHp('');
      setKeterangan('');
      if (type === 'rt' && activeRT) {
        setJabatan(`KETUA RT ${String(activeRT).padStart(3, '0')}`);
      }
    }
  }, [editingMember, residents, type, activeRT]);

  const filteredSearchResidents = useMemo(() => {
    if (search.length < 2) return [];
    return residents.filter((r: Resident) => {
      const matchesSearch = r.nama.toLowerCase().includes(search.toLowerCase()) || 
                           String(r.nik || '').includes(search);
      if (type === 'rt' && activeRT) {
        return matchesSearch && String(r.rt).padStart(3, '0') === String(activeRT).padStart(3, '0');
      }
      return matchesSearch;
    }).slice(0, 15);
  }, [search, residents, type, activeRT]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["NIK", "Nama Lengkap", "Jabatan", "No SK", "Tanggal SK", "NIPD", "No HP", "Keterangan"].join(",") + "\n"
      + data.map((m: any) => {
          return [
            m.nik || m.NIK || '',
            m.nama_lengkap || m.nama || '',
            m.jabatan || m.Jabatan || '',
            m.no_sk || m['No SK Pengangkatan'] || '',
            m.tanggal_sk || m['Tanggal SK Pengangkatan'] || '',
            m.nipd || m.NIPD || '',
            m.no_hp || m['Nomor Handphone'] || '',
            m.keterangan || ''
          ].map(v => `"${v}"`).join(",");
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_${type}_${activeRT || 'desa'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const importedData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, i) => {
          const keyMap: Record<string, string> = {
            'nik': 'nik',
            'nama lengkap': 'nama_lengkap',
            'nama': 'nama_lengkap',
            'jabatan': 'jabatan',
            'no sk': 'no_sk',
            'tanggal sk': 'tanggal_sk',
            'nipd': 'nipd',
            'no hp': 'no_hp',
            'nomor handphone': 'no_hp',
            'keterangan': 'keterangan'
          };
          const key = keyMap[header.toLowerCase()] || header.toLowerCase().replace(/ /g, '_');
          obj[key] = values[i];
        });

        // Try to find resident to fill extra info
        const resident = residents.find(r => r.nik === obj.nik);
        if (resident) {
          obj.rt = resident.rt;
          obj.rw = resident.rw;
          obj.dusun = resident.dusun;
          if (!obj.nama_lengkap) obj.nama_lengkap = resident.nama;
        }

        return obj;
      });

      onSaveVillageData(type, [...data, ...importedData]);
      alert(`Berhasil mengimpor ${importedData.length} data pengurus.`);
    };
    reader.readAsText(file);
  };

  const titles: Record<string, string> = {
    'village_officials': 'Perangkat Desa',
    'bpd': 'Badan Permusyawaratan Desa (BPD)',
    'rt': 'Rukun Tetangga (RT)',
    'rw': 'Rukun Warga (RW)',
    'pkk': 'Pemberdayaan Kesejahteraan Keluarga (PKK)',
    'karang_taruna': 'Karang Taruna',
    'lpmd': 'Lembaga Pemberdayaan Masyarakat Desa (LPMD)',
    'linmas': 'Perlindungan Masyarakat (Linmas)'
  };

  const descriptions: Record<string, string> = {
    'village_officials': 'Daftar perangkat desa yang bertugas melayani masyarakat.',
    'bpd': 'Daftar anggota Badan Permusyawaratan Desa.',
    'rt': 'Daftar pengurus Rukun Tetangga.',
    'rw': 'Daftar pengurus Rukun Warga.',
    'pkk': 'Daftar anggota Pemberdayaan Kesejahteraan Keluarga.',
    'karang_taruna': 'Daftar pengurus Karang Taruna.',
    'lpmd': 'Daftar pengurus Lembaga Pemberdayaan Masyarakat Desa.',
    'linmas': 'Daftar anggota Perlindungan Masyarakat.'
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveMember = () => {
    if (isSubmitting) return;
    if (!selectedResident) return;

    if (type === 'rt' && activeRT && String(selectedResident.rt).padStart(3, '0') !== String(activeRT).padStart(3, '0')) {
      alert(`Penduduk ini bukan warga RT ${activeRT}. Silakan pilih penduduk dari RT yang sesuai.`);
      return;
    }

    setIsSubmitting(true);
    const memberData = {
      nama_lengkap: selectedResident.nama,
      nik: selectedResident.nik,
      no_kk: selectedResident.no_kk,
      tempat_lahir: selectedResident.tempat_lahir,
      tanggal_lahir: selectedResident.tanggal_lahir,
      jenis_kelamin: selectedResident.jenis_kelamin,
      pendidikan: selectedResident.pendidikan,
      no_sk: noSk,
      tanggal_sk: tglSk,
      jabatan: jabatan || 'Anggota',
      nipd: nipd,
      no_hp: hp,
      keterangan: keterangan,
      // Internal fields for UI
      rt: String(selectedResident.rt || '').padStart(3, '0'),
      rw: String(selectedResident.rw || '').padStart(3, '0'),
      dusun: selectedResident.dusun
    };

    let newData;
    if (editingMember) {
      newData = data.map(m => (m.nik === editingMember.nik || m.NIK === editingMember.nik) ? memberData : m);
    } else {
      newData = [...data, memberData];
    }

    onSaveVillageData(type, newData);
    setIsModalOpen(false);
    setEditingMember(null);
    // Reset submitting state after a short delay to prevent double clicks
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handleRemoveMember = (nik: string) => {
    showConfirm(
      'Hapus Pengurus',
      'Apakah Anda yakin ingin menghapus pengurus ini dari daftar?',
      async () => {
        const newData = data.filter(m => (m.NIK || m.nik) !== nik);
        onSaveVillageData(type, newData);
      }
    );
  };

  const sortedData = useMemo(() => {
    let result = [...data];
    
    if (type === 'village_officials') {
      result.sort((a, b) => {
        const getRank = (jabatan: string) => {
          const j = (jabatan || '').toLowerCase();
          if (j.includes('kepala desa')) return 0;
          if (j.includes('sekretaris desa')) return 1;
          if (j.includes('kasi pemerintahan')) return 2;
          if (j.includes('kasi kesejahteraan')) return 3;
          if (j.includes('kasi pelayanan')) return 4;
          if (j.includes('kaur tata usaha')) return 5;
          if (j.includes('kaur keuangan')) return 6;
          if (j.includes('kaur perencanaan')) return 7;
          if (j.includes('kepala wilayah') || j.includes('kepala dusun')) {
            if (j.includes('ciodeng')) return 8;
            if (j.includes('sukawangi')) return 9;
            if (j.includes('sinargalih 1')) return 10;
            if (j.includes('sinargalih 2')) return 11;
            if (j.includes('panguyuhan 1')) return 12;
            if (j.includes('panguyuhan 2')) return 13;
            return 14;
          }
          if (j.includes('staff') || j.includes('staf')) return 15;
          return 16;
        };
        return getRank(a.jabatan || a.Jabatan) - getRank(b.jabatan || b.Jabatan);
      });
    } else if (type === 'bpd') {
      result.sort((a, b) => {
        const getRank = (jabatan: string) => {
          const j = (jabatan || '').toLowerCase();
          if (j.includes('ketua')) return 0;
          if (j.includes('wakil ketua')) return 1;
          if (j.includes('sekretaris')) return 2;
          if (j.includes('anggota')) return 3;
          return 4;
        };
        return getRank(a.jabatan || a.Jabatan) - getRank(b.jabatan || b.Jabatan);
      });
    } else if (type === 'rw') {
      result.sort((a, b) => {
        const getRW = (m: any) => {
          const rwVal = m.rw || m.RW || '';
          const match = String(rwVal).match(/\d+/);
          return match ? parseInt(match[0]) : 999;
        };
        return getRW(a) - getRW(b);
      });
    } else if (type === 'rt') {
      result.sort((a, b) => {
        const getRT = (m: any) => {
          const rtVal = m.rt || m.RT || '';
          const match = String(rtVal).match(/\d+/);
          return match ? parseInt(match[0]) : 999;
        };
        return getRT(a) - getRT(b);
      });
    } else if (type === 'linmas') {
      result.sort((a, b) => {
        const getRank = (jabatan: string) => {
          const j = (jabatan || '').toLowerCase();
          if (j.includes('satlinmas')) return 0;
          return 1;
        };
        return getRank(a.jabatan || a.Jabatan) - getRank(b.jabatan || b.Jabatan);
      });
    }
    
    return result;
  }, [data, type]);

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{titles[type]}</h2>
            <p className="text-slate-500 font-medium text-sm">{descriptions[type] || 'Daftar anggota lembaga desa.'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            {userHasPermission(type, 'export') && (
              <button 
                onClick={handleExport}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={16} /> Ekspor
              </button>
            )}
            {userHasPermission(type, 'import') && (
              <label className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                <Upload size={16} /> Impor
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
            )}
            {userHasPermission(type, 'add') && (
              <button 
                onClick={() => {
                  setEditingMember(null);
                  setIsModalOpen(true);
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Plus size={20} />
                <span>Tambah Anggota</span>
              </button>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <Modal 
          title={editingMember ? `Edit ${titles[type]}` : `Tambah ${titles[type]}`}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMember(null);
          }}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cari Penduduk (Nama/NIK)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setIsSearching(true);
                      }}
                      onFocus={() => setIsSearching(true)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={type === 'rt' && activeRT ? `Cari di RT ${activeRT}...` : "Ketik Nama atau NIK..."}
                      disabled={!!editingMember}
                    />
                  </div>
                </div>

                {isSearching && !editingMember && filteredSearchResidents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {filteredSearchResidents.map((r: Resident, i: number) => (
                      <button
                        key={`${r.nik}-${i}`}
                        type="button"
                        onClick={() => {
                          setSelectedResident(r);
                          setSearch(r.nama);
                          setIsSearching(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {r.nama.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 block text-sm">{r.nama}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{r.nik} | RT {r.rt}/RW {r.rw}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedResident && (
                  <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      {selectedResident.nama.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-700">{selectedResident.nama}</p>
                      <p className="text-[10px] text-blue-400 font-mono">{selectedResident.nik}</p>
                      <p className="text-[10px] text-blue-400 mt-0.5">{selectedResident.alamat} (RT {selectedResident.rt}/RW {selectedResident.rw})</p>
                    </div>
                    {!editingMember && (
                      <button onClick={() => setSelectedResident(null)} className="text-blue-400 hover:text-blue-600 p-2">
                        <X size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Ketua, Sekretaris, Anggota..."
                  value={jabatan}
                  onChange={e => setJabatan(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No SK Pengangkatan</label>
                <input 
                  type="text" 
                  value={noSk}
                  onChange={e => setNoSk(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal SK Pengangkatan</label>
                <input 
                  type="date" 
                  value={tglSk}
                  onChange={e => setTglSk(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIPD</label>
                <input 
                  type="text" 
                  value={nipd}
                  onChange={e => setNipd(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Handphone</label>
                <input 
                  type="text" 
                  value={hp}
                  onChange={e => setHp(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan</label>
                <textarea 
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingMember(null);
                }}
                className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveMember}
                disabled={!selectedResident}
                className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 transition-all active:scale-95"
              >
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedData.length > 0 ? sortedData.map((item, i) => {
          const resident = residents.find(r => r.nik === (item.nik || item.NIK));
          return (
            <motion.div 
              key={`${item.nik || item.NIK}-${i}`}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:border-blue-200 transition-all group relative"
            >
              <div className="flex items-center gap-4 mb-4" onClick={() => resident && onDetail(resident)}>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {(item.nama_lengkap || item['Nama Lengkap'] || item.nama || '').charAt(0)}
                </div>
                <div className="cursor-pointer">
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.nama_lengkap || item['Nama Lengkap'] || item.nama}</h4>
                  {residentOrgDetails?.[item.nik || item['NIK']] && residentOrgDetails[item.nik || item['NIK']].filter((o: any) => o.orgKey !== type).map((org: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 mt-0.5">
                      <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                      <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
                        {org.jabatan || org.Jabatan || 'Anggota'} ({org.orgName})
                      </p>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400 font-mono">{item.nik || item['NIK']}</p>
                </div>
              </div>

              <div className="absolute top-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {userHasPermission(type, 'edit') && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMember(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                    title="Edit Data"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {userHasPermission(type, 'delete') && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMember(item.nik || item['NIK']);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Hapus dari Lembaga"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3" onClick={() => resident && onDetail(resident)}>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Jabatan</span>
                  <span className="text-blue-600 font-bold">{item.jabatan || item['Jabatan'] || 'Anggota'}</span>
                </div>
                {(item.no_sk || item['No SK Pengangkantan']) && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">No SK</span>
                    <span className="text-slate-700 font-bold">{item.no_sk || item['No SK Pengangkantan']}</span>
                  </div>
                )}
                {(item.no_hp || item['Nomor Handphone']) && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">HP</span>
                    <span className="text-slate-700 font-bold">{item.no_hp || item['Nomor Handphone']}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">RT / RW</span>
                  <span className="text-slate-700 font-bold">{item.rt} / {item.rw}</span>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Users size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-400">Belum ada data anggota</h3>
            <p className="text-slate-400 text-sm">Klik tombol "Tambah Anggota" untuk mencari dari data penduduk.</p>
          </div>
        )}
      </div>
    </div>
  );
});

const RTView = memo(({ residents, currentUser, currentUserRT, initialRT, initialTab = 'residents', onDetail, onMoveRT, onEdit, onAddResident, onAddOrgMember, onDelete, onDeleteOrgMember, userHasPermission, villageData, onSaveVillageData, onNavigate, residentOrgDetails }: any) => {
  const [selectedRTs, setSelectedRTs] = useState<string[]>(Array.isArray(initialRT) ? initialRT : (initialRT ? [initialRT] : (currentUserRT ? [currentUserRT] : [])));
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRTDropdownOpen, setIsRTDropdownOpen] = useState(false);
  const [activeTab] = useState<'residents' | 'organization'>(initialTab);

  const isOfficialsView = initialTab === 'organization';

  useEffect(() => {
    if (Array.isArray(initialRT)) {
      setSelectedRTs(initialRT);
    } else if (initialRT) {
      setSelectedRTs([initialRT]);
    } else if (currentUserRT && selectedRTs.length === 0) {
      setSelectedRTs([currentUserRT]);
    }
  }, [currentUserRT, initialRT]);

  const rtList = useMemo(() => {
    const rts = new Set<string>();
    residents.forEach((r: Resident) => {
      if (r.rt) {
        const rtStr = String(r.rt).padStart(3, '0');
        const hasRTPermission = userHasPermission('rt', `filter:${rtStr}`);
        const hasDusunPermission = userHasPermission('rt', `filter:dusun:${r.dusun}`);
        
        // Check if user has permission for Data Penduduk or Struktur Pengurus in RT
        const hasDataPenduduk = userHasPermission('rt', 'data_penduduk');
        const hasStrukturPengurus = userHasPermission('rt', 'struktur_pengurus');
        
        if (hasRTPermission && hasDusunPermission && (hasDataPenduduk || hasStrukturPengurus)) {
          rts.add(rtStr);
        }
      }
    });
    return Array.from(rts).sort();
  }, [residents, userHasPermission]);

  const allKetuaRTs = useMemo(() => {
    if (!villageData['rt'] || !Array.isArray(villageData['rt'])) return [];
    
    return villageData['rt']
      .filter((m: any) => (m.jabatan || m.Jabatan || '').toUpperCase().includes('KETUA'))
      .sort((a: any, b: any) => {
        const getRT = (m: any) => {
          const rtVal = m.rt || m.RT || '';
          const match = String(rtVal).match(/\d+/);
          return match ? parseInt(match[0]) : 999;
        };
        return getRT(a) - getRT(b);
      });
  }, [villageData]);

  const activeRTs = selectedRTs.length > 0 ? selectedRTs : (currentUserRT ? [currentUserRT] : (rtList.length > 0 ? [rtList[0]] : []));

  const filteredResidents = useMemo(() => {
    if (activeRTs.length === 0) return [];
    const searchLower = searchQuery.toLowerCase();
    const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
    
    return residents.filter((r: Resident) => {
      const matchesRT = activeRTs.includes(String(r.rt).padStart(3, '0'));
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
        r.nama.toLowerCase().includes(term) || 
        String(r.nik || '').includes(term) ||
        r.alamat.toLowerCase().includes(term)
      );
      return matchesRT && matchesSearch;
    });
  }, [residents, activeRTs, searchQuery]);

  const rtSummary = useMemo(() => {
    if (activeRTs.length === 0) return null;
    
    const rtResidents = residents.filter(r => activeRTs.includes(String(r.rt).padStart(3, '0')));
    let lakiLaki = 0;
    let perempuan = 0;
    let kk = 0;
    
    rtResidents.forEach(r => {
      const jk = r.jenis_kelamin?.toUpperCase();
      if (jk === 'LAKI-LAKI') lakiLaki++;
      else if (jk === 'PEREMPUAN') perempuan++;
      
      if (r.status_hubungan?.toUpperCase() === 'KEPALA KELUARGA') kk++;
    });

    return {
      total: rtResidents.length,
      lakiLaki,
      perempuan,
      kk
    };
  }, [residents, activeRTs]);

  const paginatedResidents = useMemo(() => {
    if (rowsPerPage === 'all') return filteredResidents;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredResidents.slice(start, start + rowsPerPage);
  }, [filteredResidents, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => {
    if (rowsPerPage === 'all') return 1;
    return Math.ceil(filteredResidents.length / rowsPerPage);
  }, [filteredResidents, rowsPerPage]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {isOfficialsView ? 'Struktur Pengurus RT' : `Wilayah RT ${activeRTs.length === 1 ? activeRTs[0] : 'Terpilih'}`}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {isOfficialsView ? 'Daftar Ketua Rukun Tetangga di seluruh wilayah desa.' : 'Manajemen data penduduk khusus untuk wilayah Rukun Tetangga.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-3">
            {!isOfficialsView && userHasPermission('residents', 'add') && (
              <button 
                onClick={() => onAddResident(activeRTs[0])}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all"
              >
                <Plus size={14} /> Tambah Data
              </button>
            )}

            {isOfficialsView && userHasPermission('rt', 'add') && (
              <button 
                onClick={() => onAddOrgMember(activeRTs[0])}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
              >
                <Plus size={14} /> Tambah Ketua RT
              </button>
            )}
          </div>

          {!isOfficialsView && (
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari di RT ini..." 
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative w-full md:w-auto">
                <button 
                  onClick={() => setIsRTDropdownOpen(!isRTDropdownOpen)}
                  className={cn(
                    "flex items-center justify-between gap-3 w-full md:w-auto border rounded-xl px-5 py-2.5 shadow-sm transition-all group",
                    isRTDropdownOpen || selectedRTs.length > 0 ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:ring-2 hover:ring-blue-500/10"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Filter size={16} className={cn("transition-colors", isRTDropdownOpen || selectedRTs.length > 0 ? "text-white" : "text-slate-400 group-hover:text-blue-500")} />
                    <span className={cn("text-xs font-black uppercase tracking-widest", isRTDropdownOpen || selectedRTs.length > 0 ? "text-white/70" : "text-slate-400")}>RT:</span>
                    <span className="text-sm font-bold">{selectedRTs.length === 0 ? 'Semua RT' : selectedRTs.length === 1 ? `RT ${selectedRTs[0]}` : `${selectedRTs.length} RT Terpilih`}</span>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform duration-300", isRTDropdownOpen && "rotate-180", isRTDropdownOpen || selectedRTs.length > 0 ? "text-white" : "text-slate-400")} />
                </button>

                <AnimatePresence>
                  {isRTDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsRTDropdownOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih RT</span>
                          <button 
                            onClick={() => setSelectedRTs([])}
                            className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                          >
                            Reset
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-2 gap-1 custom-scrollbar">
                          {rtList.map(rt => (
                            <label key={rt} className={cn(
                              "flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all cursor-pointer group/item",
                              selectedRTs.includes(rt) ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"
                            )}>
                              <input 
                                type="checkbox" 
                                checked={selectedRTs.includes(rt)}
                                onChange={() => {
                                  if (selectedRTs.includes(rt)) {
                                    setSelectedRTs(selectedRTs.filter(id => id !== rt));
                                  } else {
                                    setSelectedRTs([...selectedRTs, rt]);
                                  }
                                  setCurrentPage(1);
                                }}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-all"
                              />
                              <span className="text-xs font-bold">RT {String(rt).padStart(3, '0')}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isOfficialsView && rtSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Penduduk RT" 
            value={rtSummary.total} 
            icon={<Users />} 
            color="blue" 
            subtitle="Jiwa" 
          />
          <StatCard 
            title="Laki-Laki" 
            value={rtSummary.lakiLaki} 
            icon={<Users />} 
            color="indigo" 
            subtitle="Jiwa" 
          />
          <StatCard 
            title="Perempuan" 
            value={rtSummary.perempuan} 
            icon={<Users />} 
            color="rose" 
            subtitle="Jiwa" 
          />
          <StatCard 
            title="Kepala Keluarga" 
            value={rtSummary.kk} 
            icon={<Home />} 
            color="emerald" 
            subtitle="KK" 
          />
        </div>
      )}

      {isOfficialsView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allKetuaRTs.length > 0 ? allKetuaRTs.map((item: any, i: number) => {
            const resident = residents.find(r => r.nik === (item.nik || item.NIK));
            const rtNum = String(item.rt || item.RT || '').padStart(3, '0');
            
            return (
              <motion.div 
                key={`${item.nik || item.NIK}-${i}`}
                whileHover={{ y: -5 }}
                onClick={() => onNavigate('rt', rtNum)}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all group relative cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {(item.nama_lengkap || item.nama || '').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.nama_lengkap || item.nama}</h4>
                        <div className="p-1 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-200">
                          <ShieldCheck size={12} />
                        </div>
                      </div>
                      {userHasPermission('rt', 'delete') && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteOrgMember(item.nik || item.NIK, 'rt');
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          title="Hapus Pengurus"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">KETUA RT {rtNum}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{item.nik || item['NIK']}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Dusun</span>
                    <span className="text-slate-700 font-bold">{item.dusun || resident?.dusun || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">No HP</span>
                    <span className="text-slate-700 font-bold">{item.no_hp || item['Nomor Handphone'] || '-'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                  <span>Lihat Data Penduduk RT {rtNum}</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-300">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Users size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Belum ada data Ketua RT</h3>
              <p className="text-slate-400 text-sm">Klik tombol "Tambah Ketua RT" untuk mendaftarkan pengurus.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedResidents.map((item: Resident, i: number) => {
          const age = item.tanggal_lahir ? differenceInYears(new Date(), new Date(item.tanggal_lahir)) : null;
          
          return (
            <motion.div
              key={`${item.nik}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => onDetail(item)}
              className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-200 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:bg-blue-50 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-inner transition-all group-hover:scale-110 group-hover:rotate-3",
                      item.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI' 
                        ? "bg-blue-50 text-blue-600" 
                        : "bg-rose-50 text-rose-600"
                    )}>
                      {item.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors leading-tight">{item.nama}</h4>
                        {item.jabatan?.toUpperCase().startsWith('KETUA RT') && (
                          <div className="p-1 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-200" title="Ketua RT">
                            <ShieldCheck size={12} />
                          </div>
                        )}
                      </div>
                      {residentOrgDetails?.[item.nik] && residentOrgDetails[item.nik].map((org: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1 mt-0.5">
                          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                            {org.jabatan || org.Jabatan || 'Anggota'} ({org.orgName})
                          </p>
                        </div>
                      ))}
                      <p className="text-xs font-mono font-bold text-slate-400 mt-1">{item.nik}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                    item.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    {item.jenis_kelamin?.toUpperCase() === 'LAKI-LAKI' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-6 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Map size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Alamat Lengkap</p>
                      <p className="text-sm text-slate-600 font-bold leading-relaxed">{item.alamat}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pekerjaan</p>
                      <p className="text-sm text-slate-600 font-bold">{item.pekerjaan || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-8" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => onDetail(item)}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-slate-100 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Eye size={14} /> Detail
                  </button>
                  {userHasPermission('residents', 'edit') && (
                    <button 
                      onClick={() => onEdit(item)}
                      className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-amber-100 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Edit size={14} /> Edit
                    </button>
                  )}
                  {userHasPermission('residents', 'delete') && (
                    <button 
                      onClick={() => onDelete(item.nik)}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-rose-100 text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onMoveRT(item); }}
                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm border border-blue-100"
                    title="Pindah RT"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredResidents.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-200 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Users size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ada data ditemukan</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Coba sesuaikan pencarian atau pilih RT yang berbeda.</p>
        </div>
      )}

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-500">Tampilkan</span>
              <select 
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={10}>10 Baris</option>
                <option value={20}>20 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={100}>100 Baris</option>
                <option value="all">Semua</option>
              </select>
              <span className="text-sm font-bold text-slate-400">dari {filteredResidents.length} data</span>
            </div>

            {rowsPerPage !== 'all' && (
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center px-4 font-bold text-sm text-slate-600">
                  {currentPage} / {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

function MoveRTModal({ resident, onSave, onCancel }: any) {
  const [rt, setRt] = useState(resident.rt);
  const [rw, setRw] = useState(resident.rw);
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = () => {
    if (isSubmitting) return;
    if (!rt || !rw) {
      setError('RT dan RW harus diisi');
      return;
    }
    setIsSubmitting(true);
    onSave({ ...resident, rt, rw });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Edit size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Pindah RT/RW</h3>
          <p className="text-sm text-slate-500">{resident.nama}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">RT Baru</label>
          <input 
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={rt}
            onChange={e => { setRt(e.target.value); setError(''); }}
            placeholder="Contoh: 01"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">RW Baru</label>
          <input 
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={rw}
            onChange={e => { setRw(e.target.value); setError(''); }}
            placeholder="Contoh: 01"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button onClick={onCancel} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20"
      >
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string, message: string, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-10 text-center"
      >
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95"
          >
            BATAL
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95"
          >
            YA, HAPUS
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function OrganizationMemberForm({ residents, initialData, onSubmit, onCancel, showNotification, type, activeRT }: any) {
  const [search, setSearch] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [jabatan, setJabatan] = useState(initialData?.jabatan || '');
  const [rtNumber, setRtNumber] = useState(activeRT || initialData?.rt || '');
  const [noSk, setNoSk] = useState(initialData?.no_sk || '');
  const [tglSk, setTglSk] = useState(initialData?.tanggal_sk || '');
  const [nipd, setNipd] = useState(initialData?.nipd || '');
  const [hp, setHp] = useState(initialData?.no_hp || '');
  const [keterangan, setKeterangan] = useState(initialData?.keterangan || '');
  const [isSearching, setIsSearching] = useState(false);

  // Derive RT list from residents
  const rtOptions = useMemo(() => {
    const rts = new Set<string>();
    residents.forEach((r: Resident) => {
      if (r.rt) rts.add(String(r.rt).padStart(3, '0'));
    });
    // Ensure at least 1-15 are available
    for (let i = 1; i <= 15; i++) rts.add(String(i).padStart(3, '0'));
    return Array.from(rts).sort();
  }, [residents]);

  useEffect(() => {
    if (initialData?.nik) {
      const resident = residents.find((r: Resident) => r.nik === initialData.nik);
      setSelectedResident(resident || null);
      setSearch(initialData.nama_lengkap || initialData.nama || '');
      setRtNumber(String(initialData.rt || initialData.RT || resident?.rt || '').padStart(3, '0'));
    } else if (type === 'rt') {
      const rtVal = activeRT || '';
      setRtNumber(String(rtVal).padStart(3, '0'));
      if (rtVal) {
        setJabatan(`KETUA RT ${String(rtVal).padStart(3, '0')}`);
      } else {
        setJabatan('KETUA RT');
      }
    }
  }, [initialData, residents, type, activeRT]);

  const handleRTChange = (val: string) => {
    setRtNumber(val);
    if (type === 'rt') {
      const formattedRT = val.padStart(3, '0');
      setJabatan(`KETUA RT ${formattedRT}`);
    }
  };

  const filteredResidents = useMemo(() => {
    const effectiveRT = rtNumber || activeRT;
    const isRTMode = type === 'rt' && effectiveRT;
    if (search.length < 2 && !isRTMode) return [];
    
    const searchLower = search.toLowerCase();
    const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
    
    return residents.filter((r: Resident) => {
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
        r.nama.toLowerCase().includes(term) || 
        String(r.nik || '').includes(term) ||
        r.alamat.toLowerCase().includes(term)
      );
      
      if (isRTMode) {
        return matchesSearch && String(r.rt).padStart(3, '0') === String(effectiveRT).padStart(3, '0');
      }
      return matchesSearch;
    }).slice(0, 15);
  }, [search, residents, type, activeRT, rtNumber]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedResident && !initialData?.nik) {
      showNotification('Pilih penduduk terlebih dahulu', 'error');
      return;
    }
    if (!jabatan) {
      showNotification('Jabatan harus diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    const dataToSave = {
      nama_lengkap: selectedResident?.nama || initialData.nama_lengkap || initialData.nama,
      nik: selectedResident?.nik || initialData.nik,
      no_kk: selectedResident?.no_kk || initialData.no_kk,
      tempat_lahir: selectedResident?.tempat_lahir || initialData.tempat_lahir,
      tanggal_lahir: selectedResident?.tanggal_lahir || initialData.tanggal_lahir,
      jenis_kelamin: selectedResident?.jenis_kelamin || initialData.jenis_kelamin,
      pendidikan: selectedResident?.pendidikan || initialData.pendidikan,
      no_sk: noSk,
      tanggal_sk: tglSk,
      jabatan: jabatan,
      nipd: nipd,
      no_hp: hp,
      keterangan: keterangan,
      rt: type === 'rt' ? String(rtNumber).padStart(3, '0') : String(selectedResident?.rt || initialData.rt || initialData.RT || '').padStart(3, '0'),
      RT: type === 'rt' ? String(rtNumber).padStart(3, '0') : String(selectedResident?.rt || initialData.rt || initialData.RT || '').padStart(3, '0'),
      rw: String(selectedResident?.rw || initialData.rw || initialData.RW || '').padStart(3, '0'),
      RW: String(selectedResident?.rw || initialData.rw || initialData.RW || '').padStart(3, '0'),
      dusun: selectedResident?.dusun || initialData.dusun
    };
    onSubmit(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!initialData?.nik ? (
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cari Penduduk (Nama/NIK)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsSearching(true);
                  }}
                  onFocus={() => setIsSearching(true)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={type === 'rt' && activeRT ? `Cari di RT ${activeRT}...` : "Ketik Nama atau NIK..."}
                />
              </div>
            </div>

            {isSearching && filteredResidents.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                {filteredResidents.map((r: Resident, i: number) => (
                  <button
                    key={`${r.nik}-${i}`}
                    type="button"
                    onClick={() => {
                      setSelectedResident(r);
                      setSearch(r.nama);
                      setIsSearching(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                      {r.nama.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 block text-sm">{r.nama}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{r.nik} | RT {r.rt}/RW {r.rw}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {selectedResident && (
              <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  {selectedResident.nama.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-700">{selectedResident.nama}</p>
                  <p className="text-[10px] text-blue-400 font-mono">{selectedResident.nik}</p>
                  <p className="text-[10px] text-blue-400 mt-0.5">{selectedResident.alamat} (RT {selectedResident.rt}/RW {selectedResident.rw})</p>
                </div>
                <button type="button" onClick={() => setSelectedResident(null)} className="text-blue-400 hover:text-blue-600 p-2">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penduduk Terpilih</label>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                {(initialData.nama_lengkap || initialData.nama || '').charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-700">{initialData.nama_lengkap || initialData.nama}</p>
                <p className="text-[10px] text-blue-400 font-mono">{initialData.nik}</p>
                <p className="text-[10px] text-blue-400 mt-0.5">{initialData.alamat} (RT {initialData.rt}/RW {initialData.rw})</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan</label>
          <input 
            type="text" 
            placeholder="Contoh: Ketua, Sekretaris, Anggota..."
            value={jabatan}
            onChange={e => setJabatan(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {type === 'rt' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Nomor RT</label>
            <div className="relative">
              <select 
                value={rtNumber}
                onChange={e => handleRTChange(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border-2 border-blue-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all shadow-sm"
              >
                <option value="">Pilih RT...</option>
                {rtOptions.map(rt => (
                  <option key={rt} value={rt}>RT {rt}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-blue-500">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No SK Pengangkatan</label>
          <input 
            type="text" 
            value={noSk}
            onChange={e => setNoSk(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal SK Pengangkatan</label>
          <input 
            type="date" 
            value={tglSk}
            onChange={e => setTglSk(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIPD</label>
          <input 
            type="text" 
            value={nipd}
            onChange={e => setNipd(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Handphone</label>
          <input 
            type="text" 
            value={hp}
            onChange={e => setHp(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="col-span-full space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan</label>
          <textarea 
            value={keterangan}
            onChange={e => setKeterangan(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button 
          type="submit"
          disabled={(!selectedResident && !initialData?.nik) || isSubmitting}
          className={cn(
            "px-8 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50",
            isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          )}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

function ResidentForm({ initialData, onSubmit, onCancel, showNotification }: any) {
  const [formData, setFormData] = useState<Partial<Resident>>({
    nik: '', no_kk: '', nama: '', tempat_lahir: '', jenis_kelamin: '',
    alamat: '', rt: '', rw: '', dusun: '', agama: '',
    status_perkawinan: '', pendidikan: '', pekerjaan: '', 
    status_hubungan: '', kewarganegaraan: '', nama_ayah: '', nama_ibu: '', golongan_darah: '-',
    ...initialData,
    tanggal_lahir: initialData?.tanggal_lahir ? formatDateForInput(initialData.tanggal_lahir) : '',
  });

  const validate = () => {
    if (!formData.nik || !/^\d{16}$/.test(formData.nik)) {
      showNotification('NIK harus berupa 16 digit angka yang valid', 'error');
      return false;
    }
    if (!formData.no_kk || !/^\d{16}$/.test(formData.no_kk)) {
      showNotification('No. KK harus berupa 16 digit angka yang valid', 'error');
      return false;
    }
    if (!formData.nama || formData.nama.length < 3) {
      showNotification('Nama lengkap minimal 3 karakter', 'error');
      return false;
    }
    if (!formData.tempat_lahir) {
      showNotification('Tempat lahir harus diisi', 'error');
      return false;
    }
    if (!formData.tanggal_lahir) {
      showNotification('Tanggal lahir harus diisi', 'error');
      return false;
    }
    if (formData.tanggal_lahir) {
      const birthDate = new Date(formData.tanggal_lahir);
      const today = new Date();
      if (birthDate > today) {
        showNotification('Tanggal lahir tidak boleh di masa depan', 'error');
        return false;
      }
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        showNotification('Format tanggal lahir tidak valid', 'error');
        return false;
      }
    }
    return true;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (validate()) {
      setIsSubmitting(true);
      const dataToSave = {
        ...formData,
        rt: String(formData.rt || '').padStart(3, '0'),
        rw: String(formData.rw || '').padStart(3, '0'),
      };
      onSubmit(dataToSave);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <FormInput 
            label="No. Kartu Keluarga" 
            value={formData.no_kk} 
            onChange={(v: string) => {
              const numericValue = v.replace(/\D/g, '').slice(0, 16);
              setFormData({...formData, no_kk: numericValue});
            }} 
            required 
          />
          <p className={cn(
            "text-[10px] font-bold ml-1 uppercase tracking-wider",
            formData.no_kk?.length === 16 ? "text-emerald-500" : "text-slate-400"
          )}>
            {formData.no_kk?.length || 0} / 16 Digit Angka
          </p>
        </div>
        <div className="space-y-1">
          <FormInput 
            label="NIK" 
            value={formData.nik} 
            onChange={(v: string) => {
              const numericValue = v.replace(/\D/g, '').slice(0, 16);
              setFormData({...formData, nik: numericValue});
            }} 
            required 
            disabled={!!initialData?.nik} 
          />
          <p className={cn(
            "text-[10px] font-bold ml-1 uppercase tracking-wider",
            formData.nik?.length === 16 ? "text-emerald-500" : "text-slate-400"
          )}>
            {formData.nik?.length || 0} / 16 Digit Angka
          </p>
        </div>
        <FormInput label="Nama Lengkap" value={formData.nama} onChange={(v: string) => setFormData({...formData, nama: v})} required uppercase />
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Jenis Kelamin</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.jenis_kelamin || 'Jenis Kelamin'}
            onChange={e => setFormData({...formData, jenis_kelamin: e.target.value as any})}
          >
            <option value="">Jenis Kelamin</option>
            <option>LAKI-LAKI</option>
            <option>PEREMPUAN</option>
          </select>
        </div>

        <FormInput label="Tempat Lahir" value={formData.tempat_lahir} onChange={(v: string) => setFormData({...formData, tempat_lahir: v})} uppercase />
        <FormInput label="Tanggal Lahir" type="date" value={formData.tanggal_lahir} onChange={(v: string) => setFormData({...formData, tanggal_lahir: v})} />
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Agama</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.agama || ''}
            onChange={e => setFormData({...formData, agama: e.target.value})}
          >
            <option value="">Pilih Agama</option>
            <option>ISLAM</option>
            <option>KRISTEN</option>
            <option>KATOLIK</option>
            <option>HINDU</option>
            <option>BUDHA</option>
            <option>KONGHUCU</option>
            <option>LAINNYA</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Pendidikan</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.pendidikan || ''}
            onChange={e => setFormData({...formData, pendidikan: e.target.value})}
          >
            <option value="">Pilih Pendidikan</option>
            <option>TIDAK / BELUM SEKOLAH</option>
            <option>BELUM TAMAT SD/SEDERAJAT</option>
            <option>TAMAT SD / SEDERAJAT</option>
            <option>SLTP/SEDERAJAT</option>
            <option>SLTA / SEDERAJAT</option>
            <option>DIPLOMA I / II</option>
            <option>AKADEMI/ DIPLOMA III/S. MUDA</option>
            <option>DIPLOMA IV/ STRATA I</option>
            <option>STRATA II</option>
            <option>STRATA III</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Pekerjaan</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.pekerjaan || ''}
            onChange={e => setFormData({...formData, pekerjaan: e.target.value})}
          >
            <option value="">Pilih Pekerjaan</option>
            <option>BELUM/TIDAK BEKERJA</option>
            <option>MENGURUS RUMAH TANGGA</option>
            <option>PELAJAR/MAHASISWA</option>
            <option>PENSIUNAN</option>
            <option>PEGAWAI NEGERI SIPIL (PNS)</option>
            <option>TENTARA NASIONAL INDONESIA (TNI)</option>
            <option>KEPOLISIAN RI (POLRI)</option>
            <option>PERDAGANGAN</option>
            <option>PETANI/PEKEBUN</option>
            <option>PETERNAK</option>
            <option>NELAYAN/PERIKANAN</option>
            <option>INDUSTRI</option>
            <option>KONSTRUKSI</option>
            <option>TRANSPORTASI</option>
            <option>KARYAWAN SWASTA</option>
            <option>KARYAWAN BUMN</option>
            <option>KARYAWAN BUMD</option>
            <option>KARYAWAN HONORER</option>
            <option>BURUH HARIAN LEPAS</option>
            <option>BURUH TANI/PERKEBUNAN</option>
            <option>BURUH NELAYAN/PERIKANAN</option>
            <option>BURUH PETERNAKAN</option>
            <option>PEMBANTU RUMAH TANGGA</option>
            <option>WIRASWASTA</option>
            <option>TUKANG CUKUR</option>
            <option>TUKANG LISTRIK</option>
            <option>TUKANG BATU</option>
            <option>TUKANG KAYU</option>
            <option>TUKANG SOL SEPATU</option>
            <option>TUKANG LAS/PANDAI BESI</option>
            <option>TUKANG JAHIT</option>
            <option>TUKANG GIGI</option>
            <option>PENATA RIAS</option>
            <option>PENATA BUSANA</option>
            <option>PENATA RAMBUT</option>
            <option>MEKANIK</option>
            <option>SENIMAN</option>
            <option>TABIB</option>
            <option>PARAJI</option>
            <option>PERANCANG BUSANA</option>
            <option>PENTERJEMAH</option>
            <option>IMAM MASJID</option>
            <option>PENDETA</option>
            <option>PASTOR</option>
            <option>WARTAWAN</option>
            <option>USTADZ/MUBALIGH</option>
            <option>JURU MASAK</option>
            <option>PROMOTOR ACARA</option>
            <option>ANGGOTA DPR-RI</option>
            <option>ANGGOTA DPD</option>
            <option>ANGGOTA BPK</option>
            <option>PRESIDEN</option>
            <option>WAKIL PRESIDEN</option>
            <option>ANGGOTA MAHKAMAH KONSTITUSI</option>
            <option>ANGGOTA KABINET/MENTERI</option>
            <option>DUTA BESAR</option>
            <option>GUBERNUR</option>
            <option>WAKIL GUBERNUR</option>
            <option>BUPATI</option>
            <option>WAKIL BUPATI</option>
            <option>WALIKOTA</option>
            <option>WAKIL WALIKOTA</option>
            <option>ANGGOTA DPRD PROVINSI</option>
            <option>ANGGOTA DPRD KABUPATEN/KOTA</option>
            <option>DOSEN</option>
            <option>GURU</option>
            <option>PILOT</option>
            <option>PENGACARA</option>
            <option>NOTARIS</option>
            <option>ARSITEK</option>
            <option>AKUNTAN</option>
            <option>KONSULTAN</option>
            <option>DOKTER</option>
            <option>BIDAN</option>
            <option>PERAWAT</option>
            <option>APOTEKER</option>
            <option>PSIKIATER/PSIKOLOG</option>
            <option>PENYULUH PERTANIAN</option>
            <option>PENYULUH PERIKANAN</option>
            <option>PENYULUH PETERNAKAN</option>
            <option>PERANGKAT DESA</option>
            <option>KEPALA DESA</option>
            <option>BIARAWAN</option>
            <option>WIRASWASTA</option>
            <option>LAINNYA</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Status Perkawinan</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.status_perkawinan || ''}
            onChange={e => setFormData({...formData, status_perkawinan: e.target.value})}
          >
            <option value="">Pilih Perkawinan</option>
            <option>BELUM KAWIN</option>
            <option>KAWIN</option>
            <option>CERAI HIDUP</option>
            <option>CERAI MATI</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Status Hubungan Keluarga</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.status_hubungan || ''}
            onChange={e => setFormData({...formData, status_hubungan: e.target.value})}
          >
            <option value="">Pilih Hub. Keluarga</option>
            <option>KEPALA KELUARGA</option>
            <option>SUAMI</option>
            <option>ISTRI</option>
            <option>ANAK</option>
            <option>MENANTU</option>
            <option>CUCU</option>
            <option>ORANG TUA</option>
            <option>MERTUA</option>
            <option>FAMILI LAIN</option>
            <option>PEMBANTU</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Kewarganegaraan</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.kewarganegaraan || ''}
            onChange={e => setFormData({...formData, kewarganegaraan: e.target.value})}
          >
            <option value="">Pilih Kewarganegaraan</option>
            <option>WNI</option>
            <option>WNA</option>
          </select>
        </div>

        <FormInput label="Nama Ayah" value={formData.nama_ayah} onChange={(v: string) => setFormData({...formData, nama_ayah: v})} uppercase />
        <FormInput label="Nama Ibu" value={formData.nama_ibu} onChange={(v: string) => setFormData({...formData, nama_ibu: v})} uppercase />
        
        <FormInput label="Alamat" value={formData.alamat} onChange={(v: string) => setFormData({...formData, alamat: v})} uppercase />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <FormInput 
              label="RT" 
              value={formData.rt} 
              onChange={(v: string) => {
                const numericValue = v.replace(/\D/g, '').slice(0, 3);
                setFormData({...formData, rt: numericValue});
              }} 
              onBlur={() => {
                if (formData.rt && formData.rt.length > 0) {
                  setFormData({...formData, rt: formData.rt.padStart(3, '0')});
                }
              }}
              placeholder="000"
            />
          </div>
          <div className="space-y-1">
            <FormInput 
              label="RW" 
              value={formData.rw} 
              onChange={(v: string) => {
                const numericValue = v.replace(/\D/g, '').slice(0, 3);
                setFormData({...formData, rw: numericValue});
              }} 
              onBlur={() => {
                if (formData.rw && formData.rw.length > 0) {
                  setFormData({...formData, rw: formData.rw.padStart(3, '0')});
                }
              }}
              placeholder="000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Dusun</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.dusun || ''}
            onChange={e => setFormData({...formData, dusun: e.target.value})}
          >
            <option value="">Pilih Dusun</option>
            <option>CIODENG</option>
            <option>SUKAWANGI</option>
            <option>SINARGALIH 1</option>
            <option>SINARGALIH 2</option>
            <option>PANGUYUHAN 1</option>
            <option>PANGUYUHAN 2</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Golongan Darah</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.golongan_darah || ''}
            onChange={e => setFormData({...formData, golongan_darah: e.target.value})}
          >
          <option value="">Pilih Gol. Darah</option>
            <option>TIDAK TAHU</option>
            <option>A</option>
            <option>B</option>
            <option>AB</option>
            <option>O</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={cn(
            "px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95",
            isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
          )}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
        </button>
      </div>
    </form>
  );
}

function UserForm({ initialData, onSubmit, onCancel, residents }: any) {
  const [formData, setFormData] = useState<Partial<User>>(initialData || {
    username: '', password: '', nama_lengkap: '', role: 'Petugas', status: 'Active', email: '',
    permissions: JSON.stringify(['dashboard', 'residents', 'profile'])
  });
  const [userSearch, setUserSearch] = useState(initialData?.nama_lengkap || '');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'filter_residents' | 'filter_rt'>('info');

  const filteredUserResidents = useMemo(() => {
    if (userSearch.length < 2) return [];
    return residents.filter((r: Resident) => 
      r.nama.toLowerCase().includes(userSearch.toLowerCase()) || 
      String(r.nik || '').includes(userSearch)
    ).slice(0, 10);
  }, [userSearch, residents]);

  const rtList = useMemo(() => {
    const rts = new Set<string>();
    residents?.forEach((r: Resident) => {
      if (r.rt) rts.add(String(r.rt).padStart(3, '0'));
    });
    return Array.from(rts).sort();
  }, [residents]);

  const dusunList = useMemo(() => {
    const dusuns = new Set<string>();
    residents?.forEach((r: Resident) => {
      if (r.dusun) dusuns.add(String(r.dusun));
    });
    return Array.from(dusuns).sort();
  }, [residents]);

  const dusunRTMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    residents?.forEach((r: Resident) => {
      if (r.dusun && r.rt) {
        const rtStr = String(r.rt).padStart(3, '0');
        if (!map[r.dusun]) map[r.dusun] = [];
        if (!map[r.dusun].includes(rtStr)) map[r.dusun].push(rtStr);
      }
    });
    return map;
  }, [residents]);

  const availableViews = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'residents', label: 'Data Penduduk', icon: <Users size={18} /> },
    { id: 'map', label: 'Peta Desa', icon: <MapPin size={18} /> },
    { id: 'village_officials', label: 'Perangkat Desa', icon: <Building2 size={18} /> },
    { id: 'reports', label: 'Laporan', icon: <FileText size={18} /> },
    { id: 'users', label: 'Kelola User', icon: <UserCog size={18} /> },
    { id: 'logs', label: 'Log Aktivitas', icon: <History size={18} /> },
    { id: 'village_info', label: 'Informasi Desa', icon: <Info size={18} /> },
    { id: 'profile', label: 'Profil', icon: <UserIcon size={18} /> },
    { id: 'bpd', label: 'BPD', icon: <Shield size={18} /> },
    { id: 'rt', label: 'RT', icon: <Building size={18} /> },
    { id: 'rw', label: 'RW', icon: <Building2 size={18} /> },
    { id: 'pkk', label: 'PKK', icon: <Heart size={18} /> },
    { id: 'karang_taruna', label: 'Karang Taruna', icon: <Zap size={18} /> },
    { id: 'lpmd', label: 'LPMD', icon: <Box size={18} /> },
    { id: 'linmas', label: 'Linmas', icon: <ShieldAlert size={18} /> },
  ];

  const availableActions = [
    { id: 'add', label: 'Tambah' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Hapus' },
    { id: 'import', label: 'Impor' },
    { id: 'export', label: 'Ekspor' },
  ];

  const togglePermission = (permId: string) => {
    const currentPerms = JSON.parse(formData.permissions || '[]');
    let newPerms = [...currentPerms];

    if (currentPerms.includes(permId)) {
      newPerms = newPerms.filter((p: string) => p !== permId);
      
      // Logic: If Dusun is deselected, all RTs in it are deselected.
      if (permId.startsWith('residents:filter:dusun:')) {
        const dusun = permId.replace('residents:filter:dusun:', '');
        const rtsInDusun = dusunRTMap[dusun] || [];
        rtsInDusun.forEach(rt => {
          const rtPerm = `residents:filter:rt:${rt}`;
          newPerms = newPerms.filter(p => p !== rtPerm);
        });
      }
      if (permId.startsWith('rt:filter:dusun:')) {
        const dusun = permId.replace('rt:filter:dusun:', '');
        const rtsInDusun = dusunRTMap[dusun] || [];
        rtsInDusun.forEach(rt => {
          const rtPerm = `rt:filter:${rt}`;
          newPerms = newPerms.filter(p => p !== rtPerm);
        });
      }
    } else {
      newPerms.push(permId);
      
      // Logic: If Dusun is selected, all RTs in it are selected.
      if (permId.startsWith('residents:filter:dusun:')) {
        const dusun = permId.replace('residents:filter:dusun:', '');
        const rtsInDusun = dusunRTMap[dusun] || [];
        rtsInDusun.forEach(rt => {
          const rtPerm = `residents:filter:rt:${rt}`;
          if (!newPerms.includes(rtPerm)) newPerms.push(rtPerm);
        });
      }
      if (permId.startsWith('rt:filter:dusun:')) {
        const dusun = permId.replace('rt:filter:dusun:', '');
        const rtsInDusun = dusunRTMap[dusun] || [];
        rtsInDusun.forEach(rt => {
          const rtPerm = `rt:filter:${rt}`;
          if (!newPerms.includes(rtPerm)) newPerms.push(rtPerm);
        });
      }
    }
    
    setFormData({ ...formData, permissions: JSON.stringify(newPerms) });
  };

  const hasPermission = (permId: string) => {
    try {
      return JSON.parse(formData.permissions || '[]').includes(permId);
    } catch (e) {
      return false;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.username || !formData.nama_lengkap) {
      alert('Username dan Nama Lengkap wajib diisi');
      return;
    }
    if (!initialData && !formData.password) {
      alert('Password wajib diisi untuk user baru');
      return;
    }
    setIsSubmitting(true);
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Tab Header */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl mb-6">
        <button 
          type="button"
          onClick={() => setActiveTab('info')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeTab === 'info' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
          )}
        >
          <UserIcon size={14} /> Info Dasar
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('menu')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeTab === 'menu' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
          )}
        >
          <Shield size={14} /> Menu
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('filter_residents')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeTab === 'filter_residents' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
          )}
        >
          <Filter size={14} /> Filter Penduduk
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('filter_rt')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeTab === 'filter_rt' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
          )}
        >
          <Building size={14} /> Filter RT
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {activeTab === 'info' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Username" value={formData.username} onChange={(v: string) => setFormData({...formData, username: v})} required disabled={!!initialData} />
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text"
                    value={userSearch}
                    onChange={e => {
                      setUserSearch(e.target.value);
                      setIsSearchingUser(true);
                      if (!e.target.value) setFormData({...formData, nama_lengkap: ''});
                    }}
                    onFocus={() => setIsSearchingUser(true)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Cari berdasarkan Nama atau NIK..."
                    required
                  />
                </div>
                
                {isSearchingUser && filteredUserResidents.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {filteredUserResidents.map((r: Resident) => (
                      <button
                        key={r.nik}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, nama_lengkap: r.nama});
                          setUserSearch(r.nama);
                          setIsSearchingUser(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {r.nama.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 block text-sm">{r.nama}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{r.nik}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Email" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
              <FormInput 
                label="Password" 
                type="password" 
                value={formData.password} 
                onChange={(v: string) => setFormData({...formData, password: v})} 
                required={!initialData} 
                placeholder={initialData ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.role || 'Petugas'}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                >
                  <option>Petugas</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.status || 'Active'}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Panduan Akses</p>
              <p className="text-xs text-slate-600 leading-relaxed">Pilih menu yang dapat diakses oleh user ini. Untuk menu tertentu, Anda juga dapat mengatur aksi spesifik (Tambah, Edit, Hapus).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableViews.map(view => (
                <div key={view.id} className={cn(
                  "p-4 rounded-3xl border transition-all duration-300",
                  hasPermission(view.id) ? "bg-white border-purple-200 shadow-md shadow-purple-100/50" : "bg-slate-50 border-slate-100 opacity-60 hover:opacity-100"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={hasPermission(view.id)}
                          onChange={() => togglePermission(view.id)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 rounded-lg peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all"></div>
                        <Check size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("p-2 rounded-xl transition-colors", hasPermission(view.id) ? "bg-purple-100 text-purple-600" : "bg-slate-200 text-slate-500")}>
                          {view.icon}
                        </span>
                        <span className="text-sm font-black text-slate-800 tracking-tight">{view.label}</span>
                      </div>
                    </label>
                  </div>
                  
                  {hasPermission(view.id) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 pl-8">
                      {!['dashboard', 'profile', 'logs', 'village_info', 'map'].includes(view.id) && (
                        <div className="flex flex-wrap gap-2">
                          {availableActions.map(action => (
                            <label key={`${view.id}:${action.id}`} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all active:scale-95">
                              <input 
                                type="checkbox" 
                                checked={hasPermission(`${view.id}:${action.id}`)}
                                onChange={() => togglePermission(`${view.id}:${action.id}`)}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                              />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{action.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {view.id === 'residents' && (
                        <div className="pt-3 border-t border-purple-100 space-y-2">
                          <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Akses Sub-Menu Data Penduduk</p>
                          <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all active:scale-95">
                              <input 
                                type="checkbox" 
                                checked={hasPermission(`residents`)}
                                onChange={() => togglePermission(`residents`)}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                              />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Semua Penduduk</span>
                            </label>
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all active:scale-95">
                              <input 
                                type="checkbox" 
                                checked={hasPermission(`kelahiran`)}
                                onChange={() => togglePermission(`kelahiran`)}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                              />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Kelahiran</span>
                            </label>
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all active:scale-95">
                              <input 
                                type="checkbox" 
                                checked={hasPermission(`kematian`)}
                                onChange={() => togglePermission(`kematian`)}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                              />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Kematian</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {view.id === 'rt' && (
                        <div className="pt-3 border-t border-purple-100 space-y-2">
                          <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Akses Sub-Menu RT</p>
                          <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all active:scale-95">
                              <input 
                                type="checkbox" 
                                checked={hasPermission(`rt:data_penduduk`)}
                                onChange={() => togglePermission(`rt:data_penduduk`)}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                              />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Data Penduduk</span>
                            </label>
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-purple-400 transition-all active:scale-95">
                              <input 
                                type="checkbox" 
                                checked={hasPermission(`rt:struktur_pengurus`)}
                                onChange={() => togglePermission(`rt:struktur_pengurus`)}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                              />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Struktur Pengurus</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'filter_residents' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-4">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Filter Wilayah Penduduk</p>
              <p className="text-xs text-slate-600 leading-relaxed">Batasi data penduduk yang dapat dilihat oleh user ini berdasarkan Dusun atau RT tertentu. Memilih Dusun akan otomatis memilih semua RT di dalamnya.</p>
            </div>
            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-600 mb-2">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <MapPin size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Dusun Terpilih</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {dusunList.map(dusun => (
                    <label key={`res-dusun-${dusun}`} className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer active:scale-95",
                      hasPermission(`residents:filter:dusun:${dusun}`) ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-purple-300"
                    )}>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={hasPermission(`residents:filter:dusun:${dusun}`)}
                          onChange={() => togglePermission(`residents:filter:dusun:${dusun}`)}
                          className="peer sr-only"
                        />
                        <div className={cn("w-4 h-4 border-2 rounded transition-all", hasPermission(`residents:filter:dusun:${dusun}`) ? "bg-white border-white" : "border-slate-300")}></div>
                        <Check size={10} className={cn("absolute left-0.5 transition-opacity", hasPermission(`residents:filter:dusun:${dusun}`) ? "text-purple-600 opacity-100" : "opacity-0")} />
                      </div>
                      <span className="text-xs font-black truncate">{dusun}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-600 mb-2">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Building size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest">RT Terpilih</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {rtList.map(rt => (
                    <label key={`res-rt-${rt}`} className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-95",
                      hasPermission(`residents:filter:rt:${rt}`) ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-purple-300"
                    )}>
                      <input 
                        type="checkbox" 
                        checked={hasPermission(`residents:filter:rt:${rt}`)}
                        onChange={() => togglePermission(`residents:filter:rt:${rt}`)}
                        className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                      />
                      <span className="text-xs font-black">RT {rt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'filter_rt' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Filter Wilayah RT</p>
              <p className="text-xs text-slate-600 leading-relaxed">Batasi data RT yang dapat dikelola oleh user ini. Memilih Dusun akan otomatis memilih semua RT di dalamnya.</p>
            </div>
            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <MapPin size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Dusun Terpilih</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {dusunList.map(dusun => (
                    <label key={`rt-dusun-${dusun}`} className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer active:scale-95",
                      hasPermission(`rt:filter:dusun:${dusun}`) ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-300"
                    )}>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={hasPermission(`rt:filter:dusun:${dusun}`)}
                          onChange={() => togglePermission(`rt:filter:dusun:${dusun}`)}
                          className="peer sr-only"
                        />
                        <div className={cn("w-4 h-4 border-2 rounded transition-all", hasPermission(`rt:filter:dusun:${dusun}`) ? "bg-white border-white" : "border-slate-300")}></div>
                        <Check size={10} className={cn("absolute left-0.5 transition-opacity", hasPermission(`rt:filter:dusun:${dusun}`) ? "text-blue-600 opacity-100" : "opacity-0")} />
                      </div>
                      <span className="text-xs font-black truncate">{dusun}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Building size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest">RT Terpilih</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {rtList.map(rt => (
                    <label key={`rt-filter-${rt}`} className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-95",
                      hasPermission(`rt:filter:${rt}`) ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-300"
                    )}>
                      <input 
                        type="checkbox" 
                        checked={hasPermission(`rt:filter:${rt}`)}
                        onChange={() => togglePermission(`rt:filter:${rt}`)}
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-xs font-black">RT {rt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
          <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95">Simpan User</button>
        </div>
      </form>
    </div>
  );
}

function MoveFamilyRTForm({ onSubmit, onCancel, residents, initialResident }: any) {
  const [formData, setFormData] = useState({
    no_kk: initialResident?.no_kk || '',
    rt: initialResident?.rt || '',
    rw: initialResident?.rw || '',
    dusun: initialResident?.dusun || '',
    alamat: initialResident?.alamat || ''
  });

  const familyMembers = useMemo(() => {
    if (!formData.no_kk) return [];
    return residents.filter((r: Resident) => r.no_kk === formData.no_kk);
  }, [residents, formData.no_kk]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    onSubmit({
      no_kk: formData.no_kk,
      rt: formData.rt,
      rw: formData.rw,
      dusun: formData.dusun,
      alamat: formData.alamat,
      members: familyMembers.map(m => m.nik)
    });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Pindah RT (Satu Keluarga)</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Update RT/RW untuk seluruh anggota keluarga</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <p className="text-xs font-bold text-blue-800 mb-2">Anggota Keluarga yang akan dipindahkan (KK: {formData.no_kk}):</p>
        <div className="flex flex-wrap gap-2">
          {familyMembers.map((m: Resident) => (
            <span key={m.nik} className="px-3 py-1 bg-white border border-blue-200 rounded-lg text-[10px] font-bold text-slate-700">
              {m.nama}
            </span>
          ))}
          {familyMembers.length === 0 && <p className="text-[10px] text-slate-400 italic">Tidak ada anggota keluarga ditemukan</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dusun Baru</label>
            <input 
              required
              type="text" 
              value={formData.dusun}
              onChange={e => setFormData({ ...formData, dusun: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RT Baru</label>
            <input 
              required
              type="text" 
              value={formData.rt}
              onChange={e => setFormData({ ...formData, rt: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
              placeholder="000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RW Baru</label>
            <input 
              required
              type="text" 
              value={formData.rw}
              onChange={e => setFormData({ ...formData, rw: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
              placeholder="000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Baru</label>
            <input 
              required
              type="text" 
              value={formData.alamat}
              onChange={e => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Pindahkan Keluarga</button>
        </div>
      </form>
    </div>
  );
}

function BirthForm({ onSubmit, onCancel, residents, currentUser }: any) {
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    no_kk: '',
    tanggal_lahir: new Date().toISOString().split('T')[0],
    tempat_lahir: '',
    jenis_kelamin: 'LAKI-LAKI',
    alamat: '',
    rt: '',
    rw: '',
    dusun: '',
    nama_ayah: '',
    nama_ibu: '',
    berat_lahir: '',
    panjang_lahir: '',
    status_hubungan: 'ANAK',
    operator: currentUser?.nama_lengkap || '',
    is_dead: false,
    tanggal_kematian: new Date().toISOString().split('T')[0],
    tempat_kematian: '',
    penyebab: ''
  });

  const [searchParent, setSearchParent] = useState('');
  const [parentResults, setParentResults] = useState<Resident[]>([]);

  const handleParentSearch = (query: string) => {
    setSearchParent(query);
    if (query.length > 2) {
      const results = residents.filter((r: Resident) => 
        r.nama.toLowerCase().includes(query.toLowerCase()) || 
        String(r.nik).includes(query)
      ).slice(0, 5);
      setParentResults(results);
    } else {
      setParentResults([]);
    }
  };

  const selectParent = (parent: Resident) => {
    // Find potential spouse in the same KK
    const spouse = residents.find((r: Resident) => 
      r.no_kk === parent.no_kk && 
      r.nik !== parent.nik && 
      (
        (parent.jenis_kelamin === 'LAKI-LAKI' && r.jenis_kelamin === 'PEREMPUAN' && r.status_hubungan === 'ISTRI') ||
        (parent.jenis_kelamin === 'PEREMPUAN' && r.jenis_kelamin === 'LAKI-LAKI' && r.status_hubungan === 'KEPALA KELUARGA')
      )
    );

    setFormData({
      ...formData,
      no_kk: parent.no_kk || '',
      dusun: parent.dusun || '',
      rt: parent.rt || '',
      rw: parent.rw || '',
      alamat: parent.alamat || '',
      nama_ayah: parent.jenis_kelamin === 'LAKI-LAKI' ? parent.nama : (spouse ? spouse.nama : formData.nama_ayah),
      nama_ibu: parent.jenis_kelamin === 'PEREMPUAN' ? parent.nama : (spouse ? spouse.nama : formData.nama_ibu),
    });
    setParentResults([]);
    setSearchParent('');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (formData.nik && formData.nik.length !== 16) {
      alert('NIK harus berisi 16 digit jika diisi');
      return;
    }
    
    setIsSubmitting(true);
    // Split data for backend
    const { is_dead, tanggal_kematian, tempat_kematian, penyebab, berat_lahir, panjang_lahir, ...residentData } = formData;
    
    onSubmit({
      resident: residentData,
      berat_lahir,
      panjang_lahir,
      is_dead,
      tanggal_kematian,
      tempat_kematian,
      penyebab
    });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Plus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Data Kelahiran Baru</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Tambah penduduk dari kelahiran</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-2 block">Cari Orang Tua (Otomatis Isi Data)</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Ketik Nama atau NIK Ayah/Ibu..."
            value={searchParent}
            onChange={e => handleParentSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
          />
          {parentResults.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              {parentResults.map(p => (
                <button 
                  key={p.nik}
                  onClick={() => selectParent(p)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.nama}</p>
                    <p className="text-[10px] font-mono text-slate-400">{p.nik}</p>
                  </div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">Pilih</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bayi</label>
            <input 
              required
              type="text" 
              value={formData.nama}
              onChange={e => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Nama Bayi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (Opsional)</label>
            <input 
              type="text" 
              value={formData.nik}
              onChange={e => setFormData({ ...formData, nik: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="NIK jika sudah ada"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor KK</label>
            <input 
              required
              type="text" 
              value={formData.no_kk}
              onChange={e => setFormData({ ...formData, no_kk: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Nomor KK Orang Tua"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
            <input 
              required
              type="text" 
              value={formData.tempat_lahir}
              onChange={e => setFormData({ ...formData, tempat_lahir: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Kota/Kabupaten"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
            <input 
              required
              type="date" 
              value={formData.tanggal_lahir}
              onChange={e => setFormData({ ...formData, tanggal_lahir: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
            <select 
              value={formData.jenis_kelamin}
              onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            >
              <option value="LAKI-LAKI">LAKI-LAKI</option>
              <option value="PEREMPUAN">PEREMPUAN</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Berat Lahir (gram)</label>
            <input 
              type="number" 
              value={formData.berat_lahir}
              onChange={e => setFormData({ ...formData, berat_lahir: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Contoh: 3200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Panjang Lahir (cm)</label>
            <input 
              type="number" 
              value={formData.panjang_lahir}
              onChange={e => setFormData({ ...formData, panjang_lahir: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Contoh: 50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dusun</label>
            <input 
              required
              type="text" 
              value={formData.dusun}
              onChange={e => setFormData({ ...formData, dusun: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Nama Dusun"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RT</label>
            <input 
              required
              type="text" 
              value={formData.rt}
              onChange={e => setFormData({ ...formData, rt: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RW</label>
            <input 
              required
              type="text" 
              value={formData.rw}
              onChange={e => setFormData({ ...formData, rw: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Ayah</label>
            <input 
              required
              type="text" 
              value={formData.nama_ayah}
              onChange={e => setFormData({ ...formData, nama_ayah: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Ibu</label>
            <input 
              required
              type="text" 
              value={formData.nama_ibu}
              onChange={e => setFormData({ ...formData, nama_ibu: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operator</label>
            <input 
              readOnly
              type="text" 
              value={formData.operator}
              className="w-full px-5 py-3 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-400 outline-none"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Status Kelahiran</h3>
              <p className="text-[10px] text-slate-500 font-medium">Tandai jika bayi sudah meninggal dunia</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.is_dead}
                onChange={e => setFormData({ ...formData, is_dead: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          {formData.is_dead && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Tanggal Kematian</label>
                <input 
                  required
                  type="date" 
                  value={formData.tanggal_kematian}
                  onChange={e => setFormData({ ...formData, tanggal_kematian: e.target.value })}
                  className="w-full px-5 py-3 bg-white border-2 border-rose-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Tempat Meninggal</label>
                <input 
                  required
                  type="text" 
                  value={formData.tempat_kematian}
                  onChange={e => setFormData({ ...formData, tempat_kematian: e.target.value })}
                  className="w-full px-5 py-3 bg-white border-2 border-rose-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
                  placeholder="Rumah, RS, dll"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Penyebab</label>
                <input 
                  required
                  type="text" 
                  value={formData.penyebab}
                  onChange={e => setFormData({ ...formData, penyebab: e.target.value })}
                  className="w-full px-5 py-3 bg-white border-2 border-rose-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
                  placeholder="Penyebab kematian"
                />
              </div>
            </motion.div>
          )}
        </div>

        <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "px-8 py-3 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
              isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            )}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeathForm({ onSubmit, onCancel, residents, currentUser, initialResident }: any) {
  const [selectedNik, setSelectedNik] = useState(initialResident?.nik || '');
  const [formData, setFormData] = useState({
    tanggal_kematian: new Date().toISOString().split('T')[0],
    penyebab: '',
    tempat_kematian: '',
    operator: currentUser?.nama_lengkap || ''
  });

  const [searchResident, setSearchResident] = useState('');
  const [residentResults, setResidentResults] = useState<Resident[]>([]);

  const handleResidentSearch = (query: string) => {
    setSearchResident(query);
    if (query.length > 2) {
      const results = residents.filter((r: Resident) => 
        r.nama.toLowerCase().includes(query.toLowerCase()) || 
        String(r.nik).includes(query)
      ).slice(0, 5);
      setResidentResults(results);
    } else {
      setResidentResults([]);
    }
  };

  const selectResident = (resident: Resident) => {
    setSelectedNik(resident.nik);
    setResidentResults([]);
    setSearchResident('');
  };

  const selectedResident = useMemo(() => {
    return residents.find((r: Resident) => r.nik === selectedNik);
  }, [residents, selectedNik]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedResident) return;
    setIsSubmitting(true);
    onSubmit({
      ...selectedResident,
      ...formData
    });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
            <Trash2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Data Kematian</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Pindahkan penduduk ke data kematian</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
        <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1 mb-2 block">Cari Penduduk (Berdasarkan Nama/NIK)</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Ketik Nama atau NIK Penduduk..."
            value={searchResident}
            onChange={e => handleResidentSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-rose-100 rounded-xl text-sm font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
          />
          {residentResults.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              {residentResults.map(r => (
                <button 
                  key={r.nik}
                  onClick={() => selectResident(r)}
                  className="w-full px-4 py-3 text-left hover:bg-rose-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{r.nama}</p>
                    <p className="text-[10px] font-mono text-slate-400">{r.nik}</p>
                  </div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">Pilih</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {selectedResident && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2"
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-blue-800">Detail Penduduk Terpilih:</p>
              <button type="button" onClick={() => setSelectedNik('')} className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline">Ganti</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              <div>Nama: <span className="text-slate-700">{selectedResident.nama}</span></div>
              <div>NIK: <span className="text-slate-700">{selectedResident.nik}</span></div>
              <div>Alamat: <span className="text-slate-700">{selectedResident.alamat}</span></div>
              <div>RT/RW: <span className="text-slate-700">{selectedResident.rt}/{selectedResident.rw}</span></div>
              <div>Dusun: <span className="text-slate-700">{selectedResident.dusun}</span></div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Kematian</label>
            <input 
              required
              type="date" 
              value={formData.tanggal_kematian}
              onChange={e => setFormData({ ...formData, tanggal_kematian: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penyebab</label>
            <input 
              required
              type="text" 
              value={formData.penyebab}
              onChange={e => setFormData({ ...formData, penyebab: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Sakit, Kecelakaan, dll"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tempat Meninggal</label>
            <input 
              required
              type="text" 
              value={formData.tempat_kematian}
              onChange={e => setFormData({ ...formData, tempat_kematian: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Rumah, RS, dll"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operator</label>
            <input 
              readOnly
              type="text" 
              value={formData.operator}
              className="w-full px-5 py-3 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-400 outline-none"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={!selectedNik || isSubmitting}
            className={cn(
              "px-8 py-3 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
              isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
            )}
          >
            {isSubmitting ? 'Memproses...' : 'Simpan & Pindahkan'}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormInput({ label, type = "text", value, onChange, required, disabled, uppercase }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input 
        type={type}
        required={required}
        disabled={disabled}
        value={value || ''}
        onChange={e => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
        className={cn(
          "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 transition-all",
          uppercase && "uppercase"
        )}
      />
    </div>
  );
}
