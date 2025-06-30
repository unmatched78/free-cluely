# electron/Dockerfile

# 1. Base image
FROM node:18-bullseye

# 2. Build-time arguments (with sane defaults)
ARG NODE_ENV=development
ARG GEMINI_API_KEY=dummy-api-key

# 3. System dependencies needed for Electron
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    xvfb \
  && rm -rf /var/lib/apt/lists/*

# 4. Set working directory
WORKDIR /app

# 5. Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# 6. Copy application source
COPY . .

# 7. Expose your React dev server port
EXPOSE 5180

# 8. Promote build args to runtime environment variables
ENV NODE_ENV=${NODE_ENV}
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV DISPLAY=:99

# 9. Default start command (React); overridden by Compose for electron-app
CMD ["npm", "run", "dev"]
