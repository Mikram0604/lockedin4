import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Bell, Users, ShieldAlert, Activity, Search, Send, MessageCircle, ChevronRight, Phone, MoreVertical, Check, CheckCheck } from 'lucide-react';

const API_URL = 'http://localhost:5005';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<><Header title="Dashboard Overview" /><div className="flex-1 overflow-auto p-8"><DashboardOverview /></div></>} />
            <Route path="/alerts" element={<><Header title="Critical Alerts" /><div className="flex-1 overflow-auto p-8"><Alerts /></div></>} />
            <Route path="/chat" element={<WhatsAppChat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <span className="bg-indigo-100 p-2 rounded-lg"><Activity size={24} /></span>
          Disha
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Counselor Dashboard</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Users size={20} /> Students
        </Link>
        <Link to="/alerts" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/alerts') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <ShieldAlert size={20} /> Alerts
          <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold">1</span>
        </Link>
        <Link to="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/chat') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <MessageCircle size={20} /> Student Chat
          <span className="ml-auto bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs font-bold">Live</span>
        </Link>
      </nav>
      <div className="p-4 mx-4 mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
        <p className="text-xs font-semibold opacity-80">HACKATHON DEMO</p>
        <p className="text-sm mt-1">Try the Student Chat to see Disha in action!</p>
      </div>
    </aside>
  );
}

function Header({ title }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search students..." className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-64" />
        </div>
        <button className="relative p-2 text-gray-500 hover:text-gray-700"><Bell size={20} /><span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span></button>
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">C</div>
      </div>
    </header>
  );
}

function WhatsAppChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const phone = '+919999999999';

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, phone })
      });
      const data = await res.json();
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { text: data.reply, sender: 'bot', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
      }, 800);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: "Connection error. Make sure the backend server is running.", sender: 'bot', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center font-bold text-lg">D</div>
        <div className="flex-1">
          <h3 className="font-semibold text-base">Disha दिशा</h3>
          <p className="text-xs text-green-200">{isTyping ? 'typing...' : 'online'}</p>
        </div>
        <Phone size={20} className="opacity-70" />
        <MoreVertical size={20} className="opacity-70" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-4 space-y-2" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'a\' patternUnits=\'userSpaceOnUse\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M0 20h40M20 0v40\' fill=\'none\' stroke=\'%23e5ddd5\' stroke-width=\'.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' fill=\'%23ECE5DD\' /%3E%3Crect width=\'200\' height=\'200\' fill=\'url(%23a)\' opacity=\'.3\'/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }}>
        
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-[#25d366] flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">D</span>
            </div>
            <h3 className="text-xl font-bold text-gray-700">Disha दिशा</h3>
            <p className="text-gray-500 mt-2 max-w-sm">AI-Powered Companion for First-Generation College Students</p>
            <p className="text-gray-400 mt-4 text-sm">Send <strong>"Hi"</strong> to start your journey</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user' 
                ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none'
            }`}>
              {msg.text}
              <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                <span className="text-[10px] text-gray-500">{msg.time}</span>
                {msg.sender === 'user' && <CheckCheck size={14} className="text-blue-500" />}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f0f0] px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-full bg-white border-none outline-none text-sm shadow-sm"
        />
        <button
          onClick={sendMessage}
          className="w-10 h-10 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-[#064e46] transition-colors shadow-sm"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/students`).then(r => r.json()).then(data => { setStudents(data); setLoading(false); }).catch(() => {
      setStudents([
        { id: 1, full_name: 'Priya M.', college_name: 'BMS College of Engineering', branch: 'CSE 2nd Year', fee_payment_status: 'Pending', risk_score: 11, status: 'CRITICAL', silent_days: 9 },
        { id: 2, full_name: 'Rahul K.', college_name: 'RV College', branch: 'Mech 1st Year', fee_payment_status: 'Paid', risk_score: 2, status: 'LOW', silent_days: 1 },
        { id: 3, full_name: 'Anjali S.', college_name: 'PES University', branch: 'ECE 3rd Year', fee_payment_status: 'Partial', risk_score: 5, status: 'MEDIUM', silent_days: 4 }
      ]);
      setLoading(false);
    });
  }, []);

  const sendCheckIn = (name) => {
    fetch(`${API_URL}/api/checkin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentName: name }) })
      .then(() => alert(`✅ Check-in message sent to ${name} via WhatsApp!`));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="342" icon={<Users className="text-blue-500" />} bg="bg-blue-50" />
        <StatCard title="At-Risk (High/Critical)" value="12" icon={<ShieldAlert className="text-red-500" />} bg="bg-red-50" text="text-red-600" />
        <StatCard title="Active Applications" value="89" icon={<Activity className="text-amber-500" />} bg="bg-amber-50" />
        <StatCard title="Nudges Sent (Today)" value="45" icon={<Bell className="text-indigo-500" />} bg="bg-indigo-50" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">At-Risk Watchlist</h3>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">College & Branch</th>
              <th className="px-6 py-4 font-semibold">Risk Level</th>
              <th className="px-6 py-4 font-semibold">Silence</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : (
              students.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)).map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4"><div className="font-semibold text-gray-900">{s.full_name}</div><div className="text-xs text-gray-500 mt-1">Fee: {s.fee_payment_status}</div></td>
                  <td className="px-6 py-4 text-gray-600"><div>{s.college_name}</div><div className="text-xs text-gray-400 mt-0.5">{s.branch}</div></td>
                  <td className="px-6 py-4"><RiskBadge status={s.status} score={s.risk_score} /></td>
                  <td className="px-6 py-4"><div className={`font-medium ${s.silent_days >= 7 ? 'text-red-600' : 'text-gray-600'}`}>{s.silent_days} days</div></td>
                  <td className="px-6 py-4 text-right">
                    {(s.status === 'CRITICAL' || s.status === 'HIGH') ? (
                      <button onClick={() => sendCheckIn(s.full_name)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-colors">Send Check-in</button>
                    ) : (
                      <button className="p-2 text-gray-400 hover:text-indigo-600"><ChevronRight size={20} /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Alerts() {
  const sendCheckIn = () => alert('✅ Check-in message sent to Priya M. via WhatsApp!');
  const markResolved = () => alert('✅ Alert marked as resolved.');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-red-100 bg-red-50 flex items-center gap-3">
          <ShieldAlert className="text-red-600" />
          <h3 className="text-lg font-bold text-red-900">Critical Alerts Inbox</h3>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg">PM</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Priya M.</h4>
                <p className="text-gray-600 mt-1">Risk Score: <strong className="text-red-600">11 (CRITICAL)</strong>. Student has been silent for 9 days. Fee is marked as unpaid. NSP Scholarship deadline missed.</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">BMS College of Engineering</span>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">CSE 2nd Year</span>
                  <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-md">9 days silent</span>
                  <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-md">Fee unpaid</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <button onClick={sendCheckIn} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-lg shadow-sm transition-all text-sm whitespace-nowrap">Send Check-in</button>
              <button onClick={markResolved} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-all text-sm whitespace-nowrap">Mark Resolved</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg, text = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div><p className="text-sm font-medium text-gray-500 mb-1">{title}</p><h4 className={`text-3xl font-bold ${text}`}>{value}</h4></div>
      <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
    </div>
  );
}

function RiskBadge({ status, score }) {
  const styles = { LOW: "bg-green-50 text-green-700 border-green-200", MEDIUM: "bg-amber-50 text-amber-700 border-amber-200", HIGH: "bg-orange-50 text-orange-700 border-orange-200", CRITICAL: "bg-red-50 text-red-700 border-red-200 font-bold shadow-sm" };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs border flex items-center w-fit gap-1.5 ${styles[status]}`}>
      {status === 'CRITICAL' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
      {status} {score ? `(${score})` : ''}
    </span>
  );
}

export default App;
