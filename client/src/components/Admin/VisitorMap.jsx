import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-white/10 shadow-glass">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-secondary text-accent">Bản đồ Visitor Real-time</h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-text-secondary">Đang truy cập: <strong className="text-white">{visitors.length}</strong></span>
        </div>
      </div>
      
      <div className="w-full h-[500px] rounded-xl overflow-hidden border border-white/10">
        <MapContainer center={[16.047079, 108.206230]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 10 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visitors.map((visitor) => (
            <Marker key={visitor.id} position={[visitor.lat, visitor.lon]}>
              <Popup>
                <div className="text-black p-1">
                  <p className="font-bold border-b pb-1 mb-1">{visitor.city}, {visitor.country}</p>
                  <p className="text-sm">IP: {visitor.ip}</p>
                  <p className="text-xs text-gray-500">Tham gia: {new Date(visitor.timestamp).toLocaleTimeString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {visitors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Danh sách chi tiết</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary text-sm">
                  <th className="py-2 px-4">IP</th>
                  <th className="py-2 px-4">Vị trí</th>
                  <th className="py-2 px-4">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm">{v.ip}</td>
                    <td className="py-3 px-4 text-sm">{v.city}, {v.country}</td>
                    <td className="py-3 px-4 text-sm">{new Date(v.timestamp).toLocaleTimeString()}</td>
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
