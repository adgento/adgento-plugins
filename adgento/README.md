# Adgento

A full-service digital marketing agency inside Claude: onboarding, strategy, SEO, Google and Meta campaigns, content, creative, analytics and branded PDF reports, in Hebrew or English.

This folder holds only the loaders. The agency's instructions live on adgento.app and are served to an active licence.

**Install** (Claude desktop app):
1. Customize → Plugins → Add → **Add marketplace** → `adgento/adgento-plugins` (turn on **Sync automatically** for updates)
2. Find **adgento** and click **Install**
3. In a new chat, write **activate Adgento** — enter your email and the 6-digit code we send. A new email gets a 14-day free trial.

Claude on the web or in a cloud session: Settings → Connectors → Add custom connector → `https://adgento.app/mcp`, then sign in with your email and code.

The helper (`server/adgento.mjs`, needs Node.js) sends only an anonymous install id, the plugin version, the licence token and which Adgento file is requested. Nothing about your clients, files or chats.

Heebo fonts in `report-fonts/` are under the SIL Open Font License (see `report-fonts/OFL-Heebo.txt`).

© 2026 Adgento. All rights reserved. https://adgento.app
