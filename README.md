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

The app runs at `http://localhost:5173`.

```bash
npm run build    # type-check and produce a production build in dist/
npm run preview  # serve the production build locally
```

## Deploying to Vercel

The repo ships with a `vercel.json`. Either:

- Import the project into Vercel &mdash; it auto-detects Vite and uses the provided config, or
- Run `vercel` from this directory.

No environment variables or serverless functions are needed &mdash; it's a fully static build.

## Privacy

There is no backend, no analytics, and no storage. Uploaded logos are read with `FileReader` into a local data URL and used only while the tab is open.
