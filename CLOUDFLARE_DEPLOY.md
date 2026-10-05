# Guide de Déploiement sur Cloudflare Pages

Ce projet est configuré pour se déployer facilement et sans erreur sur **Cloudflare Pages**.

---

### 1. Paramètres de Build dans Cloudflare Pages

Lors de la création de votre projet sur le tableau de bord Cloudflare (**Workers & Pages > Create > Pages > Connect to Git**) :

| Paramètre | Valeur à renseigner |
| :--- | :--- |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (laisser vide ou par défaut) |

---

### 2. Variables d'Environnement (Obligatoire pour l'IA)

Dans votre projet Cloudflare Pages :
1. Allez dans **Settings > Environment variables**.
2. Ajoutez :
   - `NODE_VERSION` = `20`
   - `GEMINI_API_KEY` = *Votre clé API Google Gemini* (optionnel si vous l'utilisez)

---

### 3. Fichiers de compatibilité inclus dans le dépôt

- **`.node-version` & `.nvmrc`** : Forcent Cloudflare à utiliser **Node.js 20** (évite les erreurs de version sur Tailwind v4 et Vite 8).
- **`.npmrc` (`legacy-peer-deps=true`) & `package-lock.json`** : Résolvent le conflit `ERESOLVE` lors du `npm install`.
- **`public/_redirects`** : Permet au routeur SPA (React) de fonctionner sans erreur 404 lors du rechargement de page.
- **`functions/api/[[path]].ts`** : Fournit les API serverless Cloudflare Edge (`/api/generate-image`, `/api/generate-video`, `/api/generate-story`, `/api/generate-music`, `/api/agent-chat`, `/api/health`).
