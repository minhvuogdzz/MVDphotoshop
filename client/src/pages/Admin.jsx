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
    faq: [],
    comparisons: [],
    collaborations: [],
    promo: null,
    resources: [],
    pageSettings: null
  });

  // Form & List states
  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageConfigTab, setPageConfigTab] = useState('home');
  
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
        endpointMap.map(item => api.get(`/${item.ep}`).catch(() => ({ data: null })))
      );
      
      const newData = {};
      endpointMap.forEach((item, index) => {
        newData[item.key] = responses[index].data;
      });
      setAllData(newData);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageImageUpload = async (e, pageKey, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const options = { maxSizeMB: 1.5, maxWidthOrHeight: 2500, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      const form = new FormData();
      form.append('image', compressedFile);

      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({
        ...prev,
        [pageKey]: {
          ...(prev[pageKey] || {}),
          [fieldName]: data.url
        }
      }));
      setMessage('Tải ảnh thành công!');
    } catch (err) {
      setMessage('Lỗi khi tải ảnh: ' + err.message);
    } finally {
      setIsUploading(false);
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

  // Dedicated Resource File upload (< 6MB direct upload to Cloudinary/server)
  const handleResourceFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      alert(`Tệp đã chọn có dung lượng ${(file.size / (1024 * 1024)).toFixed(1)}MB, vượt quá giới hạn 6MB!\n\nVới các tệp dung lượng lớn (≥ 6MB), vui lòng lưu trữ trên Google Drive và dán đường link vào ô "Link Google Drive" bên dưới.`);
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const { data } = await api.post('/upload-resource-file', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const fileExt = '.' + file.name.split('.').pop().toUpperCase();

      setFormData(prev => ({
        ...prev,
        downloadUrl: data.url,
        downloadType: 'direct',
        fileSize: sizeMB,
        fileType: prev.fileType || fileExt,
        originalFilename: data.originalFilename || file.name,
        localFilePath: data.localFilePath || '',
        cloudinaryUrl: data.cloudinaryUrl || ''
      }));
      setMessage(`Tải tệp tài nguyên thành công: ${file.name} (${sizeMB})`);
    } catch (err) {
      setMessage('Lỗi khi tải tệp: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Instructor Avatar upload for About section
  const handleInstructorAvatarUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 800, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const form = new FormData();
      form.append('image', compressedFile);
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newInstructors = [...(formData.instructors || [])];
      newInstructors[index] = { ...newInstructors[index], avatar: data.url };
      setFormData({ ...formData, instructors: newInstructors });
      setMessage('Tải ảnh đại diện giảng viên thành công!');
    } catch (err) {
      setMessage('Lỗi khi tải ảnh: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const updatePageField = (pageKey, fieldKey, value) => {
    setFormData(prev => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] || {}),
        [fieldKey]: value
      }
    }));
  };

  const handleSaveObject = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'pageSettings') {
        await api.post('/page-settings', formData);
        setMessage('Đã lưu cấu hình tất cả các trang thành công!');
        fetchAllData();
        return;
      }

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
      if (activeTab === 'resources') {
        dataToSave.tags = parseArray(dataToSave.tags);
        if (dataToSave.rating) dataToSave.rating = Number(dataToSave.rating);
      }
      if (dataToSave.images !== undefined) dataToSave.images = parseArray(dataToSave.images);
      if (dataToSave.backgroundUrls !== undefined) dataToSave.backgroundUrls = parseArray(dataToSave.backgroundUrls);

      await api.post(`/${activeTab}`, dataToSave);
      setMessage('Đã lưu thành công!');
      if (['portfolio', 'services', 'testimonials', 'faq', 'comparisons', 'collaborations', 'resources'].includes(activeTab)) {
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
    if (activeTab === 'resources') {
      setFormData({
        title: '',
        category: 'Photoshop Action',
        fileType: '.ATN',
        fileSize: '1.0 MB',
        description: '',
        tags: 'Retouch Da, High-End',
        isVip: false,
        isHot: true,
        rating: 5.0,
        downloadType: 'direct',
        downloadUrl: '',
        coverImage: ''
      });
    } else {
      setFormData({});
    }
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

  const isListType = ['portfolio', 'services', 'testimonials', 'faq', 'comparisons', 'collaborations', 'resources'].includes(activeTab);

  const inputStyle = "w-full bg-white/5 border border-glass text-white rounded-lg p-3 outline-none focus:border-accent transition-colors";

  return (
    <div className="pt-[88px] min-h-screen flex bg-bg-main">
      {/* Sidebar */}
      <div className="w-[250px] bg-bg-secondary border-r border-glass p-6 flex flex-col">
        <h3 className="mb-8 text-accent text-xl font-secondary">Quản trị hệ thống</h3>
        <div className="flex flex-col gap-3 flex-1">
          {[
            { id: 'pageSettings', label: '📑 Cấu hình Các Trang' },
            { id: 'hero', label: 'Hero Section' },
            { id: 'resources', label: '📦 Kho Tài Nguyên' },
            { id: 'services', label: 'Khóa học & Dịch vụ' },
            { id: 'about', label: 'Giới thiệu (About Us)' },
            { id: 'portfolio', label: 'Portfolio (Bộ ảnh)' },
            { id: 'comparisons', label: 'Before/After' },
            { id: 'collaborations', label: 'Sản phẩm cộng tác' },
            { id: 'testimonials', label: 'Đánh giá học viên' },
            { id: 'faq', label: 'Câu hỏi thường gặp' },
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
                          <div className="flex items-center gap-2">
                            <strong>{item.title || item.name || item.question || item.customerName || `Mục ${index + 1}`}</strong>
                            {activeTab === 'resources' && (
                              <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold">
                                {item.category} ({item.fileType || '.ZIP'})
                              </span>
                            )}
                            {item.isVip && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">VIP</span>}
                            {item.isHot && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">HOT</span>}
                          </div>
                          {activeTab === 'resources' && (
                            <div className="text-xs text-text-secondary mt-1">
                              {item.fileSize || '0.1 MB'} • ★ {item.rating || 5.0} • {item.downloadType === 'direct' ? 'Tải trực tiếp (<6MB)' : 'Google Drive (≥6MB)'}
                            </div>
                          )}
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
              {activeTab !== 'pageSettings' && (
                <div>
                  <label className="block mb-2 text-text-secondary">Tiêu đề chính (Title)</label>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required />
                </div>
              )}
              
              {activeTab === 'hero' && (
                <>
                  <div>
                    <label className="block mb-2 text-text-secondary">Phụ đề (Subtitle)</label>
                    <textarea value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className={inputStyle} />
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
                      <label className="block mb-2 text-text-secondary">Tên Học Viện (Academy Name)</label>
                      <input type="text" value={formData.academyName || ''} onChange={e => setFormData({...formData, academyName: e.target.value})} className={inputStyle} placeholder="VD: MVD Photoshop Academy" />
                    </div>
                    <div>
                      <label className="block mb-2 text-text-secondary">Khẩu hiệu / Slogan</label>
                      <input type="text" value={formData.slogan || ''} onChange={e => setFormData({...formData, slogan: e.target.value})} className={inputStyle} placeholder="VD: Nơi kiến tạo tư duy nghệ thuật & kỹ thuật Retouching..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-text-secondary">Tên Người Sáng Lập / Giảng Viên (Founder Name)</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} placeholder="VD: Dương Minh Vương" />
                    </div>
                    <div>
                      <label className="block mb-2 text-text-secondary">Chức Danh / Vai Trò (Founder Role)</label>
                      <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className={inputStyle} placeholder="VD: Founder & Head Retoucher – MVD Academy" />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-text-secondary">Tiêu đề trang (Header Title)</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} placeholder="VD: Về MVD Photoshop Academy" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-text-secondary">Tiêu đề phụ câu chuyện (Story Subtitle)</label>
                      <input type="text" value={formData.storySubtitle || ''} onChange={e => setFormData({...formData, storySubtitle: e.target.value})} className={inputStyle} placeholder="VD: Câu chuyện người làm nghề" />
                    </div>
                    <div>
                      <label className="block mb-2 text-text-secondary">Tiêu đề lớn câu chuyện (Story Title)</label>
                      <input type="text" value={formData.storyTitle || ''} onChange={e => setFormData({...formData, storyTitle: e.target.value})} className={inputStyle} placeholder="VD: Từ niềm say mê điểm ảnh đến chuẩn mực giảng dạy thực chiến" />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-text-secondary">Câu trích dẫn tâm đắc / Triết lý làm nghề (Quote)</label>
                    <textarea rows="2" value={formData.quote || ''} onChange={e => setFormData({...formData, quote: e.target.value})} className={inputStyle} placeholder="VD: Nghệ thuật hậu kỳ đỉnh cao là khi người xem rung động trước vẻ đẹp..." />
                  </div>

                  <div>
                    <label className="block mb-2 text-text-secondary">Nội dung câu chuyện chi tiết (Story / Bio)</label>
                    <textarea rows="6" value={formData.story || ''} onChange={e => setFormData({...formData, story: e.target.value})} className={inputStyle} placeholder="Viết câu chuyện về hành trình, đam mê, kinh nghiệm và triết lý đào tạo của bạn tại đây (hỗ trợ xuống dòng nhiều đoạn)..." />
                  </div>

                  <div>
                    <label className="block mb-2 text-text-secondary">Giới thiệu tổng quan ngắn (Description)</label>
                    <textarea rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle} placeholder="Mô tả tóm tắt giới thiệu học viện..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-text-secondary">Tầm nhìn (Vision - Tùy chọn)</label>
                      <textarea rows="2" value={formData.vision || ''} onChange={e => setFormData({...formData, vision: e.target.value})} className={inputStyle} placeholder="Mục tiêu vươn tới của học viện..." />
                    </div>
                    <div>
                      <label className="block mb-2 text-text-secondary">Sứ mệnh (Mission - Tùy chọn)</label>
                      <textarea rows="2" value={formData.mission || ''} onChange={e => setFormData({...formData, mission: e.target.value})} className={inputStyle} placeholder="Giá trị cốt lõi mang lại cho học viên..." />
                    </div>
                  </div>

                  {/* Dynamic Stats */}
                  <div className="border border-glass p-5 rounded-xl bg-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-bold text-sm">Các chỉ số ấn tượng (Stats Counter)</h4>
                        <p className="text-xs text-text-secondary">Hiển thị các con số nổi bật trên trang Giới thiệu</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, stats: [...(formData.stats || []), { label: '', value: '' }]})} 
                        className="px-3 py-1.5 bg-accent text-bg-main font-bold text-xs rounded-lg hover:bg-accent-hover transition-colors"
                      >
                        + Thêm chỉ số
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(formData.stats || []).map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-black/40 p-2.5 rounded-lg border border-white/10">
                          <input 
                            type="text" 
                            placeholder="Tiêu đề (VD: Học viên)" 
                            value={stat.label || ''} 
                            onChange={e => {
                              const newStats = [...(formData.stats || [])];
                              newStats[idx] = { ...newStats[idx], label: e.target.value };
                              setFormData({...formData, stats: newStats});
                            }} 
                            className="bg-transparent text-xs text-white outline-none w-full" 
                          />
                          <input 
                            type="text" 
                            placeholder="Số (VD: 1,200+)" 
                            value={stat.value || ''} 
                            onChange={e => {
                              const newStats = [...(formData.stats || [])];
                              newStats[idx] = { ...newStats[idx], value: e.target.value };
                              setFormData({...formData, stats: newStats});
                            }} 
                            className="bg-transparent text-xs text-accent font-bold outline-none w-28 text-right" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, stats: (formData.stats || []).filter((_, i) => i !== idx)})} 
                            className="text-red-400 hover:text-red-300 text-xs px-1.5"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Instructors */}
                  <div className="border border-glass p-5 rounded-xl bg-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-bold text-sm">Đội ngũ Giảng viên / Chuyên gia</h4>
                        <p className="text-xs text-text-secondary">Quản lý danh sách mentor, avatar và tiểu sử</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, instructors: [...(formData.instructors || []), { name: '', role: '', avatar: '', bio: '', exp: '' }]})} 
                        className="px-3 py-1.5 bg-accent text-bg-main font-bold text-xs rounded-lg hover:bg-accent-hover transition-colors"
                      >
                        + Thêm giảng viên
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(formData.instructors || []).map((ins, idx) => (
                        <div key={idx} className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-3">
                          <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-xs font-bold text-accent">Giảng viên #{idx + 1}</span>
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, instructors: (formData.instructors || []).filter((_, i) => i !== idx)})} 
                              className="text-red-400 text-xs hover:underline"
                            >
                              Xóa giảng viên này
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input 
                              type="text" 
                              placeholder="Họ và tên giảng viên" 
                              value={ins.name || ''} 
                              onChange={e => {
                                const newIns = [...(formData.instructors || [])];
                                newIns[idx] = { ...newIns[idx], name: e.target.value };
                                setFormData({...formData, instructors: newIns});
                              }} 
                              className={inputStyle} 
                            />
                            <input 
                              type="text" 
                              placeholder="Chức danh / Vai trò (VD: Giảng viên trưởng)" 
                              value={ins.role || ''} 
                              onChange={e => {
                                const newIns = [...(formData.instructors || [])];
                                newIns[idx] = { ...newIns[idx], role: e.target.value };
                                setFormData({...formData, instructors: newIns});
                              }} 
                              className={inputStyle} 
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            {ins.avatar ? (
                              <img src={ins.avatar} className="w-11 h-11 rounded-full object-cover border border-accent/40 shrink-0" alt="Avatar" />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 shrink-0">Ảnh</div>
                            )}
                            <input 
                              type="text" 
                              placeholder="URL ảnh đại diện hoặc tải lên bên cạnh" 
                              value={ins.avatar || ''} 
                              onChange={e => {
                                const newIns = [...(formData.instructors || [])];
                                newIns[idx] = { ...newIns[idx], avatar: e.target.value };
                                setFormData({...formData, instructors: newIns});
                              }} 
                              className={inputStyle} 
                            />
                            <input 
                              type="file" 
                              accept="image/*" 
                              id={`avatar-upload-${idx}`} 
                              onChange={(e) => handleInstructorAvatarUpload(e, idx)} 
                              className="hidden" 
                            />
                            <button 
                              type="button" 
                              onClick={() => document.getElementById(`avatar-upload-${idx}`).click()} 
                              className="px-3.5 py-3 bg-white/10 rounded-lg text-xs whitespace-nowrap hover:bg-white/20 transition-colors shrink-0"
                            >
                              Tải ảnh đại diện
                            </button>
                          </div>

                          <textarea 
                            rows="2" 
                            placeholder="Tiểu sử / Giới thiệu kinh nghiệm tóm tắt" 
                            value={ins.bio || ''} 
                            onChange={e => {
                              const newIns = [...(formData.instructors || [])];
                              newIns[idx] = { ...newIns[idx], bio: e.target.value };
                              setFormData({...formData, instructors: newIns});
                            }} 
                            className={inputStyle} 
                          />

                          <input 
                            type="text" 
                            placeholder="Kinh nghiệm (VD: 5+ năm kinh nghiệm High-End Retouching)" 
                            value={ins.exp || ''} 
                            onChange={e => {
                              const newIns = [...(formData.instructors || [])];
                              newIns[idx] = { ...newIns[idx], exp: e.target.value };
                              setFormData({...formData, instructors: newIns});
                            }} 
                            className={inputStyle} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-text-secondary">Nền tảng học vấn & Kinh nghiệm (Education)</label>
                      <textarea 
                        rows="3" 
                        value={formData.education || ''} 
                        onChange={e => setFormData({...formData, education: e.target.value})} 
                        className={inputStyle} 
                        placeholder="VD: - Tốt nghiệp Kỹ thuật máy tính..." 
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-text-secondary">Kỹ năng chuyên môn (Skills - cách nhau dấu phẩy)</label>
                      <textarea 
                        rows="3" 
                        value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')} 
                        onChange={e => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                        className={inputStyle} 
                        placeholder="VD: Photoshop, Lightroom, Retouching, Blend màu..." 
                      />
                    </div>
                  </div>

                  {/* Studio / Lab Photos */}
                  <div>
                    <label className="block mb-2 text-text-secondary font-bold">Thư viện ảnh Không gian Học viện & Phòng Lab</label>

                    <p className="text-xs text-text-secondary mb-3">Ảnh đầu tiên sẽ làm ảnh đại diện chính của trang Giới thiệu, các ảnh tiếp theo sẽ hiển thị trong thư viện Không gian học viện.</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(formData.images || []).map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Studio ${idx + 1}`} className="w-24 h-20 object-cover rounded-lg border border-glass" />
                          <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-glass">
                      <div>
                        <label className="text-white font-bold block">Banners 2 bên lề (Desktop)</label>
                        <span className="text-xs text-text-secondary">Hiển thị slide ảnh dọc hai bên lề màn hình lớn</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.desktopEnabled || false} 
                        onChange={e => setFormData({...formData, desktopEnabled: e.target.checked})}
                        className="w-6 h-6 rounded cursor-pointer accent-accent"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-glass">
                      <div>
                        <label className="text-white font-bold block">Popup thông báo (Mobile)</label>
                        <span className="text-xs text-text-secondary">Bật popup poster ưu đãi khi khách mở trên điện thoại</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.mobileEnabled || false} 
                        onChange={e => setFormData({...formData, mobileEnabled: e.target.checked})}
                        className="w-6 h-6 rounded cursor-pointer accent-accent"
                      />
                    </div>
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

              {activeTab === 'pageSettings' && (
                <div className="flex flex-col gap-6">
                  {/* Page Config Sub-tabs */}
                  <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-glass rounded-xl mb-2">
                    {[
                      { id: 'home', label: '🏠 Trang Chủ (Home)' },
                      { id: 'courses', label: '📚 Khóa Học (Courses)' },
                      { id: 'resources', label: '📦 Tài Nguyên (Resources)' },
                      { id: 'about', label: '🏛️ Giới Thiệu (About Us)' },
                      { id: 'showcase', label: '🎨 Tác Phẩm (Showcase)' },
                      { id: 'contact', label: '📞 Liên Hệ (Contact)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPageConfigTab(tab.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          pageConfigTab === tab.id
                            ? 'bg-accent text-bg-main shadow-lg'
                            : 'text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* SUBTAB: HOME */}
                  {pageConfigTab === 'home' && (
                    <div className="flex flex-col gap-6">
                      {/* Hero Section Card */}
                      <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-lg font-bold text-accent">1. Phần Mở Đầu Trang Chủ (Hero Section)</h4>
                          <span className="text-xs text-text-secondary">Banner chính đầu trang</span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Kiểu hiển thị Hero (Layout)</label>
                          <select
                            value={formData.home?.heroLayout || 'academy_banner'}
                            onChange={e => updatePageField('home', 'heroLayout', e.target.value)}
                            className={inputStyle}
                          >
                            <option value="academy_banner" className="bg-[#1a1a2e] text-white">Banner Học Viện Hiện Đại (Khuyên dùng - Đúng chuẩn Academy)</option>
                            <option value="cube_grid" className="bg-[#1a1a2e] text-white">Khối xoay 3D (Cũ - 40 ô ảnh)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu nhỏ (Badge)</label>
                            <input
                              type="text"
                              placeholder="VD: Học Viện Retouching Chuyên Nghiệp"
                              value={formData.home?.heroBadge || ''}
                              onChange={e => updatePageField('home', 'heroBadge', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề chính Hero (Title)</label>
                            <input
                              type="text"
                              placeholder="VD: MVD Photoshop Academy"
                              value={formData.home?.heroTitle || ''}
                              onChange={e => updatePageField('home', 'heroTitle', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả Hero (Subtitle)</label>
                          <textarea
                            rows="2"
                            placeholder="VD: Nơi kiến tạo tư duy nghệ thuật & kỹ thuật Retouching chuẩn quốc tế..."
                            value={formData.home?.heroSubtitle || ''}
                            onChange={e => updatePageField('home', 'heroSubtitle', e.target.value)}
                            className={inputStyle}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-2">
                            <span className="text-xs font-bold text-accent">Nút hành động chính 1</span>
                            <input
                              type="text"
                              placeholder="Chữ trên nút (VD: Khám phá khóa học)"
                              value={formData.home?.heroCta1Text || ''}
                              onChange={e => updatePageField('home', 'heroCta1Text', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="text"
                              placeholder="Đường dẫn (VD: /courses)"
                              value={formData.home?.heroCta1Link || ''}
                              onChange={e => updatePageField('home', 'heroCta1Link', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-2">
                            <span className="text-xs font-bold text-accent">Nút hành động phụ 2</span>
                            <input
                              type="text"
                              placeholder="Chữ trên nút (VD: Kho tài nguyên miễn phí)"
                              value={formData.home?.heroCta2Text || ''}
                              onChange={e => updatePageField('home', 'heroCta2Text', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="text"
                              placeholder="Đường dẫn (VD: /resources)"
                              value={formData.home?.heroCta2Link || ''}
                              onChange={e => updatePageField('home', 'heroCta2Link', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Ảnh đại diện Hero (Hình minh họa hoặc Poster khóa học)</label>
                          <div className="flex gap-4 items-center">
                            {formData.home?.heroImage && (
                              <img src={formData.home.heroImage} alt="Hero" className="w-24 h-24 object-cover rounded-lg border border-glass" />
                            )}
                            <div className="flex-1 flex flex-col gap-2">
                              <input
                                type="text"
                                placeholder="URL ảnh hoặc tải file bên dưới"
                                value={formData.home?.heroImage || ''}
                                onChange={e => updatePageField('home', 'heroImage', e.target.value)}
                                className={inputStyle}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handlePageImageUpload(e, 'home', 'heroImage')}
                                disabled={isUploading}
                                className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Home About Spotlight */}
                      <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-lg font-bold text-accent">2. Khối Giới Thiệu (About Spotlight)</h4>
                          <span className="text-xs text-text-secondary">Khối triết lý & phương pháp đào tạo</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                            <input
                              type="text"
                              placeholder="VD: Phương Pháp Thực Chiến"
                              value={formData.home?.aboutBadge || ''}
                              onChange={e => updatePageField('home', 'aboutBadge', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề (Title)</label>
                            <input
                              type="text"
                              placeholder="VD: Chuẩn Hóa Kỹ Thuật, Nâng Tầm Đôi Mắt Thẩm Mỹ"
                              value={formData.home?.aboutTitle || ''}
                              onChange={e => updatePageField('home', 'aboutTitle', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Nội dung mô tả (Description)</label>
                          <textarea
                            rows="3"
                            placeholder="VD: Tại MVD Photoshop Academy..."
                            value={formData.home?.aboutDesc || ''}
                            onChange={e => updatePageField('home', 'aboutDesc', e.target.value)}
                            className={inputStyle}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-white/5 rounded-lg flex flex-col gap-2">
                            <span className="text-xs font-bold text-accent">Điểm nổi bật 1</span>
                            <input
                              type="text"
                              placeholder="Tiêu đề điểm 1 (VD: 80% Thực hành)"
                              value={formData.home?.aboutPoint1Title || ''}
                              onChange={e => updatePageField('home', 'aboutPoint1Title', e.target.value)}
                              className={inputStyle}
                            />
                            <textarea
                              rows="2"
                              placeholder="Chi tiết điểm 1..."
                              value={formData.home?.aboutPoint1Desc || ''}
                              onChange={e => updatePageField('home', 'aboutPoint1Desc', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg flex flex-col gap-2">
                            <span className="text-xs font-bold text-accent">Điểm nổi bật 2</span>
                            <input
                              type="text"
                              placeholder="Tiêu đề điểm 2 (VD: Kèm cặp 1-1)"
                              value={formData.home?.aboutPoint2Title || ''}
                              onChange={e => updatePageField('home', 'aboutPoint2Title', e.target.value)}
                              className={inputStyle}
                            />
                            <textarea
                              rows="2"
                              placeholder="Chi tiết điểm 2..."
                              value={formData.home?.aboutPoint2Desc || ''}
                              onChange={e => updatePageField('home', 'aboutPoint2Desc', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Ảnh khối Giới thiệu</label>
                          <div className="flex gap-4 items-center">
                            {formData.home?.aboutImage && (
                              <img src={formData.home.aboutImage} alt="About" className="w-24 h-24 object-cover rounded-lg border border-glass" />
                            )}
                            <div className="flex-1 flex flex-col gap-2">
                              <input
                                type="text"
                                placeholder="URL ảnh hoặc tải file bên dưới"
                                value={formData.home?.aboutImage || ''}
                                onChange={e => updatePageField('home', 'aboutImage', e.target.value)}
                                className={inputStyle}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handlePageImageUpload(e, 'home', 'aboutImage')}
                                disabled={isUploading}
                                className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Resources Spotlight */}
                      <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-lg font-bold text-accent">3. Khối Kho Tài Nguyên (Resources Spotlight)</h4>
                          <span className="text-xs text-text-secondary">Banner nổi bật dẫn vào kho tài nguyên</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                            <input
                              type="text"
                              value={formData.home?.resourcesBadge || ''}
                              onChange={e => updatePageField('home', 'resourcesBadge', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề (Title)</label>
                            <input
                              type="text"
                              value={formData.home?.resourcesTitle || ''}
                              onChange={e => updatePageField('home', 'resourcesTitle', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả ngắn</label>
                          <textarea
                            rows="2"
                            value={formData.home?.resourcesDesc || ''}
                            onChange={e => updatePageField('home', 'resourcesDesc', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Courses Spotlight */}
                      <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-lg font-bold text-accent">4. Khối Khóa Học Tiêu Biểu (Courses Spotlight)</h4>
                          <span className="text-xs text-text-secondary">Phần hiển thị các khóa học thật từ cơ sở dữ liệu</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                            <input
                              type="text"
                              value={formData.home?.coursesBadge || ''}
                              onChange={e => updatePageField('home', 'coursesBadge', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề (Title)</label>
                            <input
                              type="text"
                              value={formData.home?.coursesTitle || ''}
                              onChange={e => updatePageField('home', 'coursesTitle', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả ngắn</label>
                          <textarea
                            rows="2"
                            value={formData.home?.coursesDesc || ''}
                            onChange={e => updatePageField('home', 'coursesDesc', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Showcase Spotlight */}
                      <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-lg font-bold text-accent">5. Khối Dự Án & Tác Phẩm (Showcase Spotlight)</h4>
                          <span className="text-xs text-text-secondary">Tiêu đề khu vực tác phẩm học viên</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                            <input
                              type="text"
                              value={formData.home?.showcaseBadge || ''}
                              onChange={e => updatePageField('home', 'showcaseBadge', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề (Title)</label>
                            <input
                              type="text"
                              value={formData.home?.showcaseTitle || ''}
                              onChange={e => updatePageField('home', 'showcaseTitle', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả ngắn</label>
                          <textarea
                            rows="2"
                            value={formData.home?.showcaseDesc || ''}
                            onChange={e => updatePageField('home', 'showcaseDesc', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      {/* CTA Banner Section */}
                      <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-lg font-bold text-accent">6. Banner Kêu Gọi Hành Động (CTA Cuối Trang)</h4>
                          <span className="text-xs text-text-secondary">Khối chốt tuyển sinh cuối trang chủ</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                            <input
                              type="text"
                              value={formData.home?.ctaBadge || ''}
                              onChange={e => updatePageField('home', 'ctaBadge', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề (Title)</label>
                            <input
                              type="text"
                              value={formData.home?.ctaTitle || ''}
                              onChange={e => updatePageField('home', 'ctaTitle', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả</label>
                          <textarea
                            rows="2"
                            value={formData.home?.ctaDesc || ''}
                            onChange={e => updatePageField('home', 'ctaDesc', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-white/5 rounded-lg flex flex-col gap-2">
                            <span className="text-xs font-bold text-accent">Nút chính 1</span>
                            <input
                              type="text"
                              placeholder="Tên nút (VD: Đăng ký tư vấn ngay)"
                              value={formData.home?.ctaBtn1Text || ''}
                              onChange={e => updatePageField('home', 'ctaBtn1Text', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="text"
                              placeholder="Link nút (VD: /contact)"
                              value={formData.home?.ctaBtn1Link || ''}
                              onChange={e => updatePageField('home', 'ctaBtn1Link', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg flex flex-col gap-2">
                            <span className="text-xs font-bold text-accent">Nút phụ 2</span>
                            <input
                              type="text"
                              placeholder="Tên nút (VD: Khám phá kho tài nguyên)"
                              value={formData.home?.ctaBtn2Text || ''}
                              onChange={e => updatePageField('home', 'ctaBtn2Text', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="text"
                              placeholder="Link nút (VD: /resources)"
                              value={formData.home?.ctaBtn2Link || ''}
                              onChange={e => updatePageField('home', 'ctaBtn2Link', e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: COURSES */}
                  {pageConfigTab === 'courses' && (
                    <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-lg font-bold text-accent">Cấu hình Trang Khóa Học (/courses)</h4>
                        <span className="text-xs text-text-secondary">Banner header trang danh mục khóa học & dịch vụ</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                          <input
                            type="text"
                            placeholder="VD: Chương Trình Đào Tạo Thực Chiến"
                            value={formData.courses?.badge || ''}
                            onChange={e => updatePageField('courses', 'badge', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề trang (Heading)</label>
                          <input
                            type="text"
                            placeholder="VD: Khóa Học & Dịch Vụ MVD Academy"
                            value={formData.courses?.title || ''}
                            onChange={e => updatePageField('courses', 'title', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả trang (Description)</label>
                        <textarea
                          rows="3"
                          placeholder="VD: Tất cả chương trình đào tạo..."
                          value={formData.courses?.description || ''}
                          onChange={e => updatePageField('courses', 'description', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Ảnh Banner đầu trang (Banner Image)</label>
                        <div className="flex gap-4 items-center">
                          {formData.courses?.bannerImage && (
                            <img src={formData.courses.bannerImage} alt="Courses Banner" className="w-24 h-24 object-cover rounded-lg border border-glass" />
                          )}
                          <div className="flex-1 flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="URL ảnh hoặc tải file bên dưới"
                              value={formData.courses?.bannerImage || ''}
                              onChange={e => updatePageField('courses', 'bannerImage', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handlePageImageUpload(e, 'courses', 'bannerImage')}
                              disabled={isUploading}
                              className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: RESOURCES */}
                  {pageConfigTab === 'resources' && (
                    <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-lg font-bold text-accent">Cấu hình Trang Tài Nguyên (/resources)</h4>
                        <span className="text-xs text-text-secondary">Banner header trang kho học liệu & plugin</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                          <input
                            type="text"
                            placeholder="VD: Học Liệu & Công Cù Độc Quyền"
                            value={formData.resources?.badge || ''}
                            onChange={e => updatePageField('resources', 'badge', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề trang (Heading)</label>
                          <input
                            type="text"
                            placeholder="VD: Kho Tài Nguyên MVD Academy"
                            value={formData.resources?.title || ''}
                            onChange={e => updatePageField('resources', 'title', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả trang (Description)</label>
                        <textarea
                          rows="3"
                          placeholder="VD: Trọn bộ Action, Preset, Brush..."
                          value={formData.resources?.description || ''}
                          onChange={e => updatePageField('resources', 'description', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Ảnh Banner đầu trang (Banner Image)</label>
                        <div className="flex gap-4 items-center">
                          {formData.resources?.bannerImage && (
                            <img src={formData.resources.bannerImage} alt="Resources Banner" className="w-24 h-24 object-cover rounded-lg border border-glass" />
                          )}
                          <div className="flex-1 flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="URL ảnh hoặc tải file bên dưới"
                              value={formData.resources?.bannerImage || ''}
                              onChange={e => updatePageField('resources', 'bannerImage', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handlePageImageUpload(e, 'resources', 'bannerImage')}
                              disabled={isUploading}
                              className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: ABOUT */}
                  {pageConfigTab === 'about' && (
                    <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-lg font-bold text-accent">Cấu hình Header Trang Giới Thiệu (/about)</h4>
                        <span className="text-xs text-text-secondary">Banner tiêu đề & mô tả chung trang Giới Thiệu Học Viện</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                          <input
                            type="text"
                            placeholder="VD: Học Viện Hậu Kỳ Chuyên Nghiệp"
                            value={formData.about?.badge || ''}
                            onChange={e => updatePageField('about', 'badge', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề trang (Heading)</label>
                          <input
                            type="text"
                            placeholder="VD: Về MVD Photoshop Academy"
                            value={formData.about?.title || ''}
                            onChange={e => updatePageField('about', 'title', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả trang (Description)</label>
                        <textarea
                          rows="3"
                          placeholder="VD: Nơi kiến tạo tư duy nghệ thuật & kỹ thuật Retouching chuẩn quốc tế..."
                          value={formData.about?.description || ''}
                          onChange={e => updatePageField('about', 'description', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Ảnh Banner đầu trang (Banner Image)</label>
                        <div className="flex gap-4 items-center">
                          {formData.about?.bannerImage && (
                            <img src={formData.about.bannerImage} alt="About Banner" className="w-24 h-24 object-cover rounded-lg border border-glass" />
                          )}
                          <div className="flex-1 flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="URL ảnh hoặc tải file bên dưới"
                              value={formData.about?.bannerImage || ''}
                              onChange={e => updatePageField('about', 'bannerImage', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handlePageImageUpload(e, 'about', 'bannerImage')}
                              disabled={isUploading}
                              className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: SHOWCASE */}
                  {pageConfigTab === 'showcase' && (
                    <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-lg font-bold text-accent">Cấu hình Trang Tác Phẩm & Dự Án (/projects)</h4>
                        <span className="text-xs text-text-secondary">Banner tiêu đề & mô tả trang Showcase</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                          <input
                            type="text"
                            placeholder="VD: Tác Phẩm & Dự Án"
                            value={formData.showcase?.badge || ''}
                            onChange={e => updatePageField('showcase', 'badge', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề trang (Heading)</label>
                          <input
                            type="text"
                            placeholder="VD: Toàn Bộ Tác Phẩm & Dự Án"
                            value={formData.showcase?.title || ''}
                            onChange={e => updatePageField('showcase', 'title', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả trang (Description)</label>
                        <textarea
                          rows="3"
                          placeholder="VD: Tất cả những dự án, những khoảnh khắc..."
                          value={formData.showcase?.description || ''}
                          onChange={e => updatePageField('showcase', 'description', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Ảnh Banner đầu trang (Banner Image)</label>
                        <div className="flex gap-4 items-center">
                          {formData.showcase?.bannerImage && (
                            <img src={formData.showcase.bannerImage} alt="Showcase Banner" className="w-24 h-24 object-cover rounded-lg border border-glass" />
                          )}
                          <div className="flex-1 flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="URL ảnh hoặc tải file bên dưới"
                              value={formData.showcase?.bannerImage || ''}
                              onChange={e => updatePageField('showcase', 'bannerImage', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handlePageImageUpload(e, 'showcase', 'bannerImage')}
                              disabled={isUploading}
                              className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: CONTACT */}
                  {pageConfigTab === 'contact' && (
                    <div className="p-6 bg-white/5 border border-glass rounded-xl flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-lg font-bold text-accent">Cấu hình Trang Liên Hệ (/contact) & Thông Tin Liên Lạc</h4>
                        <span className="text-xs text-text-secondary">Cập nhật hotline, email, địa chỉ, giờ làm việc và banner liên hệ</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Huy hiệu (Badge)</label>
                          <input
                            type="text"
                            placeholder="VD: Tư Vấn & Tuyển Sinh"
                            value={formData.contact?.badge || ''}
                            onChange={e => updatePageField('contact', 'badge', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Tiêu đề trang (Heading)</label>
                          <input
                            type="text"
                            placeholder="VD: Liên Hệ MVD Photoshop Academy"
                            value={formData.contact?.title || ''}
                            onChange={e => updatePageField('contact', 'title', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Mô tả trang (Description)</label>
                        <textarea
                          rows="3"
                          placeholder="VD: Đội ngũ tư vấn viên và giảng viên..."
                          value={formData.contact?.description || ''}
                          onChange={e => updatePageField('contact', 'description', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Hotline / Số điện thoại</label>
                          <input
                            type="text"
                            placeholder="VD: 0869528304"
                            value={formData.contact?.hotline || ''}
                            onChange={e => updatePageField('contact', 'hotline', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Email Tuyển Sinh / CSKH</label>
                          <input
                            type="email"
                            placeholder="VD: ougvn.it2@gmail.com"
                            value={formData.contact?.email || ''}
                            onChange={e => updatePageField('contact', 'email', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Địa chỉ trụ sở / phòng học</label>
                          <input
                            type="text"
                            placeholder="VD: Hà Nội, Việt Nam"
                            value={formData.contact?.address || ''}
                            onChange={e => updatePageField('contact', 'address', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Thời gian làm việc</label>
                          <input
                            type="text"
                            placeholder="VD: 08:00 - 22:00 hàng ngày"
                            value={formData.contact?.workingHours || ''}
                            onChange={e => updatePageField('contact', 'workingHours', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Zalo Hotline / Link Zalo</label>
                          <input
                            type="text"
                            placeholder="VD: 0869528304"
                            value={formData.contact?.zalo || ''}
                            onChange={e => updatePageField('contact', 'zalo', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Facebook Fanpage URL</label>
                          <input
                            type="text"
                            placeholder="VD: https://facebook.com/mvdacademy"
                            value={formData.contact?.facebook || ''}
                            onChange={e => updatePageField('contact', 'facebook', e.target.value)}
                            className={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Ảnh Banner Liên Hệ</label>
                        <div className="flex gap-4 items-center">
                          {formData.contact?.bannerImage && (
                            <img src={formData.contact.bannerImage} alt="Contact Banner" className="w-24 h-24 object-cover rounded-lg border border-glass" />
                          )}
                          <div className="flex-1 flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="URL ảnh hoặc tải file bên dưới"
                              value={formData.contact?.bannerImage || ''}
                              onChange={e => updatePageField('contact', 'bannerImage', e.target.value)}
                              className={inputStyle}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handlePageImageUpload(e, 'contact', 'bannerImage')}
                              disabled={isUploading}
                              className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                  <input type="text" placeholder="Link Drive ảnh gốc" value={formData.originalDriveLink || ''} onChange={e => setFormData({...formData, originalDriveLink: e.target.value})} className={inputStyle} />
                  <input type="text" placeholder="Link Drive ảnh sửa" value={formData.editedDriveLink || ''} onChange={e => setFormData({...formData, editedDriveLink: e.target.value})} className={inputStyle} />
                  
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

              {activeTab === 'resources' && (
                <>
                  <div>
                    <label className="block mb-1 text-xs text-text-secondary font-medium">Tiêu đề tài nguyên *</label>
                    <input type="text" placeholder="VD: Action Retouch Da Chuyên Nghiệp" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyle} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs text-text-secondary font-medium">Phân loại *</label>
                      <select value={formData.category || 'Photoshop Action'} onChange={e => setFormData({...formData, category: e.target.value})} className={inputStyle}>
                        <option value="Photoshop Action" className="text-black">Photoshop Action</option>
                        <option value="Lightroom Preset" className="text-black">Lightroom Preset</option>
                        <option value="Brush Pack" className="text-black">Brush Pack</option>
                        <option value="Texture & Overlay" className="text-black">Texture & Overlay</option>
                        <option value="PSD Mockup" className="text-black">PSD Mockup</option>
                        <option value="Phông nền Studio" className="text-black">Phông nền Studio</option>
                        <option value="Tài liệu Giáo trình" className="text-black">Tài liệu Giáo trình</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-text-secondary font-medium">Đuôi tệp (Extension)</label>
                      <input type="text" placeholder="VD: .ATN, .XMP, .ABR, .PSD, .ZIP" value={formData.fileType || ''} onChange={e => setFormData({...formData, fileType: e.target.value})} className={inputStyle} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs text-text-secondary font-medium">Dung lượng hiển thị</label>
                      <input type="text" placeholder="VD: 0.1 MB hoặc 150 MB" value={formData.fileSize || ''} onChange={e => setFormData({...formData, fileSize: e.target.value})} className={inputStyle} />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-text-secondary font-medium">Đánh giá sao (Rating)</label>
                      <input type="number" step="0.1" min="1" max="5" value={formData.rating || 5.0} onChange={e => setFormData({...formData, rating: e.target.value})} className={inputStyle} />
                    </div>
                  </div>

                  <div className="flex gap-6 py-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isVip || false} onChange={e => setFormData({...formData, isVip: e.target.checked})} className="w-4 h-4 accent-accent rounded" />
                      <span className="text-sm text-amber-300 font-bold">⭐ Tài nguyên VIP</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isHot || false} onChange={e => setFormData({...formData, isHot: e.target.checked})} className="w-4 h-4 accent-red-500 rounded" />
                      <span className="text-sm text-red-400 font-bold">🔥 Đang HOT</span>
                    </label>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-text-secondary font-medium">Mô tả ngắn gọn *</label>
                    <textarea rows="3" placeholder="Mô tả công dụng và tính năng của bộ tài nguyên..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyle} required />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-text-secondary font-medium">Hashtags (phân tách bởi dấu phẩy)</label>
                    <input type="text" placeholder="VD: Retouch Da, High-End, Dodge & Burn, Studio" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : (formData.tags || '')} onChange={e => setFormData({...formData, tags: e.target.value})} className={inputStyle} />
                  </div>

                  {/* File Download Mode: Direct Upload (< 6MB) vs Google Drive (>= 6MB) */}
                  <div className="p-4 rounded-xl bg-white/5 border border-glass space-y-3">
                    <label className="block text-xs font-bold text-accent uppercase tracking-wider">Cấu hình tải về (File Download)</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="downloadType"
                          value="direct"
                          checked={formData.downloadType === 'direct'}
                          onChange={() => setFormData({...formData, downloadType: 'direct'})}
                          className="accent-accent"
                        />
                        <span>Tải trực tiếp (&lt; 6MB)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="downloadType"
                          value="drive"
                          checked={formData.downloadType === 'drive'}
                          onChange={() => setFormData({...formData, downloadType: 'drive'})}
                          className="accent-accent"
                        />
                        <span>Google Drive / Link ngoài (&ge; 6MB)</span>
                      </label>
                    </div>

                    {formData.downloadType === 'direct' ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-text-secondary">
                          Chọn tệp để tải trực tiếp lên hệ thống (Dung lượng tối đa 6MB theo quy định):
                        </p>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="upload-resource-file"
                            onChange={handleResourceFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('upload-resource-file').click()}
                            className="px-4 py-2 rounded-lg bg-accent text-bg-main font-semibold text-xs hover:bg-accent-hover transition-colors flex items-center gap-2"
                            disabled={isUploading}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            {isUploading ? 'Đang tải tệp lên...' : 'Chọn tệp tải lên (< 6MB)'}
                          </button>
                        </div>
                        {formData.downloadUrl && (
                          <div className="text-xs text-green-400 bg-green-500/10 p-2.5 rounded-lg border border-green-500/20 space-y-1">
                            <div>✓ Tệp: <span className="text-white font-semibold">{formData.originalFilename || 'Tệp trực tiếp'}</span></div>
                            <div className="text-text-secondary text-[11px] truncate">Lưu trữ: {formData.downloadUrl}</div>
                            <div className="text-accent text-[11px]">Định dạng: {formData.fileType} • Dung lượng: {formData.fileSize}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <label className="block text-xs text-text-secondary font-medium">Link chia sẻ Google Drive / Đám mây (&ge; 6MB) *</label>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                          value={formData.downloadUrl || ''}
                          onChange={e => setFormData({...formData, downloadUrl: e.target.value})}
                          className={inputStyle}
                          required={formData.downloadType === 'drive'}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-text-secondary font-medium">Ảnh xem trước (Cover Image - tùy chọn)</label>
                    <input type="text" placeholder="URL ảnh xem trước" value={formData.coverImage || ''} onChange={e => setFormData({...formData, coverImage: e.target.value})} className={inputStyle} />
                    <div className="flex items-center gap-4 mt-2">
                      <input type="file" accept="image/*" id="upload-resource-cover" onChange={e => handleFileUpload(e, 'coverImage', false)} className="hidden" />
                      <button type="button" onClick={() => document.getElementById('upload-resource-cover').click()} className="px-3 py-1.5 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition-colors">
                        {isUploading ? 'Đang xử lý...' : 'Tải lên ảnh bìa'}
                      </button>
                    </div>
                  </div>
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
