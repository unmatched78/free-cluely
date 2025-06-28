# Free Cluely

![Free Cluely Logo](https://github.com/unmatched78/free-cluely/blob/main/public/logo.png?raw=true)

A powerful desktop application that uses AI to help you solve problems, answer questions, and provide assistance across various domains. Free Cluely captures your screen, analyzes the content, and generates solutions using Google's Gemini AI.

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
- [Usage Guide](#usage-guide)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

Free Cluely is an Electron-based desktop application that combines the power of React for the frontend and Node.js for the backend. It uses Google's Gemini AI to analyze screenshots and provide intelligent solutions to problems displayed on your screen.

## ✨ Features

- **Screenshot Analysis**: Capture your screen and get AI-powered solutions
- **Floating Window**: Always stays on top for easy access
- **Fullscreen Mode**: Expand the application to cover your entire screen
- **Keyboard Shortcuts**: Quick access to all features
- **Dark/Light Mode**: Comfortable viewing in any environment
- **History**: Save and access your previous queries and solutions
- **TypeScript Support**: Fully typed codebase for better development experience

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

2. **Build the Docker image**:
   ```bash
   docker build -t free-cluely .
   ```

3. **Create a `.env` file with your Gemini API key** (as described in Local Setup)

## 🚀 Running the Application

### Development Mode

1. **Start the React development server**:
   ```bash
   npm run dev
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
   docker run -it --rm \
     -v ${PWD}/.env:/app/.env \
     -v /tmp/.X11-unix:/tmp/.X11-unix \
     -e DISPLAY=$DISPLAY \
     --device /dev/dri \
     --name free-cluely \
     free-cluely
   ```

   Note: Running Electron in Docker requires X11 forwarding and may need additional configuration depending on your system.

## 📖 Usage Guide

1. **Launch the application** using one of the methods described above
2. **Position the floating window** where you want it on your screen
3. **Take a screenshot** of the problem you want to solve (Cmd/Ctrl + H)
4. **Review the captured content** and make any necessary edits
5. **Get a solution** by pressing Cmd/Ctrl + Enter
6. **View and copy the solution** provided by the AI

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
├── electron/             # Electron source code
│   ├── main.ts           # Main Electron process
│   ├── preload.ts        # Preload script
│   └── ...
├── src/                  # React application source
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Service modules
│   ├── App.tsx           # Main React component
│   └── ...
├── worker-script/        # Background worker scripts
├── .env                  # Environment variables (create this)
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

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

3. **API key issues**:
   - Verify your Gemini API key is correct in the `.env` file
   - Ensure the API key has the necessary permissions

4. **Build errors**:
   - Clear the cache and reinstall dependencies:
     ```bash
     rm -rf node_modules
     rm package-lock.json
     npm install
     ```

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
