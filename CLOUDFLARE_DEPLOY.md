# Déploiement Cloudflare — Résolution de l'Erreur 100324

### 1. Cause de l'erreur `100324` (Infinite loop) :
Cloudflare Workers Static Assets utilise nativement la règle suivante dans `wrangler.toml` :
```toml
[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```
Lorsque le fichier `_redirects` contenait `/* /index.html 200`, Cloudflare détectait une boucle infinie de redirection (`[code: 100324]`).

### 2. Actions effectuées :
- **Suppression de `_redirects`** : le routage SPA est désormais géré à 100% de manière native et propre par Cloudflare via `not_found_handling = "single-page-application"`.
- **Alignement du nom du Worker** : `wrangler.toml` utilise exactement le nom attendu par Cloudflare CI : `omnistudio-ai---studio-de-cr-ation-multim-dia-agent-ia`.

---

### 3. Pousser vers GitHub pour déployer :
```bash
git add .
git commit -m "fix: remove _redirects and match worker name for cloudflare deploy"
git push
```
Le déploiement Cloudflare passera désormais en vert !
