# EC-Client

React client for the EC e-commerce demo. It includes the storefront, account and checkout flows, and an admin dashboard. The API server is maintained separately.

## Requirements

- Node.js 24.22.1 or later in the 24.x line
- A running EC API server

## Run locally

```bash
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to the API base URL. Set `VITE_GOOGLE_CLIENT_ID` if you want to demonstrate Google sign-in. Vite exposes variables prefixed with `VITE_` to the browser, so never put secrets in them.

## Checks

```bash
npm run check:src
npm run lint
npm run build
```

The current payment confirmation is a demo flow and does not verify a real bank transfer.
