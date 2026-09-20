import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const DataContext = createContext();

// Clean default data structure (all real content is populated from MongoDB)
const DEFAULT_DATA = {
  hero: {
    title: '',
    subtitle: '',
    gridItems: [],
    ctaText: '',
    ctaLink: ''
  },
  portfolio: [],
  services: [],
  about: {
    title: '',
    academyName: '',
    slogan: '',
    name: '',
    description: '',
    story: '',
    vision: '',
    mission: '',
    stats: [],
    instructors: [],
    skills: [],
    education: '',
    images: []
  },
  testimonials: [],
  faq: [],
  comparisons: [],
  collaborations: [],
  promo: {
    images: [],
    mobileEnabled: false,
    desktopEnabled: false
  },
  resources: [],
  pageSettings: null
};


export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    hero: null,
    portfolio: [],
    services: [],
    about: null,
    testimonials: [],
    faq: [],
    comparisons: [],
    collaborations: [],
    promo: null,
    resources: [],
    pageSettings: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const endpointMap = [
        { key: 'hero', ep: 'hero' },
        { key: 'portfolio', ep: 'portfolio' },
        { key: 'services', ep: 'services' },
        { key: 'about', ep: 'about' },
        { key: 'testimonials', ep: 'testimonials' },
        { key: 'faq', ep: 'faq' },
        { key: 'comparisons', ep: 'comparisons' },
        { key: 'collaborations', ep: 'collaborations' },
        { key: 'promo', ep: 'promo' },
        { key: 'resources', ep: 'resources' },
        { key: 'pageSettings', ep: 'page-settings' }
      ];

      const responses = await Promise.all(
        endpointMap.map(item => api.get(`/${item.ep}`).catch(err => {
          console.warn(`Failed to fetch /${item.ep}:`, err.message);
          return { data: null };
        }))
      );
      
      const newData = {};
      endpointMap.forEach((item, index) => {
        const responseData = responses[index].data;
        if (responseData !== null && responseData !== undefined) {
          newData[item.key] = responseData;
        } else {
          newData[item.key] = Array.isArray(DEFAULT_DATA[item.key]) ? [] : {};
        }
      });
      
      setData(newData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message);
      setData(DEFAULT_DATA);
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('loadingComplete'));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Socket.IO real-time sync
  useEffect(() => {
    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const defaultBackend = import.meta.env.PROD ? 'https://mvd-backend-zzrs.onrender.com' : 'http://localhost:5001';
        const serverUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('/api', '')
          : defaultBackend;
        
        let isAdmin = false;
        try {
          isAdmin = localStorage.getItem('adminToken') || window.location.pathname.includes('admin');
        } catch (e) {
          isAdmin = window.location.pathname.includes('admin');
        }
        
        let sessionId = '';
        try {
          sessionId = sessionStorage.getItem('visitor_session');
          if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('visitor_session', sessionId);
          }
        } catch (e) {
          // Fallback if sessionStorage is disabled
          sessionId = Math.random().toString(36).substring(2, 15);
        }

        socketRef.current = io(serverUrl, {
          transports: ['websocket', 'polling'],
          query: isAdmin ? { type: 'admin' } : { sessionId, type: 'visitor' },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        socketRef.current.on('connect', () => {
          console.log('🔌 Socket.IO connected for real-time updates');
        });

        socketRef.current.on('data-updated', (payload) => {
          console.log('📡 Real-time update:', payload?.section);
          // Refetch all data when admin makes changes
          fetchAllData();
        });

        socketRef.current.on('connect_error', (err) => {
          console.warn('Socket.IO connection error:', err.message);
        });
      } catch (err) {
        console.warn('Socket.IO not available, falling back to polling');
      }
    };

    connectSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        socketRef.current?.disconnect();
      } else if (document.visibilityState === 'visible') {
        socketRef.current?.connect();
      }
    };

    const handleBeforeUnload = () => {
      try {
        sessionStorage.removeItem('visitor_session');
      } catch (e) {
        // ignore
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchAllData]);

  const refetch = useCallback((section) => {
    if (section) {
      // Refetch specific section
      api.get(`/${section}`).then(({ data: responseData }) => {
        setData(prev => ({ ...prev, [section]: responseData }));
      }).catch(console.error);
    } else {
      fetchAllData();
    }
  }, [fetchAllData]);

  return (
    <DataContext.Provider value={{ 
      ...data, 
      loading, 
      error, 
      refetch 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export default DataContext;
