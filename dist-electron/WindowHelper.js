"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowHelper = void 0;
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const isDev = process.env.NODE_ENV === "development";
const startUrl = isDev
    ? "http://localhost:5180"
    : `file://${node_path_1.default.join(__dirname, "../dist/index.html")}`;
class WindowHelper {
    mainWindow = null;
    isWindowVisible = false;
    windowPosition = null;
    windowSize = null;
    appState;
    isFullscreen = false;
    preFullscreenState = null;
    // Initialize with explicit number type and 0 value
    screenWidth = 0;
    screenHeight = 0;
    step = 0;
    currentX = 0;
    currentY = 0;
    constructor(appState) {
        this.appState = appState;
    }
    setWindowDimensions(width, height) {
        if (!this.mainWindow || this.mainWindow.isDestroyed())
            return;
        // Get current window position
        const [currentX, currentY] = this.mainWindow.getPosition();
        // Get screen dimensions
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const workArea = primaryDisplay.workAreaSize;
        // Use 75% width if debugging has occurred, otherwise use 60%
        const maxAllowedWidth = Math.floor(workArea.width * (this.appState.getHasDebugged() ? 0.75 : 0.5));
        // Ensure width doesn't exceed max allowed width and height is reasonable
        const newWidth = Math.min(width + 32, maxAllowedWidth);
        const newHeight = Math.ceil(height);
        // Center the window horizontally if it would go off screen
        const maxX = workArea.width - newWidth;
        const newX = Math.min(Math.max(currentX, 0), maxX);
        // Update window bounds
        this.mainWindow.setBounds({
            x: newX,
            y: currentY,
            width: newWidth,
            height: newHeight
        });
        // Update internal state
        this.windowPosition = { x: newX, y: currentY };
        this.windowSize = { width: newWidth, height: newHeight };
        this.currentX = newX;
    }
    createWindow() {
        if (this.mainWindow !== null)
            return;
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const workArea = primaryDisplay.workAreaSize;
        this.screenWidth = workArea.width;
        this.screenHeight = workArea.height;
        this.step = Math.floor(this.screenWidth / 10); // 10 steps
        this.currentX = 0; // Start at the left
        const windowSettings = {
            height: 600,
            minWidth: undefined,
            maxWidth: undefined,
            x: this.currentX,
            y: 0,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: node_path_1.default.join(__dirname, "preload.js")
            },
            show: true,
            alwaysOnTop: true,
            frame: false,
            transparent: true,
            fullscreenable: false,
            hasShadow: false,
            backgroundColor: "#00000000",
            focusable: true
        };
        this.mainWindow = new electron_1.BrowserWindow(windowSettings);
        // this.mainWindow.webContents.openDevTools()
        this.mainWindow.setContentProtection(true);
        if (process.platform === "darwin") {
            this.mainWindow.setVisibleOnAllWorkspaces(true, {
                visibleOnFullScreen: true
            });
            this.mainWindow.setHiddenInMissionControl(true);
            this.mainWindow.setAlwaysOnTop(true, "floating");
        }
        if (process.platform === "linux") {
            // Linux-specific optimizations for stealth overlays
            if (this.mainWindow.setHasShadow) {
                this.mainWindow.setHasShadow(false);
            }
            this.mainWindow.setFocusable(false);
        }
        this.mainWindow.setSkipTaskbar(true);
        this.mainWindow.setAlwaysOnTop(true);
        this.mainWindow.loadURL(startUrl).catch((err) => {
            console.error("Failed to load URL:", err);
        });
        const bounds = this.mainWindow.getBounds();
        this.windowPosition = { x: bounds.x, y: bounds.y };
        this.windowSize = { width: bounds.width, height: bounds.height };
        this.currentX = bounds.x;
        this.currentY = bounds.y;
        this.setupWindowListeners();
        this.isWindowVisible = true;
    }
    setupWindowListeners() {
        if (!this.mainWindow)
            return;
        this.mainWindow.on("move", () => {
            if (this.mainWindow) {
                const bounds = this.mainWindow.getBounds();
                this.windowPosition = { x: bounds.x, y: bounds.y };
                this.currentX = bounds.x;
                this.currentY = bounds.y;
            }
        });
        this.mainWindow.on("resize", () => {
            if (this.mainWindow) {
                const bounds = this.mainWindow.getBounds();
                this.windowSize = { width: bounds.width, height: bounds.height };
            }
        });
        this.mainWindow.on("closed", () => {
            this.mainWindow = null;
            this.isWindowVisible = false;
            this.windowPosition = null;
            this.windowSize = null;
        });
    }
    getMainWindow() {
        return this.mainWindow;
    }
    isVisible() {
        return this.isWindowVisible;
    }
    hideMainWindow() {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
            console.warn("Main window does not exist or is destroyed.");
            return;
        }
        const bounds = this.mainWindow.getBounds();
        this.windowPosition = { x: bounds.x, y: bounds.y };
        this.windowSize = { width: bounds.width, height: bounds.height };
        this.mainWindow.hide();
        this.isWindowVisible = false;
    }
    showMainWindow() {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
            console.warn("Main window does not exist or is destroyed.");
            return;
        }
        if (this.windowPosition && this.windowSize) {
            this.mainWindow.setBounds({
                x: this.windowPosition.x,
                y: this.windowPosition.y,
                width: this.windowSize.width,
                height: this.windowSize.height
            });
        }
        this.mainWindow.showInactive();
        this.isWindowVisible = true;
    }
    toggleMainWindow() {
        if (this.isWindowVisible) {
            this.hideMainWindow();
        }
        else {
            this.showMainWindow();
        }
    }
    // New methods for window movement
    moveWindowRight() {
        if (!this.mainWindow)
            return;
        const windowWidth = this.windowSize?.width || 0;
        const halfWidth = windowWidth / 2;
        // Ensure currentX and currentY are numbers
        this.currentX = Number(this.currentX) || 0;
        this.currentY = Number(this.currentY) || 0;
        this.currentX = Math.min(this.screenWidth - halfWidth, this.currentX + this.step);
        this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY));
    }
    moveWindowLeft() {
        if (!this.mainWindow)
            return;
        const windowWidth = this.windowSize?.width || 0;
        const halfWidth = windowWidth / 2;
        // Ensure currentX and currentY are numbers
        this.currentX = Number(this.currentX) || 0;
        this.currentY = Number(this.currentY) || 0;
        this.currentX = Math.max(-halfWidth, this.currentX - this.step);
        this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY));
    }
    moveWindowDown() {
        if (!this.mainWindow)
            return;
        const windowHeight = this.windowSize?.height || 0;
        const halfHeight = windowHeight / 2;
        // Ensure currentX and currentY are numbers
        this.currentX = Number(this.currentX) || 0;
        this.currentY = Number(this.currentY) || 0;
        this.currentY = Math.min(this.screenHeight - halfHeight, this.currentY + this.step);
        this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY));
    }
    moveWindowUp() {
        if (!this.mainWindow)
            return;
        const windowHeight = this.windowSize?.height || 0;
        const halfHeight = windowHeight / 2;
        // Ensure currentX and currentY are numbers
        this.currentX = Number(this.currentX) || 0;
        this.currentY = Number(this.currentY) || 0;
        this.currentY = Math.max(-halfHeight, this.currentY - this.step);
        this.mainWindow.setPosition(Math.round(this.currentX), Math.round(this.currentY));
    }
    /**
     * Toggles the window between fullscreen and normal mode
     * In fullscreen mode, the window will be visible across the whole screen
     * In normal mode, it will return to its previous size and position
     */
    toggleFullscreen() {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
            console.warn("Main window does not exist or is destroyed.");
            return;
        }
        if (!this.isFullscreen) {
            // Save current state before going fullscreen
            const bounds = this.mainWindow.getBounds();
            this.preFullscreenState = {
                position: { x: bounds.x, y: bounds.y },
                size: { width: bounds.width, height: bounds.height },
                alwaysOnTop: this.mainWindow.isAlwaysOnTop()
            };
            // Get the primary display dimensions
            const primaryDisplay = electron_1.screen.getPrimaryDisplay();
            const { width, height } = primaryDisplay.workAreaSize;
            // Set window to fullscreen-like state
            this.mainWindow.setAlwaysOnTop(true, "screen-saver");
            this.mainWindow.setPosition(0, 0);
            this.mainWindow.setSize(width, height);
            this.mainWindow.setResizable(false);
            // Update internal state
            this.isFullscreen = true;
            this.isWindowVisible = true;
            this.windowPosition = { x: 0, y: 0 };
            this.windowSize = { width, height };
            this.currentX = 0;
            this.currentY = 0;
        }
        else {
            // Restore previous state
            if (this.preFullscreenState) {
                const { position, size, alwaysOnTop } = this.preFullscreenState;
                if (position && size) {
                    this.mainWindow.setResizable(true);
                    this.mainWindow.setBounds({
                        x: position.x,
                        y: position.y,
                        width: size.width,
                        height: size.height
                    });
                    // Restore alwaysOnTop setting
                    if (process.platform === "darwin") {
                        this.mainWindow.setAlwaysOnTop(true, "floating");
                    }
                    else {
                        this.mainWindow.setAlwaysOnTop(alwaysOnTop);
                    }
                    // Update internal state
                    this.windowPosition = position;
                    this.windowSize = size;
                    this.currentX = position.x;
                    this.currentY = position.y;
                }
            }
            this.isFullscreen = false;
        }
        // Make sure the window is visible
        if (!this.mainWindow.isVisible()) {
            this.mainWindow.show();
        }
    }
}
exports.WindowHelper = WindowHelper;
//# sourceMappingURL=WindowHelper.js.map