"use strict";
// Simple test script to verify the fullscreen toggle functionality
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
let mainWindow = null;
let isFullscreen = false;
let preFullscreenState = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile('index.html');
    // Test the toggleFullscreen function
    setTimeout(() => {
        console.log('Testing toggleFullscreen...');
        toggleFullscreen();
        // Toggle back after 2 seconds
        setTimeout(() => {
            console.log('Toggling back to normal mode...');
            toggleFullscreen();
            // Exit after another 2 seconds
            setTimeout(() => {
                console.log('Test completed successfully!');
                electron_1.app.quit();
            }, 2000);
        }, 2000);
    }, 2000);
}
function toggleFullscreen() {
    if (!mainWindow) {
        console.warn("Main window does not exist.");
        return;
    }
    if (!isFullscreen) {
        // Save current state before going fullscreen
        const bounds = mainWindow.getBounds();
        preFullscreenState = {
            position: { x: bounds.x, y: bounds.y },
            size: { width: bounds.width, height: bounds.height },
            alwaysOnTop: mainWindow.isAlwaysOnTop()
        };
        // Get the primary display dimensions
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        // Set window to fullscreen-like state
        mainWindow.setAlwaysOnTop(true, "screen-saver");
        mainWindow.setPosition(0, 0);
        mainWindow.setSize(width, height);
        mainWindow.setResizable(false);
        console.log(`Set to fullscreen mode: ${width}x${height}`);
        isFullscreen = true;
    }
    else {
        // Restore previous state
        if (preFullscreenState) {
            const { position, size, alwaysOnTop } = preFullscreenState;
            if (position && size) {
                mainWindow.setResizable(true);
                mainWindow.setBounds({
                    x: position.x,
                    y: position.y,
                    width: size.width,
                    height: size.height
                });
                mainWindow.setAlwaysOnTop(alwaysOnTop);
                console.log(`Restored to normal mode: ${size.width}x${size.height} at (${position.x}, ${position.y})`);
            }
        }
        isFullscreen = false;
    }
    // Make sure the window is visible
    if (!mainWindow.isVisible()) {
        mainWindow.show();
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=test-fullscreen.js.map