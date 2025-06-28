# Free Cluely

![Free Cluely Logo](https://github.com/unmatched78/free-cluely/blob/main/public/logo.png?raw=true)

A powerful desktop application that uses Google's Gemini AI to help you solve problems, answer questions, and provide assistance across various domains. Free Cluely captures your screen, analyzes the content, and generates intelligent solutions in real-time.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
  - [Docker Mode](#docker-mode)
  - [Convenient Scripts](#convenient-scripts)
- [Usage Guide](#usage-guide)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Project Structure](#project-structure)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

Free Cluely is an Electron-based desktop application that combines the power of React for the frontend and Node.js for the backend. It uses Google's Gemini AI to analyze screenshots and provide intelligent solutions to problems displayed on your screen. The application is designed to be always accessible, floating on top of other windows, making it perfect for quick problem-solving without disrupting your workflow.

## ✨ Features

- **Screenshot Analysis**: Capture your screen and get AI-powered solutions
- **Floating Window**: Always stays on top for easy access
- **Fullscreen Mode**: Expand the application to cover your entire screen
- **Keyboard Shortcuts**: Quick access to all features
- **Dark/Light Mode**: Comfortable viewing in any environment
- **History**: Save and access your previous queries and solutions
- **TypeScript Support**: Fully typed codebase for better development experience
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.x or higher)
- **npm** (v8.x or higher)
- **Git**
- **Docker** (optional, for containerized setup)
- **A Gemini API key** (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 📥 Installation

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/unmatched78/free-cluely.git
   cd free-cluely
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a file named `.env` in the root folder
   - Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Docker Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/unmatched78/free-cluely.git
   cd free-cluely
   ```

2. **Create a `.env` file with your Gemini API key** (as described in Local Setup)

3. **Build and run with Docker Compose**:
   ```bash
   docker-compose up
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the React development server**:
   ```bash
   npm run dev -- --port 5180
   ```

2. **In a separate terminal, start the Electron app**:
   
   For macOS/Linux:
   ```bash
   NODE_ENV=development npm run electron:dev
   ```
   
   For Windows (PowerShell):
   ```bash
   $env:NODE_ENV="development"; npm run electron:dev
   ```
   
   For Windows (Command Prompt):
   ```bash
   set NODE_ENV=development && npm run electron:dev
   ```

### Production Mode

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Run the built application**:
   ```bash
   npm run app:build
   ```
   
   The packaged application will be available in the `release` folder.

### Docker Mode

1. **Run the Docker container**:
   ```bash
   docker-compose up
   ```

   This will start both the React frontend and the Electron application in development mode.

2. **For production build with Docker**:
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

### Convenient Scripts

The repository includes several convenience scripts to make development easier:

1. **Start development environment**:
   ```bash
   ./start-dev.sh
   ```
   This script starts both the React server and Electron app in development mode.

2. **Use mock processing helper** (for testing without API calls):
   ```bash
   ./use-mock-helper.sh
   ```
   This replaces the actual processing helper with a mock version for testing.

3. **Restore original helper**:
   ```bash
   ./restore-original-helper.sh
   ```
   This restores the original processing helper after testing.

## 📖 Usage Guide

1. **Launch the application** using one of the methods described above
2. **Position the floating window** where you want it on your screen
3. **Take a screenshot** of the problem you want to solve (Cmd/Ctrl + H)
4. **Review the captured content** and make any necessary edits
5. **Get a solution** by pressing Cmd/Ctrl + Enter
6. **View and copy the solution** provided by the AI
7. **Toggle visibility** with Cmd/Ctrl + B when you need to see what's behind the app
8. **Use fullscreen mode** with Cmd/Ctrl + F for a better view of complex solutions

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + B` | Toggle window visibility |
| `Cmd/Ctrl + H` | Take screenshot |
| `Cmd/Ctrl + Enter` | Get solution |
| `Cmd/Ctrl + Arrow Keys` | Move window |
| `Cmd/Ctrl + F` | Toggle fullscreen mode |
| `Cmd/Ctrl + Q` | Quit application |

## 📁 Project Structure

```
free-cluely/
├── dist/                 # Built React application
├── dist-electron/        # Compiled Electron code
├── dist-worker/          # Compiled worker scripts
├── electron/             # Electron source code
│   ├── main.ts           # Main Electron process
│   ├── preload.ts        # Preload script
│   ├── WindowHelper.ts   # Window management utilities
│   ├── shortcuts.ts      # Keyboard shortcuts handling
│   └── ipcHandlers.ts    # IPC communication handlers
├── src/                  # React application source
│   ├── components/       # React components
│   │   ├── FullscreenToggle.tsx  # Fullscreen mode component
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Service modules
│   ├── App.tsx           # Main React component
│   └── electron.d.ts     # TypeScript definitions for Electron
├── worker-script/        # Background worker scripts
│   └── node/             # Node.js worker scripts
│       └── index.ts      # Main worker script
├── .env                  # Environment variables (create this)
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration for React
├── Dockerfile.electron   # Docker configuration for Electron
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for Node.js
├── tsconfig.test.json    # TypeScript config for tests
├── vite.config.ts        # Vite configuration
└── postcss.config.ts     # PostCSS configuration
```

## 🔧 Technical Details

### Architecture

Free Cluely uses a multi-process architecture:

1. **Main Process** (Electron): Handles window management, global shortcuts, and system integration
2. **Renderer Process** (React): Manages the user interface and user interactions
3. **Worker Process**: Handles API calls to Google Gemini and processes screenshots

### Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Electron
- **Build Tools**: Vite, TypeScript, PostCSS
- **AI Integration**: Google Gemini API
- **Containerization**: Docker, Docker Compose

### Communication Flow

1. User takes a screenshot (Cmd/Ctrl + H)
2. Screenshot is captured by Electron's `desktopCapturer`
3. Image is processed and sent to the worker process
4. Worker process sends the image to Google Gemini API
5. Response is received and displayed in the UI

## ❓ Troubleshooting

### Common Issues

1. **Application doesn't start**:
   - Ensure no other application is using port 5180
   - Check for processes using the port:
     ```bash
     # For macOS/Linux
     lsof -i :5180
     # For Windows
     netstat -ano | findstr :5180
     ```
   - Kill the processes if necessary

2. **Blank screen or rendering issues**:
   - Try restarting the application
   - Check the console for errors (View > Toggle Developer Tools)
   - Verify that the React development server is running

3. **API key issues**:
   - Verify your Gemini API key is correct in the `.env` file
   - Ensure the API key has the necessary permissions
   - Check if you've reached API rate limits

4. **Screenshot not working**:
   - Make sure you've granted screen recording permissions (especially on macOS)
   - Try restarting the application
   - Check if another application is blocking screen capture

5. **Build errors**:
   - Clear the cache and reinstall dependencies:
     ```bash
     rm -rf node_modules
     rm package-lock.json
     npm install
     ```

6. **Docker issues**:
   - Ensure Docker and Docker Compose are installed correctly
   - Check if the required ports are available
   - Verify that X11 forwarding is configured correctly for GUI applications

### Advanced Troubleshooting

For more complex issues:

1. **Enable debug logging**:
   ```bash
   DEBUG=electron:* npm run electron:dev
   ```

2. **Check Electron logs**:
   - Open DevTools in the application (View > Toggle Developer Tools)
   - Check the Console tab for errors

3. **Test with mock data**:
   ```bash
   ./use-mock-helper.sh
   ```
   This replaces the actual API calls with mock responses for testing.

## 👥 Contributing

Contributions are welcome! Here's how you can contribute:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**:
   ```bash
   npm test
   ```
5. **Commit your changes**:
   ```bash
   git commit -m "Add your feature description"
   ```
6. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

Please ensure your code follows the project's coding standards and includes appropriate tests.

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Write tests for new features
- Update documentation when adding or changing features
- Keep pull requests focused on a single feature or bug fix

## 📄 License

This project is a fork from the original creator [@Prat011](https://github.com/Prat011). If you want to use it, you must align with the original creator's license requirements.

---

## 🙏 Acknowledgements

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Google Gemini AI](https://ai.google.dev/) - AI model for generating solutions

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/unmatched78/free-cluely/issues) on GitHub.

For business inquiries or custom solutions, please contact the repository owner directly.

