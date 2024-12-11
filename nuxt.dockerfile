FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG BASE_URL
ENV BASE_URL=$BASE_URL

RUN corepack enable

RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build


EXPOSE 3000

HEALTHCHECK --start-period=5s --timeout=3s --retries=3 CMD curl -v http://127.0.0.1:3000${BASE_URL} || exit 1

CMD ["pnpm", "preview"]
