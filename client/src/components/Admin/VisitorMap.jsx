import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';

// Create a custom animated pulsing icon instead of using default images
const createPulsingIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="relative flex w-6 h-6 -ml-3 -mt-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.6)]"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const VisitorMap = () => {
  const [visitors, setVisitors] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    const fetchVisitors = async () => {
      try {
        const { data } = await api.get('/visitors');
        if (Array.isArray(data)) {
          setVisitors(data);
        }
      } catch (err) {
        console.error('Failed to fetch visitors:', err);
      }
    };
    fetchVisitors();

    // Setup Socket connection for real-time tracking
    const setupSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const serverUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('/api', '')
          : 'http://localhost:5001';

        socketRef.current = io(serverUrl, {
          transports: ['websocket', 'polling'],
          query: { type: 'admin' }
        });

        socketRef.current.on('visitor-updated', (activeList) => {
          console.log('Real-time visitors update:', activeList);
          setVisitors(activeList);
        });
      } catch (err) {
        console.error('Socket setup error:', err);
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const activeVisitors = visitors.filter(v => !v.leaveTime);

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-white/10 shadow-glass">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-secondary text-accent">Bản đồ Visitor Real-time</h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-text-secondary">Đang truy cập: <strong className="text-white">{activeVisitors.length}</strong></span>
        </div>
      </div>
      
      <div className="w-full h-[500px] rounded-xl overflow-hidden border border-white/10">
        <MapContainer center={[16.047079, 108.206230]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 10 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {activeVisitors.map((visitor) => (
            <Marker key={visitor._id || visitor.id} position={[visitor.lat, visitor.lon]} icon={createPulsingIcon()}>
              <Popup>
                <div className="text-black p-1">
                  <p className="font-bold border-b pb-1 mb-1">{visitor.city}, {visitor.country}</p>
                  <p className="text-sm">IP: {visitor.ip}</p>
                  <p className="text-xs text-gray-500">Bắt đầu: {new Date(visitor.joinTime || visitor.timestamp).toLocaleTimeString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {visitors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Lịch sử truy cập (100 lượt gần nhất)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary text-sm">
                  <th className="py-2 px-4">IP</th>
                  <th className="py-2 px-4">Vị trí</th>
                  <th className="py-2 px-4">Bắt đầu</th>
                  <th className="py-2 px-4">Rời đi</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v._id || v.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm">{v.ip}</td>
                    <td className="py-3 px-4 text-sm">{v.city}, {v.country}</td>
                    <td className="py-3 px-4 text-sm">{new Date(v.joinTime || v.timestamp).toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {v.leaveTime ? (
                        <span className="text-text-secondary">{new Date(v.leaveTime).toLocaleString('vi-VN')}</span>
                      ) : (
                        <span className="text-green-400">🟢 Đang truy cập</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorMap;
