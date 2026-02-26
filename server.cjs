const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const si = require('systeminformation');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/run-powershell', (req, res) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    exec(`powershell -Command "${command}"`, (error, stdout, stderr) => {
        if (error) {
            res.json({ error: error.message, stderr, success: false });
        } else {
            res.json({ stdout, stderr, success: true });
        }
    });
});

app.get('/api/current-power-plan', (req, res) => {
    exec('powercfg /getactivescheme', (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({ error: error.message, success: false });
        } else {
            const guidMatch = stdout.match(/GUID: (\S+)/);
            const nameMatch = stdout.match(/\(([^)]+)\)/);
            res.json({
                success: true,
                guid: guidMatch ? guidMatch[1] : null,
                name: nameMatch ? nameMatch[1] : 'Unknown',
                raw: stdout
            });
        }
    });
});

app.get('/api/system-stats', async (req, res) => {
    try {
        const [cpuData, currentLoad, memData, batteryData, cpuTemp] = await Promise.all([
            si.cpu(),
            si.currentLoad(),
            si.mem(),
            si.battery(),
            si.cpuTemperature()
        ]);

        res.json({
            success: true,
            cpu: {
                manufacturer: cpuData.manufacturer,
                brand: cpuData.brand,
                speed: cpuData.speed,
                cores: cpuData.cores,
                load: currentLoad.currentLoad.toFixed(1),
                temperature: cpuTemp.main > 0 ? cpuTemp.main : null
            },
            memory: {
                total: memData.total,
                used: memData.active,
                free: memData.available,
                usagePercent: ((memData.active / memData.total) * 100).toFixed(1)
            },
            battery: {
                hasBattery: batteryData.hasBattery,
                percent: batteryData.percent,
                isCharging: batteryData.isCharging
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend Optimizer Service running on http://localhost:${PORT}`);
});
