# CLAUDE.md

This file gives Claude Code the context it needs to work effectively in this repository.

## Project

**Lear Track** — Plateforme de gestion et de pointage des travailleurs intérimaires pour Lear Corporation.

Application web installable (PWA) en français, optimisée mobile, qui couvre l'authentification multi-rôles, le scan QR de pointage, la gestion des sites/intérimaires/utilisateurs, et la consultation des sessions et alertes.

## Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (style "new-york"), Radix UI primitives, Lucide icons
- **Animations**: Framer Motion
- **Forms / Validation**: React Hook Form + Zod
- **Charts**: Recharts
- **PWA**: `next-pwa` avec stratégie `NetworkFirst` et fallback `/offline`
- **Notifications**: react-hot-toast, sonner
- **Polices**: Geist Sans/Mono + Syne, Space Grotesk, DM Sans, DM Serif Display
- **Package manager**: Bun (présence de `bun.lock`) — npm/pnpm fonctionnent aussi

## Scripts

```bash
bun dev     # next dev --turbopack — démarre sur http://localhost:3000
bun run build   # build production
bun start   # sert le build production
bun run lint    # eslint
```

> Le build ignore volontairement les erreurs TypeScript et ESLint (`next.config.ts`). Toujours lancer `tsc --noEmit` et `eslint` localement avant de commit.

## Arborescence

```
src/
├── app/                    # routes App Router
│   ├── dashboard/          # tableau de bord global
│   ├── mon-dashboard/      # dashboard personnel intérimaire
│   ├── login/              # connexion (mock)
│   ├── forgot-password/
│   ├── scan/               # scan QR
│   ├── mon-qr/             # affichage QR personnel
│   ├── qr-codes/           # gestion des QR
│   ├── presents/           # présences temps réel
│   ├── mes-sessions/       # historique sessions
│   ├── interimaires/       # CRUD intérimaires
│   ├── utilisateurs/       # CRUD utilisateurs / rôles
│   ├── sites/              # gestion sites
│   ├── alertes/            # alertes / notifications
│   ├── workflow/           # workflow validation
│   ├── validation/         # écran de validation
│   ├── parametres/         # paramètres
│   ├── offline/            # fallback hors-ligne (PWA)
│   ├── layout.tsx          # providers, polices, PWA, toaster
│   └── globals.css         # tokens Tailwind v4
├── components/
│   ├── ui/                 # composants shadcn/ui
│   └── layout/             # shells / nav
├── hooks/
└── lib/
    ├── auth-context.tsx    # AuthProvider (mock)
    ├── data.ts             # mockUsers, MOCK_CREDENTIALS, types
    ├── i18n.tsx            # I18nProvider
    └── utils.ts            # cn(), helpers
public/
├── icons/                  # icônes PWA (72→512)
├── manifest.json
└── sw.js                   # service worker généré par next-pwa
scripts/                    # génération d'icônes / favicon
```

## Aliases d'import

Définis dans `tsconfig.json` et `components.json` :

| Alias            | Cible                |
| ---------------- | -------------------- |
| `@/components`   | `src/components`     |
| `@/components/ui`| `src/components/ui`  |
| `@/lib`          | `src/lib`            |
| `@/lib/utils`    | `src/lib/utils.ts`   |
| `@/hooks`        | `src/hooks`          |

## Conventions

- **Langue UI**: français (`<html lang="fr">`).
- **Thème**: rouge Lear `#CC0000` (themeColor PWA), fond sombre `#111111`.
- **Composants**: privilégier shadcn/ui avant de créer un composant custom. `style: "new-york"`, `iconLibrary: "lucide"`.
- **Tailwind v4**: tokens définis dans `src/app/globals.css` (pas de `tailwind.config.js`).
- **Types**: types/interfaces explicites sur les API publiques, éviter `any`, préférer `unknown` + narrowing.
- **State**: Auth + i18n via Context. Pas de store global pour l'instant.
- **Validation**: schémas Zod côté client, types inférés via `z.infer`.

## Authentification (état actuel)

**Mock seulement**. Les identifiants vivent dans `src/lib/data.ts` (`MOCK_CREDENTIALS`) et la session est persistée en `localStorage` sous la clé `pointage_user`.

⚠️ Avant toute mise en production : remplacer par une auth réelle (NextAuth/Auth.js, Supabase, ou backend dédié), sortir les mots de passe du bundle, et ne plus stocker l'utilisateur complet en `localStorage`.

## PWA

- Manifest : `public/manifest.json` (start_url `/dashboard`, display `standalone`).
- Service worker : généré par `next-pwa` (`dest: "public"`), désactivé en `development`.
- Cache runtime : `NetworkFirst`, 200 entrées max, TTL 24 h.
- Fallback hors-ligne : route `/offline`.
- Icônes générées via `scripts/generate-icons.mjs` / `scripts/gen-icons.mjs`.

## Tâches récurrentes

- **Régénérer les icônes PWA** : `node scripts/generate-icons.mjs`
- **Ajouter un composant shadcn** : `npx shadcn@latest add <name>` (config dans `components.json`)
- **Ajouter une route** : créer un dossier sous `src/app/<slug>/` avec `page.tsx`

## Notes pour Claude

- Réponses utilisateur attendues en français quand l'UI/le code l'est déjà.
- Ne pas réintroduire `console.log` dans le code committé.
- Les fichiers `*.tsx` passent par le loader `orchids-visual-edits` (Turbopack rule). Ne pas le retirer sans accord explicite.
- Le projet ignore les erreurs TS/ESLint au build — cela ne dispense pas de les corriger.
