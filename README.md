# MYSLT-DASHBOARD

## Project layout

This repository now uses a mono-style layout: the frontend lives in the `client/` folder and the backend remains in `Server/`.

Files intentionally kept at the repository root: `package.json`, `README.md`, `.gitignore`.

## Running the frontend (developer)

From a PowerShell terminal (Windows):

```powershell
cd client
npm install
npm run dev
```

This starts the Vite dev server for the frontend.

## Build (production bundle)

```powershell
cd client
npm install
npx vite build
```

This produces the production assets in `client/dist`.
