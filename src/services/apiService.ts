/**
 * API Service for SIDAPEK
 * Handles communication with either local Express backend or Google Apps Script
 */

export const IS_GAS = (import.meta as any).env.VITE_USE_GAS === 'true' && (typeof window !== 'undefined' ? localStorage.getItem('SIDAPEK_MODE') !== 'local' : true);
export const GAS_URL = (import.meta as any).env.VITE_GAS_URL || '';

// Use a local variable to avoid issues with global fetch in some environments
// We use a function wrapper to ensure we always get the current global fetch
const getFetch = () => {
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch.bind(window);
  }
  return fetch;
};

const fetchFn = getFetch();

async function request(action: string, data?: any, token?: string) {
  if (IS_GAS) {
    const trimmedUrl = GAS_URL.trim();
    if (!trimmedUrl.startsWith('https://script.google.com/macros/s/')) {
      return { 
        status: 'error', 
        message: 'GAS_URL tidak valid. Pastikan URL adalah "Web App" yang di-deploy (dimulai dengan https://script.google.com/macros/s/...)' 
      };
    }
    
    if (!trimmedUrl.endsWith('/exec')) {
      return { 
        status: 'error', 
        message: 'GAS_URL tidak lengkap. Pastikan URL diakhiri dengan "/exec" (URL Web App Deployment).' 
      };
    }

    try {
      console.log(`Fetching from GAS via Proxy: (Action: ${action})`);
      
      const response = await fetch('/api/gas-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: trimmedUrl, 
          body: { action, data, token } 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        console.error('GAS Proxy responded with error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`GAS Proxy Success: (Action: ${action})`, result);
      return result;
    } catch (error: any) {
      console.error('GAS Request Error (via Proxy):', error);
      
      let helpMessage = 'Gagal terhubung ke Google Sheets.';
      if (error.message === 'Failed to fetch') {
        helpMessage = 'Gagal menghubungi server proxy lokal. Pastikan server backend sedang berjalan.';
      } else if (error.message.includes('HTTP error! status: 500')) {
        helpMessage = 'Server mengalami masalah saat menghubungi Google Apps Script.';
      } else {
        helpMessage += ' Error: ' + error.message;
      }
      
      return { 
        status: 'error', 
        message: helpMessage 
      };
    }
  } else {
    // Local Express API
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    let url = `/api/${action.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    
    const routeMap: Record<string, string> = {
      'getStats': '/api/stats',
      'getResidents': '/api/residents',
      'saveResident': '/api/residents',
      'deleteResident': `/api/residents/${data?.nik}`,
      'getUsers': '/api/users',
      'saveUser': '/api/users',
      'deleteUser': `/api/users/${data?.username}`,
      'getLogs': '/api/logs',
      'updateProfile': '/api/update-profile',
      'changePassword': '/api/change-password',
      'importResidents': '/api/residents/import',
      'bulkDeleteResidents': '/api/residents/bulk-delete',
      'getVillageInfo': '/api/village-info',
      'updateVillageInfo': '/api/village-info',
      'getVillageData': `/api/village-data/${data?.key}`,
      'saveVillageData': `/api/village-data/${data?.key}`,
      'login': '/api/login',
      'getResidentHistory': `/api/residents/history/${data?.nik}`,
      'handleKelahiran': '/api/residents/kelahiran',
      'handleKematian': '/api/residents/kematian',
      'deleteKelahiran': `/api/residents/kelahiran/${data?.nik}`,
      'deleteKematian': `/api/residents/kematian/${data?.nik}`,
      'moveFamilyRT': '/api/residents/move-family-rt',
      'uploadProfilePhoto': '/api/upload-photo',
      'getVillageDataAll': '/api/village-data-all'
    };

    url = routeMap[action] || url;
    const method = action.startsWith('delete') ? 'DELETE' : (action.startsWith('get') ? 'GET' : 'POST');
    
    try {
      const options: any = { method, headers };
      if (method !== 'GET') options.body = JSON.stringify(data);

      const response = await fetchFn(url, options);
      return await response.json();
    } catch (error: any) {
      console.error('Local API Error:', error);
      return { status: 'error', message: 'Gagal terhubung ke server: ' + error.message };
    }
  }
}

export const apiService = {
  login: (data: any) => request('login', data),
  getStats: (token: string) => request('getStats', null, token),
  getResidents: (token: string) => request('getResidents', null, token),
  saveResident: (data: any, token: string) => request('saveResident', data, token),
  deleteResident: (nik: string, token: string) => request('deleteResident', { nik }, token),
  getUsers: (token: string) => request('getUsers', null, token),
  saveUser: (data: any, token: string) => request('saveUser', data, token),
  deleteUser: (username: string, token: string) => request('deleteUser', { username }, token),
  getLogs: (token: string) => request('getLogs', null, token),
  updateProfile: (data: any, token: string) => request('updateProfile', data, token),
  changePassword: (data: any, token: string) => request('changePassword', data, token),
  importResidents: (data: any, token: string) => request('importResidents', data, token),
  bulkDeleteResidents: (niks: string[], token: string) => request('bulkDeleteResidents', { niks }, token),
  getVillageInfo: (token: string) => request('getVillageInfo', null, token),
  updateVillageInfo: (data: any, token: string) => request('updateVillageInfo', data, token),
  getVillageData: (key: string, token: string) => request('getVillageData', { key }, token),
  saveVillageData: (key: string, value: any, token: string) => request('saveVillageData', { key, value }, token),
  getResidentHistory: (nik: string, token: string) => request('getResidentHistory', { nik }, token),
  handleKelahiran: (data: any, token: string) => request('handleKelahiran', data, token),
  handleKematian: (data: any, token: string) => request('handleKematian', data, token),
  deleteKelahiran: (nik: string, token: string) => request('deleteKelahiran', { nik }, token),
  deleteKematian: (nik: string, token: string) => request('deleteKematian', { nik }, token),
  moveFamilyRT: (data: any, token: string) => request('moveFamilyRT', data, token),
  uploadProfilePhoto: (base64: string, fileName: string, token: string) => request('uploadProfilePhoto', { base64, fileName }, token),
  getVillageDataAll: (token: string) => request('getVillageDataAll', null, token),
};
