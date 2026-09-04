# Flow Like Water

A small TypeScript Express + React playground for experimenting with streaming audio from a server to a browser.

## Project structure

- `server/`: Express API and streaming logic
- `client/`: Vite React browser application
- `public-audio/`: local test audio files, added with the first streaming milestone
- `steps.md`: implementation plan and resolved decisions

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm 10 or newer

## Development

Install dependencies and start both applications:

```sh
npm install
npm run dev
```

The client runs at `http://localhost:5173` and the server runs at `http://localhost:3001`.

The initial server shell exposes `GET /health`. Audio streaming is intentionally not implemented yet.

Copy `server/.env.example` to `server/.env` to override local server settings such as `PORT`.

## Checks

```sh
npm run typecheck
npm run build
npm run format:check
```
