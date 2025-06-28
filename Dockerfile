FROM node:18-bullseye

# Install dependencies for Electron
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

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV GEMINI_API_KEY=dummy-api-key
ENV NODE_ENV=development
ENV DISPLAY=:99

# Expose port for React app
EXPOSE 5180

# Start command
CMD ["npm", "run", "dev"]