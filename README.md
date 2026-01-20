# 🏠 Morta.me
**The Most Transparent Mortgage Simulator for the European Market.**

Morta.me is a high-performance, single-page application (SPA) built with **Vue 3, Vite, and Tailwind CSS**. It empowers homebuyers to simulate complex mortgage scenarios—including variable rates and early repayments—entirely on the client side for maximum privacy and speed.

## 🇪🇺 Built for Europe (for now)
Unlike generic calculators, Morta.me is built to handle the specificities of European mortgage markets.
- **Belgian Compliance:** Built-in logic for the **3-month interest penalty** (wederbeleggingsvergoeding) capped by law.
- **Regional Taxes:** Toggle between Flanders (2% primary residence), Wallonia (3%), and Brussels (abattement rules) for 2026.
- **Privacy First:** 100% client-side. No data ever leaves your browser. No authentication, no cookies, no tracking.

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/)

### Development (Local)
Run the following command to start a local development server with hot-reloading:

```bash
docker compose -f docker-compose.dev.yml up --build
```
Access the app at http://localhost:5173

### Production (Self-Hosted)

To deploy to your own server with Let's Encrypt SSL:

1. **Update** `nginx/production.conf` with your domain (e.g., `morta.me`).
2. **Run the initial SSL setup:**

```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d morta.me
```

3. **Start the production stack:**

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

Contributions are welcome! Whether it's adding support for French/Dutch mortgage rules or improving the UI, please feel free to open a Pull Request.
## ⚖️ License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

* ✅ Free for Individuals: Use it for your own house hunting, personal research, or education.

* ✅ Free for Non-Profits: Open to NGOs and educational institutions.

* ❌ Commercial Use: Use by banks, real estate agencies, or for-profit mortgage brokers requires a commercial license.

**Are you a bank or financial institution?** Please reach out via GitHub to discuss commercial licensing:  
[![Contact me on GitHub](https://img.shields.io/badge/Contact-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/ajahansh)
