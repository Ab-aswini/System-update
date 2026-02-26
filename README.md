# SysOptimizer
**A Custom Browser Optimizer Application for Windows**

A pristine, incredibly fast application to manage your system performance with a single click across your browser.

## Features Built
1. **Interactive Dashboard:** Wrote a sleek, dark-mode CSS dashboard with distinct "Cards" for the performance modes.
2. **Power Plan Toggles:** Wired buttons directly to the Windows `powercfg` controller via local `fetch` calls. Clicking "Beast Mode" instantly revs up your hardware, while "Eco Mode" conserves battery.
3. **RAM & Disk Cleaner:** Implemented a one-click button that bypasses system caches and flushes temporary junk files automatically.
4. **Real-Time Hardware Monitor:** Built a responsive live dashboard at the top of the interface that polls your system every 2.5 seconds to display your current CPU Load, CPU Temperature, RAM Usage, and Battery Status. The dashboard dynamically turns red or yellow to warn you of thermal throttling or memory hogs.

## Tech Stack
Based on speed and stability requirements, we instantiated the application in:
- **Backend API:** Node.js / Express (for direct, secure access to Windows PowerShell and native OS APIs via REST).
- **Frontend UI:** React and Vite (to construct the beautiful, heavily stylized "glassmorphic" interface inside your browser of choice).

## How to Test It
The source code has been written and successfully compiled into this repository!

To see it in action locally:
1. Clone this repository to your machine.
2. Open up a fresh terminal or command prompt inside the project folder.
3. Type `npm install`
4. Type `npm run dev`

This will boot up the framework! Open your browser and go to `http://localhost:5173` to view the beautiful UI interface. Click the buttons to optimize your computer instantly!
