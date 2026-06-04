import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const DataContext = createContext();

// Default data for when API is empty
const DEFAULT_DATA = {
  hero: {
    title: 'Lưu giữ những khoảnh khắc vượt thời gian',
    subtitle: 'Photoshop, blending và Retouch ảnh chân dung, nàng thơ, ảnh cưới',
    gridItems: Array.from({ length: 10 }, (_, i) => ({
      image1: `https://images.unsplash.com/photo-${1500000000000 + i}?w=500&auto=format&fit=crop`,
      image2: `https://images.unsplash.com/photo-${1500000000000 + i + 10}?w=500&auto=format&fit=crop`
    })),
    ctaText: 'Xem Portfolio',
    ctaLink: '#portfolio'
  },
  portfolio: [
    { _id: 1, title: 'Summer Vibe', category: 'Beauty', location: 'Studio', coverImage: 'https://images.unsplash.com/photo-1512413914619-14a87a6078ac?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1512413914619-14a87a6078ac?w=1200', 'https://images.unsplash.com/photo-1524504280099-c1249bbd25f1?w=1200'] },
    { _id: 2, title: 'Nàng thơ Mộc Châu', category: 'Concept nàng thơ', location: 'Mộc Châu', coverImage: 'https://images.unsplash.com/photo-1524504280099-c1249bbd25f1?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1524504280099-c1249bbd25f1?w=1200'] },
    { _id: 3, title: 'Sweet Love', category: 'Couple / Gia đình', location: 'Đà Lạt', coverImage: 'https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=1200'] },
    { _id: 4, title: 'Retro Chic', category: 'Beauty', location: 'Hà Nội', coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200'] },
    { _id: 5, title: 'Mùa thu', category: 'Concept nàng thơ', location: 'Hà Nội', coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200'] },
  ],
  services: [
    { _id: 1, name: 'Gói Chân Dung', type: 'Gói sửa', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop', price: 'Bắt đầu từ 500.000đ', details: ['Sửa 20 ảnh chi tiết', 'Tặng thêm 2 ảnh', 'Bảo hành link ảnh 1 năm'] },
    { _id: 2, name: 'Gói Ảnh Cưới', type: 'Gói sửa', image: 'https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=500&auto=format&fit=crop', price: 'Bắt đầu từ 1.500.000đ', details: ['Sửa 50 ảnh chi tiết', 'Làm da cao cấp', 'Blend màu nghệ thuật', 'Bảo hành link ảnh 2 năm'] },
    { _id: 3, name: 'Phục Hồi Ảnh Cũ', type: 'Dịch vụ sửa', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop', price: 'Liên hệ', details: ['Phục hồi chi tiết', 'Lên màu ảnh đen trắng', 'Giao file chất lượng cao'] }
  ],
  about: {
    title: 'Câu chuyện thương hiệu',
    name: 'Nguyễn Văn A',
    description: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực Retouching, tôi luôn tâm niệm rằng mỗi bức ảnh đều mang một linh hồn và một câu chuyện riêng.',
    skills: ['Photoshop', 'Lightroom', 'Skin Retouching', 'Color Grading'],
    education: 'Cử nhân Thiết kế Đồ họa - Đại học Mỹ thuật Công nghiệp',
    images: []
  },
  testimonials: [
    { _id: 1, customerName: 'Hoàng Oanh', quote: 'Màu ảnh trong trẻo đúng ý mình, cảm ơn MVD rất nhiều.', image: 'https://images.unsplash.com/photo-1524504280099-c1249bbd25f1?w=200&auto=format&fit=crop' },
    { _id: 2, customerName: 'Thanh Trúc', quote: 'Retouch da rất tự nhiên, không bị giả. Rất đáng tiền!', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop' },
    { _id: 3, customerName: 'Minh Quân', quote: 'Bộ ảnh cưới được cứu màu xuất sắc. Ai xem cũng khen.', image: 'https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=200&auto=format&fit=crop' },
    { _id: 4, customerName: 'Lan Hương', quote: 'Dịch vụ chuyên nghiệp, giao ảnh nhanh hơn dự kiến.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop' },
  ],
  faq: [
    { _id: 1, question: 'Thời gian hoàn thành bộ ảnh là bao lâu?', answer: 'Thông thường từ 3 đến 7 ngày làm việc tùy thuộc vào số lượng và mức độ phức tạp.' },
    { _id: 2, question: 'Tôi có thể yêu cầu chỉnh sửa lại không?', answer: 'Có, mỗi gói đều hỗ trợ chỉnh sửa lại miễn phí từ 1 đến 2 lần.' },
    { _id: 3, question: 'Làm sao để gửi ảnh gốc?', answer: 'Bạn có thể tải lên Google Drive và gửi link cho chúng tôi.' },
    { _id: 4, question: 'Có hỗ trợ trả file PSD không?', answer: 'File PSD sẽ có mức giá riêng vì thuộc về bản quyền chất xám.' },
  ],
  comparisons: [
    { _id: 1, title: 'Retouch da', beforeImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', afterImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=100' },
    { _id: 2, title: 'Blend màu nghệ thuật', beforeImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', afterImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=100' },
    { _id: 3, title: 'Phục hồi ảnh cũ', beforeImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', afterImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=100' },
    { _id: 4, title: 'Cứu sáng', beforeImage: 'https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=800&q=80', afterImage: 'https://images.unsplash.com/photo-1518193855018-05fc08595cb6?w=800&q=100' },
  ]
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    hero: null,
    portfolio: [],
    services: [],
    about: null,
    testimonials: [],
    faq: [],
    comparisons: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const endpoints = ['hero', 'portfolio', 'services', 'about', 'testimonials', 'faq', 'comparisons'];
      const responses = await Promise.all(
        endpoints.map(ep => api.get(`/${ep}`).catch(err => {
          console.warn(`Failed to fetch /${ep}:`, err.message);
          return { data: null };
        }))
      );
      
      const newData = {};
      endpoints.forEach((ep, index) => {
        const responseData = responses[index].data;
        // Use default data if API returns empty/null
        if (!responseData || (Array.isArray(responseData) && responseData.length === 0) || (typeof responseData === 'object' && !Array.isArray(responseData) && Object.keys(responseData).length === 0)) {
          newData[ep] = DEFAULT_DATA[ep];
        } else {
          newData[ep] = responseData;
        }
      });
      
      setData(newData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message);
      // Use default data on error
      setData(DEFAULT_DATA);
    } finally {
      setLoading(false);
      // Notify other components (e.g. BackgroundAudio) that loading is complete
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
        const serverUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('/api', '')
          : 'http://localhost:5001';
        
        socketRef.current = io(serverUrl, {
          transports: ['websocket', 'polling'],
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

    return () => {
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
