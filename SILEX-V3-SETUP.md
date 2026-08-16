# JINHUAN — Silex V3 + Squidex + GitHub Pages

This branch is the safe test workspace for the new visual storefront editor. The current live site on `main` is not replaced yet.

## Architecture

- **Silex V3**: visual page design and layout editing.
- **Squidex**: product content (`products` schema).
- **GitHub**: source control and project storage.
- **GitHub Pages**: final public storefront hosting.
- **jinhuan.me**: existing custom domain; keep unchanged until the Silex version is approved.

## Browser-only editor test (GitHub Codespaces)

1. Open this repository on branch `silex-v3`.
2. Click **Code → Codespaces → Create codespace on silex-v3**.
3. Codespaces installs Silex automatically.
4. In the terminal run `npm start`.
5. Open forwarded port **6805 — Silex V3 Visual Editor**.

## Windows local test

If Node.js is installed, double-click `start-silex.cmd` from a local clone of this branch. It installs Silex if needed and starts the editor at `http://localhost:6805`.

## Current storefront preview

The existing visual concept remains available in `silex-demo/`. It is only a design reference; it does not replace the live root site yet.

## Squidex connection

Keep the existing app `jinhuan-catalog` and schema `products`. Never put a Squidex client secret in browser JavaScript. Public storefront reads will be configured with safe read-only/anonymous permissions before launch.

## Launch rule

Do not switch GitHub Pages or `jinhuan.me` away from the current `main` site until the visual editor workflow and first product are confirmed.
