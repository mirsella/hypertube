# hypertube

Movie streaming app built with Nuxt, PostgreSQL, subtitles, and torrent-backed media fetching.

## How It Works

The app combines several pieces behind one Nuxt project:

- movie metadata and discovery
- user accounts and comments stored in PostgreSQL through Drizzle
- subtitle fetching
- torrent search and streaming
- optional transcoding when the downloaded media is not directly playable

When a movie is requested, the server searches torrent sources, prefers the best candidate it can match, and either streams from cache or starts a torrent-backed fetch. Downloaded media is kept on disk so later plays can use normal range requests instead of restarting the whole torrent flow.

## Run locally

```bash
cp .env.example .env
pnpm install
pnpm db:push
pnpm dev
```

## Full stack

```bash
docker compose up --build
```

## Notes

- This repo depends on several external services and keys, so local setup is more than just `pnpm dev`.
- Auth, subtitles, torrent search, and database access all have their own moving parts.
- Cached media and uploaded assets are stored locally by the app.

## Screenshots

![home](https://github.com/user-attachments/assets/c0b4e15f-b953-4125-8869-0109fb4f889f)
![movie](https://github.com/user-attachments/assets/a2c44f28-ec28-4523-b1e3-28f788899746)
