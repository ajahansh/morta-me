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

**Start the production stack:**

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

Contributions are welcome! Whether it's adding support for French/Dutch mortgage rules, adding other regions or improving the UI, please feel free to open a Pull Request.

## ⚖️ License & Adoption

MortaMe is currently transitioning to a **Dual-License Model** to ensure the project remains sustainable while staying free for the public.

* **For Individuals & Non-Profits:** **Free Forever**. Use it for your own house hunting, research, or education. If the tool helped you, donations are encouraged to keep the servers running.
* **For Banks & Financial Institutions:** 
    * **Standard:** Free to use "as-is" with original MortaMe branding.
    * **Partner Tier (White-Label):** Requires a commercial commitment to remove MortaMe branding or add custom corporate logos.

**Are you a bank or financial institution?** Please reach out via GitHub to discuss commercial licensing or white-label integration:  
[![Contact me on GitHub](https://img.shields.io/badge/Contact-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/ajahansh)

*Note: For-profit use without attribution is strictly prohibited under our current terms.*
