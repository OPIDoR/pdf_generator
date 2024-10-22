FROM node:20.18.0-alpine3.20 AS build

WORKDIR /build

ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY . ./
RUN npm ci && npm run build

FROM node:20.18.0-slim AS prod

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome for Testing that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init


WORKDIR /app

COPY --from=build /build ./

# RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && mkdir -p /pdf \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /pdf \
#     && chown -R pptruser:pptruser ./

# USER pptruser

RUN mkdir -p /pdf


ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.mjs"]
