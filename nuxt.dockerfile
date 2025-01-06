# FROM node:23-alpine
FROM node:23-bookworm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# RUN apk add --no-cache ffmpeg
RUN apt-get update && apt-get install -y ffmpeg musl-dev \
  && rm -rf /var/lib/apt/lists/* \
  && ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1

WORKDIR /app
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
