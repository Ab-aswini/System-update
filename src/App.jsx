import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [status, setStatus] = useState('Checking system status...');
  const [activeMode, setActiveMode] = useState('');
  const [sysStats, setSysStats] = useState(null);

  useEffect(() => {
    // 1. Fetch current power plan on load
    const fetchCurrentPlan = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/current-power-plan');
        const result = await response.json();
        if (result.success && result.guid) {
          const modes = {
            '87fb05ad-41b0-46c9-87ca-d6488cdb8f08': 'Beast',
            '381b4222-f694-41f0-9685-ff5bb260df2e': 'Balanced',
            'a1841308-3541-4fab-bc81-f71556f20b4a': 'Eco'
          };
          const detectedMode = modes[result.guid] || 'Custom';
          setActiveMode(detectedMode);
          setStatus(`Ready. Current active plan: ${result.name} (${detectedMode} Mode)`);
        } else {
          setStatus('Ready. Could not automatically detect power plan.');
        }
      } catch (err) {
        setStatus(`Execution Error: Backend server is offline!`);
      }
    };
    fetchCurrentPlan();

    // 2. Poll System Stats every 2.5 seconds
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/system-stats');
        const result = await response.json();
        if (result.success) setSysStats(result);
      } catch (err) {
        console.error("Could not fetch vital stats:", err);
      }
    };

    fetchStats(); // Initial fetch
    const intervalId = setInterval(fetchStats, 2500);
    return () => clearInterval(intervalId);
  }, []);

  // Instead of Electron IPC, we send a rest API call to the local Express backend
  const runCommand = async (command, description) => {
    setStatus(`Running: ${description}...`);
    try {
      const response = await fetch('http://localhost:3001/api/run-powershell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const result = await response.json();

      if (result.success) {
        setStatus(`Success: ${description} completed.`);
      } else {
        setStatus(`Error: ${result.error || result.stderr}`);
      }
    } catch (err) {
      setStatus(`Execution Error: Backend server is offline!`);
    }
  };

  const setPowerPlan = async (mode, guid) => {
    setActiveMode(mode);
    await runCommand(`powercfg /setactive ${guid}`, `Activating ${mode} Power Plan`);
  };

  const cleanJunk = async () => {
    const cmd = `Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue`;
    await runCommand(cmd, 'Cleaning Temp Folders');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>SysOptimizer</h1>
        <p className="subtitle">Performance Tuning Dashboard</p>
      </header>

      {/* --- LIVE SYSTEM DASHBOARD --- */}
      {sysStats && (
        <div className="dashboard">
          <div className={`stat-box ${parseFloat(sysStats.cpu.load) > 85 ? 'danger' : ''}`}>
            <div className="icon">🧠</div>
            <div className="value">{sysStats.cpu.load}%</div>
            <div className="label">CPU Load</div>
          </div>

          <div className={`stat-box ${sysStats.cpu.temperature && sysStats.cpu.temperature > 80 ? 'danger' : ''}`}>
            <div className="icon">🌡️</div>
            <div className="value">
              {sysStats.cpu.temperature ? `${sysStats.cpu.temperature}°C` : 'N/A'}
            </div>
            <div className="label">CPU Temp</div>
          </div>

          <div className={`stat-box ${parseFloat(sysStats.memory.usagePercent) > 90 ? 'danger' : parseFloat(sysStats.memory.usagePercent) > 75 ? 'warning' : ''}`}>
            <div className="icon">💾</div>
            <div className="value">{sysStats.memory.usagePercent}%</div>
            <div className="label">RAM Usage</div>
          </div>

          {sysStats.battery.hasBattery && (
            <div className={`stat-box ${sysStats.battery.percent < 20 ? 'danger' : ''}`}>
              <div className="icon">{sysStats.battery.isCharging ? '⚡' : '🔋'}</div>
              <div className="value">{sysStats.battery.percent}%</div>
              <div className="label">Battery</div>
            </div>
          )}
        </div>
      )}

      <div className="cards-grid">
        <div className={`card ${activeMode === 'Beast' ? 'active' : ''}`} onClick={() => setPowerPlan('Beast', '87fb05ad-41b0-46c9-87ca-d6488cdb8f08')}>
          <div className="icon">🚀</div>
          <h2>Beast Mode</h2>
          <p>Unlocks 'Ultimate Performance' plan & prioritizes CPU clocks.</p>
        </div>

        <div className={`card ${activeMode === 'Balanced' ? 'active' : ''}`} onClick={() => setPowerPlan('Balanced', '381b4222-f694-41f0-9685-ff5bb260df2e')}>
          <div className="icon">⚖️</div>
          <h2>Balanced</h2>
          <p>Standard Windows operation optimized for typical use.</p>
        </div>

        <div className={`card ${activeMode === 'Eco' ? 'active' : ''}`} onClick={() => setPowerPlan('Eco', 'a1841308-3541-4fab-bc81-f71556f20b4a')}>
          <div className="icon">🔋</div>
          <h2>Eco Mode</h2>
          <p>Battery saver activated, CPU gets throttled for longevity.</p>
        </div>
      </div>

      <div className="tools-section">
        <h3>System Tools</h3>
        <button className="btn primary" onClick={cleanJunk}>🧹 Deep Clean RAM & Disk</button>
        <button className="btn secondary" onClick={() => runCommand('ipconfig /flushdns', 'Flushing DNS Cache')}>🌐 Flush DNS Cache</button>
      </div>

      <footer className="status-bar">
        <div className={`status-indicator ${status.includes('Error') ? 'error' : status.includes('Ready') ? 'ready' : 'running'}`}></div>
        <span>{status}</span>
      </footer>
    </div>
  );
}

export default App;
