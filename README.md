# Lear Track — Pointage Intérimaires

Plateforme web de gestion et de pointage des travailleurs intérimaires de **Lear Corporation**.
Application **Next.js 15 + React 19** installable en PWA, optimisée mobile, en français.

> Scan QR, suivi des présences en temps réel, gestion des sites, des intérimaires et des utilisateurs, alertes et workflow de validation — le tout dans une interface premium prête pour le terrain.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Démarrage rapide](#démarrage-rapide)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [Authentification](#authentification)
- [PWA & mode hors-ligne](#pwa--mode-hors-ligne)
- [Conventions de code](#conventions-de-code)
- [Déploiement](#déploiement)
- [Licence](#licence)

---

## Fonctionnalités

- **Authentification multi-rôles** (admin, manager, intérimaire) — *mock pour le moment*.
- **Pointage par QR code** — scan d'entrée/sortie côté terrain, génération et affichage du QR personnel.
- **Tableau de bord** global et personnel, avec graphiques (Recharts).
- **Gestion** des intérimaires, utilisateurs, sites, présences et sessions.
- **Alertes** et **workflow de validation** des pointages.
- **PWA installable** — fonctionne hors-ligne grâce au service worker (`next-pwa`).
- **Mobile-first**, optimisée tactile, viewport verrouillé, status bar Apple translucide.
- **Internationalisation** prête (`I18nProvider`).

## Stack technique

| Domaine        | Outil                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Framework      | [Next.js 15](https://nextjs.org/) (App Router, Turbopack)                            |
| Langage        | TypeScript 5, React 19                                                               |
| UI             | [shadcn/ui](https://ui.shadcn.com/) (style *new-york*) + [Radix UI](https://radix-ui.com/) |
| Styles         | Tailwind CSS v4 (PostCSS plugin)                                                     |
| Icônes         | [lucide-react](https://lucide.dev/)                                                  |
| Animations     | [Framer Motion](https://www.framer.com/motion/)                                      |
| Formulaires    | React Hook Form + [Zod](https://zod.dev/)                                            |
| Charts         | [Recharts](https://recharts.org/)                                                    |
| QR             | `qrcode.react`                                                                       |
| Notifications  | `react-hot-toast`, `sonner`                                                          |
| PWA            | [`next-pwa`](https://github.com/shadowwalker/next-pwa)                               |
| Polices        | Geist Sans/Mono, Syne, Space Grotesk, DM Sans, DM Serif Display                      |
| Package manager| [Bun](https://bun.sh/) (npm/pnpm compatibles)                                        |

## Démarrage rapide

### Prérequis

- **Node.js ≥ 20** (recommandé)
- **Bun ≥ 1.0** *(facultatif — npm ou pnpm fonctionnent aussi)*

### Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-repo> https-tracking-frontend
cd https-tracking-frontend

# 2. Installer les dépendances
bun install
# ou : npm install / pnpm install

# 3. Lancer le serveur de développement
bun dev
# ou : npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

> Le service worker PWA est **désactivé en développement** (`next.config.ts`). Pour le tester, faire un `bun run build && bun start`.

### Identifiants de démo

Les comptes de test vivent dans `src/lib/data.ts` (`MOCK_CREDENTIALS`). Consulter ce fichier pour les emails/mots de passe disponibles.

## Scripts disponibles

| Commande         | Description                                |
| ---------------- | ------------------------------------------ |
| `bun dev`        | Démarre Next.js en mode dev (Turbopack)    |
| `bun run build`  | Build de production                        |
| `bun start`      | Sert le build de production                |
| `bun run lint`   | Lance ESLint                               |

## Structure du projet

```
src/
├── app/                    # routes (App Router)
│   ├── dashboard/          # tableau de bord global
│   ├── mon-dashboard/      # dashboard personnel intérimaire
│   ├── login/              # connexion
│   ├── forgot-password/
│   ├── scan/               # scan QR (pointage)
│   ├── mon-qr/             # QR personnel
│   ├── qr-codes/           # gestion des QR
│   ├── presents/           # présences temps réel
│   ├── mes-sessions/       # historique des sessions
│   ├── interimaires/       # CRUD intérimaires
│   ├── utilisateurs/       # CRUD utilisateurs / rôles
│   ├── sites/              # gestion sites
│   ├── alertes/
│   ├── workflow/           # workflow de validation
│   ├── validation/
│   ├── parametres/
│   ├── offline/            # fallback PWA
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # composants shadcn/ui
│   └── layout/             # nav, shells
├── hooks/
└── lib/
    ├── auth-context.tsx    # provider d'authentification
    ├── data.ts             # données mockées + types
    ├── i18n.tsx            # provider i18n
    └── utils.ts            # helpers (cn, etc.)
public/
├── icons/                  # icônes PWA (72→512 px)
├── manifest.json
└── sw.js                   # service worker (généré)
scripts/                    # génération d'icônes / favicon
```

### Aliases d'import

Configurés dans `tsconfig.json` et `components.json` :

```ts
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
```

## Authentification

> ⚠️ **L'authentification actuelle est un mock.**

- Les identifiants sont définis en clair dans `src/lib/data.ts` (`MOCK_CREDENTIALS`).
- L'utilisateur connecté est persisté dans `localStorage` sous la clé `pointage_user`.
- Aucune validation côté serveur, aucun token, aucun chiffrement.

**Avant la mise en production**, remplacer par une solution réelle :
- [NextAuth.js / Auth.js](https://authjs.dev/) ou [Clerk](https://clerk.com/) pour l'OAuth/SSO,
- ou un backend dédié avec sessions/JWT signées,
- déplacer les credentials hors du bundle client,
- protéger les routes via middleware Next.js.

## PWA & mode hors-ligne

- **Manifest** : `public/manifest.json` (`start_url: /dashboard`, `display: standalone`, thème `#CC0000`).
- **Service worker** : généré par `next-pwa`, stratégie `NetworkFirst` (200 entrées, TTL 24 h).
- **Fallback hors-ligne** : route `/offline`.
- **Installation** : un bandeau (`PWAInstallBanner`) propose l'installation sur les navigateurs compatibles.
- **iOS** : meta `apple-touch-icon` + status bar `black-translucent` configurées dans `src/app/layout.tsx`.

### Régénérer les icônes

```bash
node scripts/generate-icons.mjs
# ou
node scripts/gen-icons.mjs
```

## Conventions de code

- **TypeScript strict** sur les API publiques (props, exports). Éviter `any`, préférer `unknown` + narrowing.
- **Composants** : privilégier shadcn/ui (`npx shadcn@latest add <name>`) avant de créer un composant custom.
- **Tailwind v4** : tokens dans `src/app/globals.css` — pas de `tailwind.config.js`.
- **Validation** : schémas Zod côté client, types inférés via `z.infer<typeof schema>`.
- **Immutabilité** : pas de mutation directe, utiliser le spread (`{ ...obj, field: value }`).
- **Pas de `console.log`** dans le code committé.
- **Langue** : commentaires et UI en français.

> Le build Next.js ignore volontairement les erreurs TS et ESLint (`next.config.ts`).
> Lancer `tsc --noEmit` et `bun run lint` localement avant chaque commit.

## Déploiement

Le projet est prêt pour [Vercel](https://vercel.com/) :

```bash
# build local
bun run build
bun start
```

Sur Vercel, aucune variable d'environnement n'est requise tant que l'auth reste en mock. Penser à les ajouter au moment de brancher l'API/auth réelle.

## Licence

Projet interne **Lear Corporation** — tous droits réservés.
