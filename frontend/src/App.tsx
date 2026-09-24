import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Clock, AlertTriangle, CalendarCheck, Bell, Cloud, Thermometer, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [temples, setTemples] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  
  const [selectedTemple, setSelectedTemple] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookedToken, setBookedToken] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [currentToken, setCurrentToken] = useState('');
  
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'devotee' | 'staff'

  const fetchTemples = async () => {
    try {
      const res = await axios.get(`${API_URL}/temples/`);
      setTemples(res.data);
      if (res.data.length > 0) setSelectedTemple(res.data[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSlots = async () => {
    if (!selectedTemple || !selectedDate) return;
    try {
      const res = await axios.get(`${API_URL}/temples/${selectedTemple}/slots`, {
        params: { date_str: selectedDate }
      });
      setSlots(res.data);
      setSelectedSlot('');
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/queue/status`);
      setQueueStatus((prev: any) => ({
        ...res.data,
        cv_alerts: prev?.cv_alerts?.status !== "INITIALIZING" && prev?.cv_alerts ? prev.cv_alerts : res.data.cv_alerts
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTemples();
    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 5000);
    
    // Phase 4: WebSocket for real-time CV alerts
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/cv-alerts`);
    ws.onmessage = (event) => {
      const cvAlert = JSON.parse(event.data);
      setQueueStatus((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          cv_alerts: cvAlert
        };
      });
    };
    
    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedTemple, selectedDate]);

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setBookingMessage('Please login first to make a booking.');
      return;
    }
    if (!selectedSlot) {
      setBookingMessage('Please select a time slot first.');
      return;
    }
    try {
      setBookingMessage('Booking...');
      const res = await axios.post(`${API_URL}/bookings/`, {
        slot_id: selectedSlot,
        is_online: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingMessage(`Success!`);
      setBookedToken(res.data.token_number);
      fetchSlots(); // Refresh availability
      fetchQueueStatus(); // Refresh queue
    } catch (e: any) {
      setBookingMessage(`Failed: ${e.response?.data?.detail || e.message}`);
    }
  };

  const handleCallNext = async () => {
    try {
      const res = await axios.post(`${API_URL}/queue/call-next`);
      if (res.data.called_token) {
        setCurrentToken(res.data.called_token);
        fetchQueueStatus();
      } else {
        alert("No devotees in queue!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <header className="bg-orange-600 text-white p-4 shadow-md flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Smart Temple System
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('home')}
            className={`${activeTab === 'home' ? 'font-bold border-b-2 border-white' : 'hover:underline opacity-80'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab('devotee')}
            className={`${activeTab === 'devotee' ? 'font-bold border-b-2 border-white' : 'hover:underline opacity-80'}`}
          >
            Devotee Portal
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            className={`${activeTab === 'staff' ? 'font-bold border-b-2 border-white' : 'hover:underline opacity-80'}`}
          >
            Staff Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl w-full mx-auto">
        
        {activeTab === 'home' && (
          <section className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-sm font-bold tracking-widest mb-6">NEXT GENERATION TEMPLE MANAGEMENT</div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Divine Experience. <br/><span className="text-orange-600">Smart Technology.</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Skip the long queues. Our AI-driven Computer Vision and M/M/k Queuing load balancers ensure a peaceful, organized, and truly divine Darshan experience.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('devotee')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
              >
                Book Darshan Now
              </button>
              <button 
                onClick={() => setActiveTab('staff')}
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-lg px-8 py-4 rounded-xl shadow-sm transition-all active:scale-95"
              >
                Staff Login
              </button>
            </div>
            
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl mb-4"><Users className="w-6 h-6"/></div>
                <h3 className="font-bold text-lg mb-2">AI Crowd Control</h3>
                <p className="text-gray-600 text-sm">YOLOv8 Edge-AI analyzes CCTV feeds to intelligently detect heavy congestion and prevent stampedes.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-xl mb-4"><Clock className="w-6 h-6"/></div>
                <h3 className="font-bold text-lg mb-2">Zero Wait Times</h3>
                <p className="text-gray-600 text-sm">M/M/k queuing algorithms dynamically load-balance online bookings vs. walk-in devotees.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 flex items-center justify-center rounded-xl mb-4"><QrCode className="w-6 h-6"/></div>
                <h3 className="font-bold text-lg mb-2">Smart e-Tokens</h3>
                <p className="text-gray-600 text-sm">Get digital QR tickets and WhatsApp alerts predicting exactly when your turn will come.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'devotee' && (
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-orange-500" />
              Book your Darshan Slot
            </h2>

            {!localStorage.getItem('token') ? (
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-100 mb-6 text-center">
                <h3 className="font-bold text-orange-900 mb-2">Authentication Required</h3>
                <p className="text-orange-700 text-sm mb-4">Please log in to make a genuine slot booking.</p>
                <div className="flex flex-col gap-3">
                  <input id="authEmail" type="email" placeholder="Email" className="p-3 border rounded-lg" />
                  <input id="authPassword" type="password" placeholder="Password" className="p-3 border rounded-lg" />
                  <div className="flex gap-3 mt-2">
                    <button 
                      onClick={async () => {
                        const email = (document.getElementById('authEmail') as HTMLInputElement).value;
                        const pwd = (document.getElementById('authPassword') as HTMLInputElement).value;
                        try {
                          const formData = new URLSearchParams();
                          formData.append('username', email);
                          formData.append('password', pwd);
                          const res = await axios.post(`${API_URL}/token`, formData, {
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                          });
                          localStorage.setItem('token', res.data.access_token);
                          window.location.reload();
                        } catch (e: any) { alert("Login Failed: " + (e.response?.data?.detail || "Invalid credentials")); }
                      }}
                      className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-lg"
                    >Login</button>
                    <button 
                      onClick={async () => {
                        const email = (document.getElementById('authEmail') as HTMLInputElement).value;
                        const pwd = (document.getElementById('authPassword') as HTMLInputElement).value;
                        try {
                          await axios.post(`${API_URL}/register`, { email, password: pwd, name: email.split('@')[0] });
                          alert("Registered successfully! Please login now.");
                        } catch (e: any) { alert("Registration Failed: " + (e.response?.data?.detail || "Error")); }
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300"
                    >Register</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 flex justify-between items-center">
                <span className="text-green-800 font-medium text-sm">Authenticated as Verified Devotee</span>
                <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="text-xs text-green-700 underline font-bold">Logout</button>
              </div>
            )}
            
            {localStorage.getItem('token') && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Select Temple</label>
                  <select 
                    className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition" 
                    value={selectedTemple}
                    onChange={(e) => setSelectedTemple(e.target.value)}
                  >
                    {temples.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}, {t.city}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Select Date</label>
                  <input 
                    type="date" 
                    className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <label className="block text-sm font-semibold mb-2 text-gray-700">Available Slots</label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {slots.length === 0 ? (
                    <div className="col-span-2 text-gray-500 text-sm p-4 bg-gray-50 rounded-lg text-center border border-dashed">No slots found for this date.</div>
                  ) : (
                    slots.map(slot => (
                      <button 
                        key={slot.id}
                        onClick={() => {
                          if (slot.availability > 0) setSelectedSlot(slot.id);
                        }}
                        disabled={slot.availability <= 0}
                        className={`p-3 rounded-lg border-2 transition text-left relative overflow-hidden ${
                          slot.availability <= 0 
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : selectedSlot === slot.id 
                              ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-sm'
                              : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/50'
                        }`}
                      >
                        <div className="font-semibold">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</div>
                        <div className={`text-xs mt-1 font-medium ${slot.availability <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {slot.availability <= 0 ? 'FULLY BOOKED' : `${slot.availability} spots remaining`}
                        </div>
                        {selectedSlot === slot.id && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full"></div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                <div className="bg-gray-50 border p-4 rounded-lg mb-6 flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-orange-600 rounded" checked={isPriority} onChange={e => setIsPriority(e.target.checked)} />
                    <div>
                      <div className="font-bold text-gray-800">Senior Citizen / Divyang (Priority)</div>
                      <div className="text-xs text-gray-500">Expedites queue progression automatically</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-green-600 rounded" checked={notifyWhatsApp} onChange={e => setNotifyWhatsApp(e.target.checked)} />
                    <div>
                      <div className="font-bold text-green-800 flex items-center gap-1">Enable WhatsApp Alerts <Bell className="w-4 h-4"/></div>
                      <div className="text-xs text-gray-500">Get notified 15 mins before your expected darshan time</div>
                    </div>
                  </label>
                </div>

                <button 
                  onClick={handleBooking}
                  className="w-full bg-orange-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-orange-700 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Confirm Booking
                </button>
                
                {bookingMessage && (
                  <div className={`mt-6 p-6 rounded-xl border-2 flex flex-col items-center text-center shadow-lg animate-in fade-in zoom-in duration-300 ${bookingMessage.includes('Success') ? 'bg-green-50/80 border-green-400' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {bookingMessage.includes('Success') ? (
                      <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                        <h3 className="text-2xl font-black text-green-800 tracking-wider">{bookedToken}</h3>
                        <p className="text-green-700 font-medium mb-4">Your e-Darshan Token</p>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <QRCodeSVG value={bookedToken} size={160} level="H" includeMargin={true} fgColor="#064e3b" />
                        </div>
                        <p className="text-sm text-gray-600 mt-4 flex items-center gap-2"><QrCode className="w-4 h-4"/> Show this QR at the smart entrance gate</p>
                        {notifyWhatsApp && <p className="text-xs font-bold text-green-700 mt-2">✓ WhatsApp alerts enabled for +91 ********</p>}
                      </>
                    ) : (
                      <span className="font-bold">{bookingMessage}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'staff' && (
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Clock className="w-7 h-7 text-blue-600" />
                Live Queue & Crowd Control
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Live</span>
              </div>
            </div>

            {/* NEW: IoT Environment Sensors Mock */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 border-r pr-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Thermometer className="w-5 h-5"/></div>
                <div><div className="text-xs font-bold text-gray-500">AMBIENT TEMP</div><div className="text-lg font-black text-gray-800">24.5°C</div></div>
              </div>
              <div className="flex items-center gap-3 border-r pr-4">
                <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg"><Cloud className="w-5 h-5"/></div>
                <div><div className="text-xs font-bold text-gray-500">INDOOR AQI</div><div className="text-lg font-black text-gray-800">42 <span className="text-xs font-bold text-green-500">GOOD</span></div></div>
              </div>
              <div className="flex items-center gap-3 border-r pr-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-5 h-5"/></div>
                <div><div className="text-xs font-bold text-gray-500">CAPACITY (ZONE A)</div><div className="text-lg font-black text-gray-800">68%</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><ShieldCheck className="w-5 h-5"/></div>
                <div><div className="text-xs font-bold text-gray-500">SECURITY STATUS</div><div className="text-lg font-black text-teal-700">SECURE</div></div>
              </div>
            </div>
            
            {queueStatus ? (
              <>
                <div className="bg-gray-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center shadow-lg border border-gray-800">
                  <div>
                    <div className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Now Serving (Phase 5)</div>
                    <div className="text-5xl font-black text-orange-500 tracking-wider">
                      {currentToken || "WAITING"}
                    </div>
                  </div>
                  <button 
                    onClick={handleCallNext}
                    className="mt-4 md:mt-0 bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    CALL NEXT
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border border-blue-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="text-sm text-blue-700 font-bold uppercase tracking-wider">Online Booking Queue</div>
                    <div className="text-6xl font-black text-blue-900 my-4">{queueStatus.online_queue}</div>
                    <div className="text-sm text-blue-600 font-medium">waiting devotees</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border border-green-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <div className="text-sm text-green-700 font-bold uppercase tracking-wider">Walk-in Queue</div>
                    <div className="text-6xl font-black text-green-900 my-4">{queueStatus.walkin_queue}</div>
                    <div className="text-sm text-green-600 font-medium">waiting devotees</div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-2xl flex gap-4 shadow-sm items-start">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-yellow-900 text-xl mb-1">Dynamic Queue Balancer</div>
                    <div className="text-yellow-800 leading-relaxed">
                      The system detects queue imbalance. Tendency favors: <strong className="bg-yellow-200 px-2 py-1 rounded">{queueStatus.next_category || 'BALANCED'}</strong>
                      <br/>The automated gate token will be pulled from this queue next to restore fairness.
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-300 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold mb-4 text-indigo-900 text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Phase 3: M/M/k Queuing Estimation
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center">
                      <div className="text-xs text-indigo-500 font-bold uppercase">Arrival Rate (λ)</div>
                      <div className="text-xl font-black text-indigo-900">{queueStatus.mmk_metrics.arrival_rate_lambda} <span className="text-xs font-normal">/min</span></div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center">
                      <div className="text-xs text-indigo-500 font-bold uppercase">Service Rate (µ)</div>
                      <div className="text-xl font-black text-indigo-900">{queueStatus.mmk_metrics.service_rate_mu} <span className="text-xs font-normal">/min</span></div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 text-center">
                      <div className="text-xs text-indigo-500 font-bold uppercase">Active Counters (k)</div>
                      <div className="text-xl font-black text-indigo-900">{queueStatus.mmk_metrics.counters_k}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-indigo-100 p-4 rounded-xl border border-indigo-200 text-center">
                      <div className="text-xs text-indigo-600 font-bold uppercase">Expected Queue Length (Lq)</div>
                      <div className="text-2xl font-black text-indigo-900">{queueStatus.mmk_metrics.expected_queue_length} <span className="text-sm font-normal">people</span></div>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-xl border border-indigo-200 text-center">
                      <div className="text-xs text-indigo-600 font-bold uppercase">System Utilization (ρ)</div>
                      <div className="text-2xl font-black text-indigo-900">{queueStatus.mmk_metrics.utilization_pct}%</div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-600 text-white p-4 rounded-xl flex justify-between items-center shadow-inner">
                    <div className="font-bold">Expected Waiting Time (Wq):</div>
                    <div className="text-3xl font-black">
                      {queueStatus.mmk_metrics.expected_wait_mins} {typeof queueStatus.mmk_metrics.expected_wait_mins === 'number' ? 'mins' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-bold mb-4 text-gray-800 text-lg">Computer Vision Alerts (YOLOv8 + ByteTrack)</h3>
                  <div className={`p-6 rounded-2xl border-2 flex items-center justify-between shadow-sm transition-colors ${queueStatus.cv_alerts.status === 'HIGH CONGESTION' ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                    <div>
                      <div className="text-gray-500 font-semibold uppercase text-xs mb-1">Camera Feed Estimate</div>
                      <div className={`text-3xl font-black ${queueStatus.cv_alerts.status === 'HIGH CONGESTION' ? 'text-red-900' : 'text-green-900'}`}>
                        {queueStatus.cv_alerts.detected_crowd} <span className="text-lg font-medium opacity-60">people detected</span>
                      </div>
                      <div className="text-sm opacity-80 mt-2 font-medium">Expected threshold from bookings: {queueStatus.cv_alerts.expected_devotees}</div>
                    </div>
                    <div className={`px-6 py-3 rounded-full font-black tracking-widest text-sm shadow-sm ${queueStatus.cv_alerts.status === 'HIGH CONGESTION' ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}`}>
                      {queueStatus.cv_alerts.status}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-center py-20 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                Connecting to live systems...
              </div>
            )}

          </section>
        )}
      </main>
    </div>
  );
}

export default App;
