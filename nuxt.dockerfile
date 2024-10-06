FROM node:20-alpine

RUN npm install -g pnpm@9.11.0

WORKDIR /app
COPY . /app

RUN pnpm install && pnpm build

EXPOSE 3000

CMD ["pnpm", "preview"]
