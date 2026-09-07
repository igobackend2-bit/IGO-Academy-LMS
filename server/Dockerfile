# Debian-based (not alpine) — Puppeteer's bundled Chromium needs glibc and
# the system libraries installed below; it does not run on musl/alpine.
FROM node:20-slim

# Puppeteer/Chromium runtime dependencies (Puppeteer's own recommended list
# for Debian-based images) + python3/pip/ffmpeg/curl for the compress-on-
# upload pipeline (server/src/scripts/python/*.py, wired through
# utils/pythonCompress.util.js — course thumbnails resized+WebP'd via
# Pillow, module videos re-encoded to a normal streaming bitrate via
# ffmpeg). --break-system-packages is needed for pip on Debian 12+'s
# externally-managed Python; there's no venv here, this container runs
# nothing else that could conflict with Pillow.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
    libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
    libxi6 libxrandr2 libxrender1 libxss1 libxtst6 wget xdg-utils \
    python3 python3-pip ffmpeg curl \
    && pip3 install --no-cache-dir --break-system-packages Pillow \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
