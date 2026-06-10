import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import imageCompression from 'browser-image-compression';
import VisitorMap from '../components/Admin/VisitorMap';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('hero');

  // Cache data
  const [allData, setAllData] = useState({
    hero: null,
    portfolio: [],
    services: [],
    about: null,
    testimonials: [],
    comparisons: [],
    collaborations: [],
    promo: null
  });

  // Form & List states
  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && allData[activeTab] !== undefined) {
      const data = allData[activeTab];
      if (Array.isArray(data)) {
        setDataList(data);
        setFormData({});
      } else {
        setDataList([]);
        setFormData(data || {});
      }
      setMessage('');
    }
  }, [activeTab, allData, isAuthenticated]);

  const fetchAllData = async () => {
    try {
      const endpoints = ['hero', 'portfolio', 'services', 'about', 'testimonials', 'faq', 'comparisons', 'collaborations', 'promo'];
      const responses = await Promise.all(endpoints.map(ep => api.get(`/${ep}`)));
      
      const newData = {};
      endpoints.forEach((ep, index) => {
        newData[ep] = responses[index].data;
      });
      setAllData(newData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { password });
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError('Mật khẩu không chính xác');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  // Upload handler
  const handleFileUpload = async (e, fieldName, isArray = true) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const options = { maxSizeMB: 1.2, maxWidthOrHeight: 2000, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      const form = new FormData();
      form.append('image', compressedFile);

      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (isArray) {
        const newArr = formData[fieldName] ? [...formData[fieldName], data.url] : [data.url];
        setFormData({ ...formData, [fieldName]: newArr });
      } else {
        setFormData({ ...formData, [fieldName]: data.url });
      }
      setMessage('Tải ảnh thành công!');
    } catch (err) {
      setMessage('Lỗi khi tải ảnh. ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Multiple Upload handler
  const handleMultipleFileUpload = async (e, fieldArrayName) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const form = new FormData();
      const options = { maxSizeMB: 1.2, maxWidthOrHeight: 2000, useWebWorker: true };
      
      for (let i = 0; i < files.length; i++) {
        const compressedFile = await imageCompression(files[i], options);
        form.append('images', compressedFile, files[i].name);
      }

      const { data } = await api.post('/upload-multiple', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Append URLs to the specific array field
      const newArr = formData[fieldArrayName] ? [...formData[fieldArrayName], ...data.urls] : [...data.urls];
      setFormData({ ...formData, [fieldArrayName]: newArr });
      setMessage(`Đã tải lên ${data.urls.length} ảnh thành công!`);
    } catch (err) {
      setMessage('Lỗi khi tải ảnh. ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Grid Item specific upload
  const handleGridImageUpload = async (e, index, imageField) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      const form = new FormData();
      form.append('image', compressedFile);

      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newGridItems = [...((formData.gridItems && formData.gridItems.length === 10) ? formData.gridItems : Array(10).fill({ image1: '', image2: '', image3: '', image4: '' }))];
      newGridItems[index] = { ...newGridItems[index], [imageField]: data.url };
      
      setFormData({ ...formData, gridItems: newGridItems });
      setMessage('Tải ảnh thành công!');
    } catch (err) {
      setMessage('Lỗi khi tải ảnh. ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Audio Upload handler
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setMessage('Lỗi: File nhạc vượt quá dung lượng cho phép (50MB).');
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('audio', file);

      const { data } = await api.post('/upload-audio', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData({ ...formData, backgroundMusic: data.url });
      setMessage('Tải nhạc nền thành công!');
    } catch (err) {
      setMessage('Lỗi khi tải nhạc nền. ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveObject = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData };
      
      // Parse array fields if they are strings (modified during edit)
      const parseArray = (val) => {
        if (typeof val === 'string') {
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return val;
      };

      if (activeTab === 'services') {
        dataToSave.features = parseArray(dataToSave.features);
      }
      if (activeTab === 'about') {
        dataToSave.skills = parseArray(dataToSave.skills);
      }
      if (dataToSave.images !== undefined) dataToSave.images = parseArray(dataToSave.images);
      if (dataToSave.backgroundUrls !== undefined) dataToSave.backgroundUrls = parseArray(dataToSave.backgroundUrls);

      await api.post(`/${activeTab}`, dataToSave);
      setMessage('Đã lưu thành công!');
      if (['portfolio', 'services', 'testimonials', 'faq'].includes(activeTab)) {
        setIsModalOpen(false);
      }
      fetchAllData(); // reload list silently
    } catch (err) {
      setMessage('Lỗi khi lưu!');
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) return;
    try {
      await api.delete(`/${activeTab}/${id}`);
      setMessage('Đã xóa thành công!');
      fetchAllData(); // reload list silently
    } catch (err) {
      setMessage('Lỗi khi xóa!');
    }
  };

  // Drag-and-drop reorder for portfolio items
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = useCallback(async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const newList = [...dataList];
    const draggedItem = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, draggedItem);
    
    setDataList(newList);
    dragItem.current = null;
    dragOverItem.current = null;

    // Save new order to server
    try {
      const items = newList.map((item, i) => ({ id: item._id, order: i }));
      await api.put(`/${activeTab}/reorder`, { items });
      fetchAllData();
      setMessage('Đã sắp xếp lại thành công!');
    } catch (err) {
      setMessage('Lỗi khi sắp xếp!');
      fetchAllData();
    }
  }, [dataList, activeTab]);

  const heroDragItem = useRef(null);
  const heroDragOverItem = useRef(null);

  const handleHeroDragStart = (index) => {
    heroDragItem.current = index;
  };

  const handleHeroDragEnter = (index) => {
    heroDragOverItem.current = index;
  };

  const handleHeroDragEnd = () => {
    if (heroDragItem.current === null || heroDragOverItem.current === null) return;
    if (heroDragItem.current === heroDragOverItem.current) {
      heroDragItem.current = null;
      heroDragOverItem.current = null;
      return;
    }

    const newGridItems = [...((formData.gridItems && formData.gridItems.length === 10) ? formData.gridItems : Array(10).fill({ image1: '', image2: '', image3: '', image4: '' }))];
    const draggedItem = newGridItems[heroDragItem.current];
    newGridItems.splice(heroDragItem.current, 1);
    newGridItems.splice(heroDragOverItem.current, 0, draggedItem);
    
    setFormData({ ...formData, gridItems: newGridItems });
    heroDragItem.current = null;
    heroDragOverItem.current = null;
  };

  const openAddModal = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-main">
        <div className="glass-panel p-10 rounded-2xl w-full max-w-[400px]">
          <h2 className="mb-6 text-center text-2xl font-secondary text-accent">Admin Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Nhập mật mã" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-white/5 border border-glass rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors"
            />
            {error && <p className="text-[#ff6b6b] text-sm">{error}</p>}
            <button type="submit" className="p-3 bg-accent text-bg-main font-semibold rounded-lg transition-colors hover:bg-accent-hover">Xác minh</button>
          </form>
        </div>
      </div>
    );
  }

  const isListType = ['portfolio', 'services', 'testimonials', 'faq', 'comparisons', 'collaborations'].includes(activeTab);

  const inputStyle = "w-full bg-white/5 border border-glass text-white rounded-lg p-3 outline-none focus:border-accent transition-colors";

  return (
    <div className="pt-[88px] min-h-screen flex bg-bg-main">
      {/* Sidebar */}
      <div className="w-[250px] bg-bg-secondary border-r border-glass p-6 flex flex-col">
        <h3 className="mb-8 text-accent text-xl font-secondary">Quản trị hệ thống</h3>
        <div className="flex flex-col gap-3 flex-1">
          {[
            { id: 'hero', label: 'Hero Section' },
            { id: 'portfolio', label: 'Portfolio (Bộ ảnh)' },
            { id: 'services', label: 'Dịch vụ & Bảng giá' },
            { id: 'about', label: 'Giới thiệu (About)' },
            { id: 'testimonials', label: 'Đánh giá khách hàng' },
            { id: 'faq', label: 'Câu hỏi thường gặp' },
            { id: 'comparisons', label: 'Before/After' },
            { id: 'collaborations', label: 'Sản phẩm cộng tác' },
            { id: 'promo', label: '📢 Quảng cáo & Banner' },
            { id: 'visitors', label: '📍 Bản đồ Visitor' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`p-3 text-left rounded-lg transition-colors border ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-text-primary border-transparent hover:bg-white/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={logout} className="p-3 bg-white/5 rounded-lg text-[#ff6b6b] hover:bg-[#ff6b6b]/10 transition-colors">Đăng xuất</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <h2 className="mb-4 text-3xl font-secondary">Quản lý {activeTab}</h2>
        {message && <div className="p-3 bg-accent/20 text-accent rounded-lg mb-6">{message}</div>}
        
        <div className="glass-panel p-8 rounded-xl">
          {activeTab === 'visitors' ? (
            <VisitorMap />
          ) : isListType ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl">Danh sách dữ liệu</h3>
                <button onClick={openAddModal} className="px-4 py-2 bg-accent text-bg-main rounded-lg font-bold hover:bg-accent-hover transition-colors">+ Thêm mới</button>
              </div>
              
              <div className="grid gap-4">
                {dataList.length === 0 ? (
                  <p className="text-text-secondary">Chưa có dữ liệu nào. Vui lòng thêm mới hoặc dữ liệu mặc định sẽ được hiển thị trên web.</p>
                ) : (
                  dataList.map((item, index) => (
                    <div 
                      key={item._id || index} 
                      className={`p-4 bg-white/5 rounded-lg flex justify-between items-center transition-all duration-200 ${(activeTab === 'portfolio' || activeTab === 'comparisons' || activeTab === 'collaborations') ? 'hover:bg-white/10' : ''}`}
                      draggable={activeTab === 'portfolio' || activeTab === 'comparisons' || activeTab === 'collaborations'}
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      style={(activeTab === 'portfolio' || activeTab === 'comparisons' || activeTab === 'collaborations') ? { cursor: 'grab' } : {}}
                    >
                      <div className="flex items-center gap-3">
                        {(activeTab === 'portfolio' || activeTab === 'comparisons' || activeTab === 'collaborations') && (
                          <span className="text-text-secondary text-lg select-none" title="Kéo thả để sắp xếp">☰</span>
                        )}
                        <div>
                          <strong>{item.title || item.name || item.question || item.customerName || `Mục ${index + 1}`}</strong>
                          {(activeTab === 'portfolio' || activeTab === 'comparisons' || activeTab === 'collaborations') && <span className="text-text-secondary text-sm ml-2">#{index + 1}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(item)} className="text-accent border border-accent bg-transparent px-3 py-1.5 rounded hover:bg-accent hover:text-bg-main transition-colors">Sửa</button>
                        {item._id && (
                          <button onClick={() => handleDelete(item._id)} className="text-[#ff6b6b] border border-[#ff6b6b] bg-transparent px-3 py-1.5 rounded hover:bg-[#ff6b6b] hover:text-white transition-colors">Xóa</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveObject} className="flex flex-col gap-6">
              <div>
                <label className="block mb-2 text-text-secondary">Tiêu đề chính (Title)</label>
                <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required />
              </div>
              
              {activeTab === 'hero' && (
                <>
                  <div>
                    <label className="block mb-2 text-text-secondary">Phụ đề (Subtitle)</label>
                    <textarea value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className={inputStyle} />
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-glass">
                    <label className="block mb-2 text-text-secondary font-bold text-accent">Nhạc nền tự động phát (Background Music)</label>
                    <p className="text-sm text-text-secondary mb-3">Chấp nhận định dạng mp3 (Tối đa 50MB). Hệ thống sẽ <span className="text-accent">tự động nén chất lượng</span> xuống mức nhẹ nhất để trang web load nhanh. Bỏ trống để dùng nhạc mặc định.</p>
                    
                    <div className="flex flex-col gap-3">
                      {formData.backgroundMusic ? (
                        <div className="flex items-center gap-4 bg-black/40 p-3 rounded-lg">
                          <audio controls src={formData.backgroundMusic} className="h-8 max-w-[200px]" />
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, backgroundMusic: ''})}
                            className="text-[#ff6b6b] hover:underline text-sm font-bold"
                          >
                            Xóa nhạc
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-[#ff6b6b]">Chưa có nhạc tùy chỉnh, web sẽ chạy nhạc mặc định.</span>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <input 
                          type="file" 
                          accept="audio/mp3, audio/mpeg" 
                          id="upload-audio" 
                          onChange={handleAudioUpload} 
                          className="hidden" 
                        />
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('upload-audio').click()} 
                          disabled={isUploading}
                          className="px-4 py-2 bg-accent text-bg-main font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                          {isUploading ? 'Đang tải lên...' : 'Chọn file mp3'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block mb-2 text-text-secondary">Quản lý Grid 10 Khung Hình (Kéo thả để sắp xếp vị trí)</label>
                    <p className="text-sm text-text-secondary mb-4">Lưu ý: Khung 1-4 hiện trên Mobile. Khung 1-6 hiện trên Tablet. Cả 10 khung hiện trên Máy tính.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {((formData.gridItems && formData.gridItems.length === 10) ? formData.gridItems : Array(10).fill({ image1: '', image2: '', image3: '', image4: '' })).map((item, index) => (
                        <div 
                          key={index}
                          className="bg-white/5 border border-glass p-3 rounded-lg flex flex-col gap-3 cursor-grab hover:bg-white/10 transition-colors"
                          draggable
                          onDragStart={() => handleHeroDragStart(index)}
                          onDragEnter={() => handleHeroDragEnter(index)}
                          onDragEnd={handleHeroDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="font-bold text-accent">Ô {index + 1}</span>
                            <span className="text-text-secondary text-lg select-none">☰</span>
                          </div>
                          
                          {/* Image 1 Upload */}
                          <div className="flex flex-col gap-2">
                            <span className="text-xs text-text-secondary">Ảnh 1 (Mặt trước)</span>
                            {item.image1 ? (
                              <img src={item.image1} alt="Grid img 1" className="w-full h-20 object-cover rounded" />
                            ) : (
                              <div className="w-full h-20 bg-black/40 rounded flex items-center justify-center text-xs text-text-secondary">Trống</div>
                            )}
                            <input 
                              type="text" 
                              placeholder="URL Ảnh 1" 
                              value={item.image1 || ''} 
                              onChange={(e) => {
                                const newItems = [...((formData.gridItems && formData.gridItems.length === 10) ? formData.gridItems : Array(10).fill({ image1: '', image2: '', image3: '', image4: '' }))];
                                newItems[index] = { ...newItems[index], image1: e.target.value };
                                setFormData({ ...formData, gridItems: newItems });
                              }}
                              className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white"
                            />
                            <div className="relative">
                              <input type="file" accept="image/*" onChange={(e) => handleGridImageUpload(e, index, 'image1')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <button type="button" className="w-full bg-white/10 text-xs py-1.5 rounded hover:bg-white/20">Tải lên Ảnh 1</button>
                            </div>
                          </div>

                          {/* Image 2 Upload */}
                          <div className="flex flex-col gap-2 border-t border-white/10 pt-2">
                            <span className="text-xs text-text-secondary">Ảnh 2</span>
                            {item.image2 ? (
                              <img src={item.image2} alt="Grid img 2" className="w-full h-20 object-cover rounded" />
                            ) : (
                              <div className="w-full h-20 bg-black/40 rounded flex items-center justify-center text-xs text-text-secondary">Trống</div>
                            )}
                            <input 
                              type="text" 
                              placeholder="URL Ảnh 2" 
                              value={item.image2 || ''} 
                              onChange={(e) => {
                                const newItems = [...((formData.gridItems && formData.gridItems.length === 10) ? formData.gridItems : Array(10).fill({ image1: '', image2: '', image3: '', image4: '' }))];
                                newItems[index] = { ...newItems[index], image2: e.target.value };
                                setFormData({ ...formData, gridItems: newItems });
                              }}
                              className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white"
                            />
                            <div className="relative">
                              <input type="file" accept="image/*" onChange={(e) => handleGridImageUpload(e, index, 'image2')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <button type="button" className="w-full bg-white/10 text-xs py-1.5 rounded hover:bg-white/20">Tải lên Ảnh 2</button>
                            </div>
                          </div>

                          {/* Image 3 Upload */}
                          <div className="flex flex-col gap-2 border-t border-white/10 pt-2">
                            <span className="text-xs text-text-secondary">Ảnh 3</span>
                            {item.image3 ? (
                              <img src={item.image3} alt="Grid img 3" className="w-full h-20 object-cover rounded" />
                            ) : (
                              <div className="w-full h-20 bg-black/40 rounded flex items-center justify-center text-xs text-text-secondary">Trống</div>
                            )}
                            <input 
                              type="text" 
                              placeholder="URL Ảnh 3" 
                              value={item.image3 || ''} 
                              onChange={(e) => {
                                const newItems = [...((formData.gridItems && formData.gridItems.length === 10) ? formData.gridItems : Array(10).fill({ image1: '', image2: '', image3: '', image4: '' }))];
                                newItems[index] = { ...newItems[index], image3: e.target.value };
                                setFormData({ ...formData, gridItems: newItems });
                              }}
                              className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white"
                            />
                            <div className="relative">
                              <input type="file" accept="image/*" onChange={(e) => handleGridImageUpload(e, index, 'image3')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <button type="button" className="w-full bg-white/10 text-xs py-1.5 rounded hover:bg-white/20">Tải lên Ảnh 3</button>
                            </div>
                          </div>

                          {/* Image 4 Upload */}
                          <div className="flex flex-col gap-2 border-t border-white/10 pt-2">
                            <span className="text-xs text-text-secondary">Ảnh 4</span>
                            {item.image4 ? (
                              <img src={item.image4} alt="Grid img 4" className="w-full h-20 object-cover rounded" />
                            ) : (
                              <div className="w-full h-20 bg-black/40 rounded flex items-center justify-center text-xs text-text-secondary">Trống</div>
                            )}
                            <input 
                              type="text" 
                              placeholder="URL Ảnh 4" 
                              value={item.image4 || ''} 
                              onChange={(e) => {
                                const newItems = [...((formData.gridItems && formData.gridItems.length === 10) ? formData.gridItems : Array(10).fill({ image1: '', image2: '', image3: '', image4: '' }))];
                                newItems[index] = { ...newItems[index], image4: e.target.value };
                                setFormData({ ...formData, gridItems: newItems });
                              }}
                              className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white"
                            />
                            <div className="relative">
                              <input type="file" accept="image/*" onChange={(e) => handleGridImageUpload(e, index, 'image4')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <button type="button" className="w-full bg-white/10 text-xs py-1.5 rounded hover:bg-white/20">Tải lên Ảnh 4</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'about' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-text-secondary">Tiêu đề (Title)</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required />
                    </div>
                    <div>
                      <label className="block mb-2 text-text-secondary">Tên người sửa (Name)</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-text-secondary">Nội dung giới thiệu (Description)</label>
                    <textarea rows="4" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle} required />
                  </div>
                  <div>
                    <label className="block mb-2 text-text-secondary">Học vấn / Kinh nghiệm (Education)</label>
                    <textarea rows="3" value={formData.education || ''} onChange={e => setFormData({...formData, education: e.target.value})} className={inputStyle} />
                  </div>
                  <div>
                    <label className="block mb-2 text-text-secondary">Kỹ năng chuyên môn (cách nhau bởi dấu phẩy)</label>
                    <input type="text" value={formData.skills || ''} onChange={e => setFormData({...formData, skills: e.target.value})} className={inputStyle} placeholder="VD: Photoshop, Lightroom, Retouching..." />
                  </div>
                  <div>
                    <label className="block mb-2 text-text-secondary">Thư viện ảnh CV (Ảnh dự án, quá trình làm việc)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(formData.images || []).map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="CV Image" className="w-20 h-20 object-cover rounded-lg border border-glass" />
                          <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="file" 
                        multiple
                        accept="image/*"
                        onChange={(e) => handleMultipleFileUpload(e, 'images')}
                        disabled={isUploading}
                        className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-bg-main hover:file:bg-accent-hover"
                      />
                      {isUploading && <span className="text-accent text-sm animate-pulse">Đang nén & tải ảnh...</span>}
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'promo' && (
                <>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-glass">
                    <label className="text-white font-bold flex-1">Hiển thị Banners 2 bên lề (Desktop)</label>
                    <input 
                      type="checkbox" 
                      checked={formData.desktopEnabled || false} 
                      onChange={e => setFormData({...formData, desktopEnabled: e.target.checked})}
                      className="w-6 h-6 rounded cursor-pointer accent-accent"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-text-secondary font-bold">Thư viện ảnh Quảng cáo (Tỉ lệ 1:3 - Khuyên dùng ảnh dọc)</label>
                    <p className="text-sm text-text-secondary mb-4">Mỗi bên lề sẽ lấy ảnh để tạo hiệu ứng mờ ảo chuyển slide (mỗi 3s). Banner này chỉ hiển thị trên màn hình Desktop lớn. Hỗ trợ ảnh động GIF.</p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {(formData.images || []).map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="Promo" className="w-24 h-36 object-cover rounded-lg border border-glass" />
                          <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-[#ff6b6b] text-white w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-bold">×</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <input 
                          type="file" 
                          multiple
                          accept="image/*"
                          onChange={(e) => handleMultipleFileUpload(e, 'images')}
                          disabled={isUploading}
                          className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                        />
                      </div>
                      {isUploading && <span className="text-accent text-sm animate-pulse">Đang nén & tải ảnh...</span>}
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="px-6 py-3 bg-accent text-bg-main rounded-lg font-bold hover:bg-accent-hover transition-colors self-start">Lưu thay đổi</button>
            </form>
          )}
        </div>
      </div>

      {/* Generic Modal for Lists */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/80 z-[1000] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-[600px] p-8 rounded-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-6 text-2xl text-accent font-secondary">{formData._id ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab}</h3>
            <form onSubmit={handleSaveObject} className="flex flex-col gap-4">
              
              {activeTab === 'portfolio' && (
                <>
                  <input type="text" placeholder="Tên bộ ảnh" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required />
                  <select value={formData.category || 'Beauty'} onChange={e => setFormData({...formData, category: e.target.value})} className={inputStyle}>
                    <option value="Beauty" className="text-black">Beauty</option>
                    <option value="Concept nàng thơ" className="text-black">Concept nàng thơ</option>
                    <option value="Couple / Gia đình" className="text-black">Couple / Gia đình</option>
                    <option value="Khác" className="text-black">Khác</option>
                  </select>
                  <input type="text" placeholder="Địa điểm (Location)" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className={inputStyle} />
                  
                  <div>
                    <label className="block mb-2 text-text-secondary">Ảnh bìa (Cover Image)</label>
                    <input type="text" placeholder="Link ảnh tĩnh / Link Drive" value={formData.coverImage || ''} onChange={e => setFormData({...formData, coverImage: e.target.value})} className={inputStyle} />
                    <div className="flex items-center gap-4 mt-3">
                      <input type="file" accept="image/*" id="upload-cover" onChange={e => handleFileUpload(e, 'coverImage', false)} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-cover').click()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                        {isUploading ? 'Đang xử lý...' : 'Tải lên Ảnh Bìa (Nén < 600KB)'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-text-secondary">Các ảnh chi tiết của bộ ảnh (Gallery)</label>
                    <textarea rows="3" placeholder="Danh sách URL ảnh (cách nhau dấu phẩy)" value={Array.isArray(formData.images) ? formData.images.join(', ') : (formData.images || '')} onChange={e => setFormData({...formData, images: e.target.value})} className={inputStyle} />
                    <div className="flex items-center gap-4 mt-3">
                      <input type="file" accept="image/*" multiple id="upload-gallery" onChange={e => handleMultipleFileUpload(e, 'images')} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-gallery').click()} className="px-4 py-2 bg-accent text-bg-main font-bold rounded-lg hover:bg-accent-hover transition-colors">
                        {isUploading ? 'Đang tải và nén ảnh...' : 'Quét tải lên nhiều ảnh (Max 20 ảnh/lần)'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'comparisons' && (
                <>
                  <input type="text" placeholder="Tiêu đề (VD: Retouch da)" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required />
                  
                  <div>
                    <label className="block mb-2 text-text-secondary">Ảnh Trước (Before Image)</label>
                    <input type="text" placeholder="Link ảnh Before" value={formData.beforeImage || ''} onChange={e => setFormData({...formData, beforeImage: e.target.value})} className={inputStyle} required />
                    <div className="flex items-center gap-4 mt-3">
                      <input type="file" accept="image/*" id="upload-before" onChange={e => handleFileUpload(e, 'beforeImage', false)} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-before').click()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                        {isUploading ? 'Đang xử lý...' : 'Tải lên Ảnh Before'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-text-secondary">Ảnh Sau (After Image)</label>
                    <input type="text" placeholder="Link ảnh After" value={formData.afterImage || ''} onChange={e => setFormData({...formData, afterImage: e.target.value})} className={inputStyle} required />
                    <div className="flex items-center gap-4 mt-3">
                      <input type="file" accept="image/*" id="upload-after" onChange={e => handleFileUpload(e, 'afterImage', false)} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-after').click()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                        {isUploading ? 'Đang xử lý...' : 'Tải lên Ảnh After'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'collaborations' && (
                <>
                  <input type="text" placeholder="Tên bộ ảnh" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required />
                  <input type="text" placeholder="Địa điểm (Location)" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className={inputStyle} />
                  <input type="text" placeholder="Link Drive chi tiết" value={formData.driveLink || ''} onChange={e => setFormData({...formData, driveLink: e.target.value})} className={inputStyle} required />
                  
                  <div>
                    <label className="block mb-2 text-text-secondary">Ảnh minh họa (Tỷ lệ 4:6)</label>
                    <input type="text" placeholder="Link ảnh minh họa" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className={inputStyle} required />
                    <div className="flex items-center gap-4 mt-3">
                      <input type="file" accept="image/*" id="upload-collab-image" onChange={e => handleFileUpload(e, 'image', false)} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-collab-image').click()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                        {isUploading ? 'Đang xử lý...' : 'Tải lên Ảnh (Nén < 600KB)'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'services' && (
                <>
                  <input type="text" placeholder="Tên dịch vụ" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} required />
                  <select value={formData.type || 'Gói sửa'} onChange={e => setFormData({...formData, type: e.target.value})} className={inputStyle}>
                    <option value="Gói sửa" className="text-black">Gói sửa</option>
                    <option value="Dịch vụ sửa" className="text-black">Dịch vụ sửa</option>
                  </select>
                  <input type="text" placeholder="Giá (VD: Bắt đầu từ 500k)" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className={inputStyle} />
                  <div>
                    <label className="block mb-2 text-text-secondary">Ảnh bìa (Link ảnh hoặc tải lên)</label>
                    <input type="text" placeholder="Link ảnh bìa dịch vụ" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className={inputStyle} />
                    <div className="flex items-center gap-4 mt-3">
                      <input type="file" accept="image/*" id="upload-service-image" onChange={e => handleFileUpload(e, 'image', false)} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-service-image').click()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                        {isUploading ? 'Đang xử lý...' : 'Tải lên Ảnh Bìa (Nén < 600KB)'}
                      </button>
                    </div>
                  </div>
                  <textarea placeholder="Chi tiết dịch vụ (cách nhau dấu phẩy)" value={Array.isArray(formData.details) ? formData.details.join(', ') : (formData.details || '')} onChange={e => setFormData({...formData, details: e.target.value})} className={inputStyle} />
                </>
              )}

              {activeTab === 'testimonials' && (
                <>
                  <input type="text" placeholder="Tên khách hàng" value={formData.customerName || ''} onChange={e => setFormData({...formData, customerName: e.target.value})} className={inputStyle} required />
                  <textarea placeholder="Lời nhận xét" value={formData.quote || ''} onChange={e => setFormData({...formData, quote: e.target.value})} className={inputStyle} required />
                  
                  <div>
                    <label className="block mb-2 text-text-secondary">Ảnh đại diện khách hàng</label>
                    <input type="text" placeholder="Link ảnh khách hàng" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className={inputStyle} />
                    <div className="flex items-center gap-4 mt-3">
                      <input type="file" accept="image/*" id="upload-testimonial-image" onChange={e => handleFileUpload(e, 'image', false)} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-testimonial-image').click()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                        {isUploading ? 'Đang xử lý...' : 'Tải lên Ảnh Khách Hàng (Nén < 600KB)'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'faq' && (
                <>
                  <input type="text" placeholder="Câu hỏi" value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className={inputStyle} required />
                  <textarea placeholder="Câu trả lời" value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} className={inputStyle} required rows="5" />
                </>
              )}

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 p-3 bg-accent text-bg-main font-bold rounded-lg hover:bg-accent-hover transition-colors">Lưu dữ liệu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
