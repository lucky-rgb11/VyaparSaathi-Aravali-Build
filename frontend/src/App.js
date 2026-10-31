import React, { useState } from 'react';
import './App.css';

const translations = {
  hi: { welcome: "Swagat hai", downloadReport: "📄 Loan Report", netProfit: "Shuddh Munafa", totalSales: "Kul Bikri", totalExpenses: "Kul Kharche", askAiTitle: "✨ AI Voice Assistant", placeholder: "Mic dabayein ya type karein...", thinking: "Soch raha hoon...", askBtn: "Poocho", stopAudio: "🔇 Chup Karao", recentTrans: "Haal Hi Ke Len-Den", addSale: "+ Bikri Jodein", addExp: "- Kharcha Jodein" },
  en: { welcome: "Welcome back", downloadReport: "📄 Download Report", netProfit: "Net Profit", totalSales: "Total Sales", totalExpenses: "Total Expenses", askAiTitle: "✨ AI Voice Assistant", placeholder: "Tap mic or type here...", thinking: "Thinking...", askBtn: "Ask", stopAudio: "🔇 Stop Audio", recentTrans: "Recent Transactions", addSale: "+ Add Sale", addExp: "- Add Expense" }
};

const dummyTransactions = [
  { id: 1, date: "31 Oct 2026", type: "Sale", amount: "+₹4,500", desc: "Suresh Wholesalers" },
  { id: 2, date: "30 Oct 2026", type: "Expense", amount: "-₹1,200", desc: "Bijli Ka Bill" },
  { id: 3, date: "29 Oct 2026", type: "Sale", amount: "+₹850", desc: "Dukaan Counter Cash" },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null); // 'phone' or null
  const [user] = useState({ displayName: 'Ramesh' }); 
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [usedMic, setUsedMic] = useState(false);
  const [lang, setLang] = useState('hi'); 

  const t = translations[lang];

  // Demo Login Handler
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.onstart = () => { setIsListening(true); setUsedMic(true); };
      recognition.onresult = (event) => setQuestion(event.results[0][0].transcript);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("Voice typing is not supported in this browser.");
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const askAI = async () => {
    if (!question) return;
    setAiResponse(t.thinking);
    stopSpeaking();
    try {
      const res = await fetch('http://localhost:8080/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language: lang })
      });
      const data = await res.json();
      setAiResponse(data.answer);
      if (usedMic) speakText(data.answer);
    } catch(e) {
      setAiResponse("Server error. Check if backend is running.");
    }
  };

  const downloadReport = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/report');
      const data = await res.json();
      const element = document.createElement("a");
      const file = new Blob([`VYAPARSAATHI REPORT\n\n${data.report}\n\nStatus: ${data.status}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "Business_Report.txt";
      document.body.appendChild(element);
      element.click();
    } catch(e) {
      alert("Backend server must be running.");
    }
  };

  // ---------------- LOGIN SCREEN UI ----------------
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="logo-area" style={{justifyContent: 'center', marginBottom: '15px'}}>
            <img src="/image.png" alt="Vyapar Saathi Logo" className="app-logo" style={{height: '70px'}} />
          </div>
          <h2 style={{color: '#2d3748', marginBottom: '25px', fontSize: '22px'}}>VyaparSaathi mein Swagat hai</h2>
          
          {!loginMethod ? (
            <div className="auth-buttons">
              <button className="auth-btn google" onClick={handleLogin}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                Gmail se Login karein
              </button>
              <div className="divider"><span>YA</span></div>
              <button className="auth-btn phone" onClick={() => setLoginMethod('phone')}>
                📱 Phone Number se Login karein
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="phone-login-form">
              <label>Phone Number darj karein:</label>
              <div className="phone-input-group">
                <span className="country-code">+91</span>
                <input type="tel" placeholder="9876543210" required maxLength="10" pattern="[0-9]{10}" autoFocus />
              </div>
              <button type="submit" className="auth-btn submit">OTP Bhejein / Login</button>
              <button type="button" className="back-btn" onClick={() => setLoginMethod(null)}>Peeche jayein</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ---------------- DASHBOARD UI ----------------
  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <header className="app-header">
          <div className="logo-area"><img src="/image.png" alt="Vyapar Saathi Logo" className="app-logo" /></div>
          <div className="actions-area">
            <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="hi">हिंदी / Hinglish</option>
              <option value="en">English</option>
            </select>
            <button className="report-btn" onClick={downloadReport}>{t.downloadReport}</button>
          </div>
        </header>
        
        <div className="welcome-section">
          <p className="welcome-text">{t.welcome}, {user.displayName} ji!</p>
          <div className="quick-actions">
             <button className="action-btn sale">{t.addSale}</button>
             <button className="action-btn exp">{t.addExp}</button>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="card profit"><h3>{t.netProfit}</h3><h2>₹46,600</h2><p className="trend">↑ 12% vs last month</p></div>
          <div className="card"><h3>{t.totalSales}</h3><h2>₹1,25,000</h2></div>
          <div className="card"><h3>{t.totalExpenses}</h3><h2>₹78,400</h2></div>
        </div>

        <div className="main-content">
          <div className="ai-chat">
            <div className="ai-header">
              <h3>{t.askAiTitle} 🎙️</h3>
              {isSpeaking && <button className="stop-btn" onClick={stopSpeaking}>{t.stopAudio}</button>}
            </div>
            <div className="input-group">
              <input type="text" value={question} onChange={(e) => {setQuestion(e.target.value); setUsedMic(false);}} placeholder={t.placeholder} />
              <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={startListening}>{isListening ? '🔴' : '🎤'}</button>
              <button className="ask-btn" onClick={askAI}>{t.askBtn}</button>
            </div>
            {aiResponse && <div className="response">
               <div className="response-text">{aiResponse}</div>
               {!isSpeaking && aiResponse !== t.thinking && (
                   <button className="replay-btn" onClick={() => speakText(aiResponse)}>🔊 Suno</button>
               )}
            </div>}
          </div>

          <div className="transactions">
            <h3>{t.recentTrans} 📊</h3>
            <div className="table-responsive">
              <table className="trans-table">
                <tbody>
                  {dummyTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td><div className="tx-date">{tx.date}</div><div className="tx-desc">{tx.desc}</div></td>
                      <td className={tx.type === 'Sale' ? 'tx-green' : 'tx-red'}>{tx.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default App;