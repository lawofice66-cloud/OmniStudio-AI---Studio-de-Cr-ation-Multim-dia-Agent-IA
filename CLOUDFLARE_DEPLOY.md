# Résolution de l'Erreur de Build Cloudflare Pages / CI

## 1. Cause exacte de l'erreur `Unknown lockfile version` :
Dans vos logs de déploiement Cloudflare :
```
Installing project dependencies: bun install --frozen-lockfile
bun install v1.2.15 (df017990)
2 |   "lockfileVersion": 2,
                         ^
error: Unknown lockfile version
    at bun.lock:2:22
UnknownLockfileVersion: failed to parse lockfile: 'bun.lock'
error: lockfile had changes, but lockfile is frozen
Failed: error occurred while installing tools or dependencies
```

**Explication :**
- Cloudflare Pages détecte les outils installés : `nodejs@22.12.0`, `bun@1.2.15`, `npm@10.9.2`.
- Dès qu'un fichier `bun.lock` est présent à la racine du dépôt GitHub, Cloudflare bascule automatiquement sur **Bun** et exécute `bun install --frozen-lockfile`.
- Or, le fichier `bun.lock` contenait `"lockfileVersion": 2` (spécifique aux versions récentes de Bun 1.4+), alors que la version de Bun par défaut de Cloudflare Pages est **v1.2.15**, incapable de lire ce format.

---

## 2. Solution immédiate (Recommandée) : Supprimer `bun.lock`

En supprimant `bun.lock`, Cloudflare détecte automatiquement `package-lock.json` et lance **`npm ci`** (Node.js 22.12.0 & npm 10.9.2), qui compile votre projet sans aucune erreur en quelques secondes !

Dans votre terminal local (ou sur votre dépôt Git) :

```bash
# 1. Supprimer le fichier bun.lock du suivi Git
git rm bun.lock

# 2. Ajouter les modifications (.gitignore et suppression)
git add .

# 3. Commiter et pousser vers GitHub
git commit -m "fix: remove bun.lock to use standard npm build on cloudflare"
git push
```

Dès le push, Cloudflare Pages relancera le build en utilisant `npm ci` et passera directement au vert !

---

## 3. Solution alternative : Spécifier la version de Bun sur Cloudflare

Si vous souhaitez continuer à utiliser Bun sur Cloudflare Pages :
1. Allez dans votre tableau de bord **Cloudflare Pages** > Votre projet.
2. Cliquez sur **Settings** > **Environment variables**.
3. Ajoutez la variable :
   - Variable : `BUN_VERSION`
   - Valeur : `1.4.2`
4. Relancez le déploiement.
