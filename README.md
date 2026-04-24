# QR Code Generator

Single-page, privacy-friendly QR code generator. Everything runs in the browser &mdash; no data, logos, or QR contents ever leave your device.

## Features

- **Content types** &mdash; URL, plain text, email, phone, SMS, Wi-Fi, vCard, and geographic coordinates.
- **Style controls** &mdash; foreground/background colors, transparent background, dot style (square, rounded, dots, classy, classy-rounded, extra-rounded), corner frame and corner dot styles, quiet-zone margin.
- **Error correction** &mdash; pick L / M / Q / H depending on how much redundancy you want.
- **Logo in the middle** &mdash; upload PNG, JPEG, SVG, WebP, or GIF. Adjust size, padding, and hide background dots behind it.
- **Exports** &mdash; PNG, SVG, JPEG, or WebP. Preset sizes (256, 512, 1024, 2048 px) or any custom pixel size.
- **Copy to clipboard** &mdash; drop a PNG straight into chat apps or docs.

## Tech

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Material UI](https://mui.com/) themed with Material 3 color roles and shapes
- [`qr-code-styling`](https://qr-code-styling.com/) for the rendering engine

## Local development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173/qr/`. (The app is built under the `/qr` subpath &mdash; see below.)

```bash
npm run build    # type-check and produce a production build in dist/qr/
npm run preview  # serve the production build locally at /qr/
```

## URL structure

The app is built to live under a `/qr` subpath so it can be dropped onto a larger website without colliding with other routes:

- `dist/qr/index.html` is the app entry point.
- All assets are emitted under `/qr/assets/*`.
- `vercel.json` redirects `/` to `/qr` and rewrites all SPA routes under `/qr` back to the app shell.

If you need the app at the root path instead, change `base` in `vite.config.ts` to `'/'`, set `build.outDir` to `'dist'`, and simplify the rewrites in `vercel.json`.

## Deploying to Vercel

The repo ships with a `vercel.json`. Either:

- Import the project into Vercel &mdash; it uses the provided config automatically, or
- Run `vercel` from this directory.

No environment variables or serverless functions are needed &mdash; it's a fully static build.

### Adding it to your existing website

Two common options:

1. **Reverse proxy.** On your main site, rewrite `yourdomain.com/qr/*` to the Vercel deployment's `/qr/*`. Because the app references its assets at absolute `/qr/...` paths, the browser will fetch them from `yourdomain.com/qr/assets/...`, which your reverse proxy should forward to Vercel too.
2. **iframe.** Embed `<iframe src="https://your-vercel-url/qr/"></iframe>` on a `/qr` page of your site. Simpler, but the app renders inside the iframe's own document.

## Privacy

There is no backend, no analytics, and no storage. Uploaded logos are read with `FileReader` into a local data URL and used only while the tab is open.
