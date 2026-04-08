# 🃏 BlackJack

Jeu de **Blackjack multijoueur en ligne**, gratuit et sans argent réel. Les joueurs misent une monnaie virtuelle (les « jetons »), s'affrontent dans des salons en temps réel, débloquent des badges, personnalisent leurs jetons, empruntent des prêts, se font des amis et grimpent au classement. Un assistant IA nommé **Thierry** répond aux questions sur les règles et le site.

Projet réalisé dans le cadre du Master 2 Développement (Ynov).

---

## 🧱 Stack technique

| Domaine | Technologie |
|---------|-------------|
| Framework full-stack | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| Langage | TypeScript |
| UI | React 19, [shadcn/ui](https://ui.shadcn.com) (sur base-ui), Tailwind CSS v4 |
| Icônes | Lucide React |
| Base de données | [Supabase](https://supabase.com) (PostgreSQL) |
| Temps réel | Supabase Realtime |
| Stockage | Supabase Storage (avatars) |
| Authentification | Sessions JWT maison (`jose`) + hachage `bcryptjs` |
| IA (chatbot Thierry) | API [DeepSeek](https://platform.deepseek.com) (`deepseek-chat`) |

---

## ✅ Prérequis

- **Node.js 20.9+** et **npm**
- Un **compte Supabase** (gratuit) — https://supabase.com
- La **CLI Supabase** pour appliquer les migrations — https://supabase.com/docs/guides/cli
- (Optionnel) Une **clé API DeepSeek** avec du crédit, pour activer le chatbot Thierry — https://platform.deepseek.com

---

## 🚀 Installation

### 1. Cloner le dépôt et installer les dépendances

```bash
git clone git@github.com:paulrdgs/blackjack.git
cd blackjack
npm install
```

### 2. Créer un projet Supabase

1. Crée un projet sur https://supabase.com.
2. Récupère dans **Project Settings → API** :
   - l'**URL du projet** (`Project URL`)
   - la clé **`anon` public**
   - la clé **`service_role`** (secrète — ne jamais l'exposer côté client)

### 3. Appliquer le schéma de base de données

Les migrations (dossier `supabase/migrations/`) créent toutes les tables, les politiques RLS et le **bucket de stockage `avatars`** (aucune étape manuelle nécessaire pour le stockage).

```bash
# Se connecter à la CLI puis lier le projet distant
supabase login
supabase link --project-ref <ref-de-ton-projet>

# Pousser les migrations vers la base
supabase db push
```

> 💡 Alternative sans CLI : copier/coller le contenu de `supabase/schema.sql` dans l'éditeur SQL de Supabase (ce fichier est un instantané du schéma final). Les migrations restent la référence à privilégier.

### 4. Configurer les variables d'environnement

Copie le fichier d'exemple puis remplis-le :

```bash
cp .env.example .env
```

Voir la section [Variables d'environnement](#-variables-denvironnement) ci-dessous pour le détail de chaque valeur.

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvre http://localhost:3000 🎉

---

## 🔐 Variables d'environnement

Toutes les variables vont dans un fichier **`.env`** à la racine du projet (ce fichier est ignoré par git). Un modèle est fourni dans **`.env.example`**.

| Variable | Obligatoire | Description | Où l'obtenir |
|----------|:-----------:|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL de ton projet Supabase | Supabase → Project Settings → API → *Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clé publique `anon` de Supabase | Supabase → Project Settings → API → *anon public* |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Clé secrète `service_role` (accès serveur à la base) | Supabase → Project Settings → API → *service_role* |
| `JWT_SECRET` | ✅ | Secret utilisé pour signer/vérifier les sessions JWT. Utilise une chaîne aléatoire longue. | Générer avec `openssl rand -base64 32` |
| `DEEPSEEK_API_KEY` | ⚠️ Optionnel | Clé API DeepSeek pour le chatbot Thierry. Sans elle, le bot s'affiche mais répond qu'il n'est pas configuré. | https://platform.deepseek.com/api_keys (nécessite du crédit) |

> ⚠️ **Sécurité** : `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` et `DEEPSEEK_API_KEY` sont **secrets** et ne doivent jamais être commités ni exposés côté navigateur. Seules les variables préfixées `NEXT_PUBLIC_` sont accessibles côté client.

---

## 📜 Scripts npm

| Commande | Effet |
|----------|-------|
| `npm run dev` | Lance le serveur de développement (http://localhost:3000) |
| `npm run build` | Construit l'application pour la production |
| `npm run start` | Démarre l'application buildée |
| `npm run lint` | Vérifie le code avec ESLint |

---

## 📁 Structure du projet

```
src/
├── app/                  # Routes (App Router)
│   ├── page.tsx          # Landing page
│   ├── login/ signup/    # Authentification
│   ├── dashboard/        # Tableau de bord du joueur
│   ├── play/             # Liste et création de salons
│   ├── game/[id]/        # Table de jeu multijoueur
│   ├── shop/             # Boutique (prêts + skins)
│   ├── friends/          # Amis
│   ├── ranking/          # Classement
│   └── rules/ terms/     # Règles & conditions
├── components/
│   ├── ui/               # Composants shadcn/ui
│   ├── landing/          # Sections de la page d'accueil
│   ├── auth/             # Panneau d'authentification
│   └── chat/             # Widget du chatbot Thierry
└── lib/
    ├── auth/             # Sessions JWT + server actions
    ├── game/             # Moteur de Blackjack + logique de manche
    ├── play/ shop/ friends/ ranking/   # Server actions par domaine
    ├── chat/             # Chatbot Thierry (DeepSeek) + base de connaissances
    └── supabase/         # Client Supabase serveur + types

supabase/
├── migrations/           # Migrations SQL (source de vérité du schéma)
├── schema.sql            # Instantané du schéma final (référence)
└── config.toml           # Configuration Supabase locale
```

---

## 🎮 Fonctionnalités principales

- **Comptes** : inscription (pseudo + mot de passe fort + avatar), 200 jetons offerts, connexion, sessions 30 jours.
- **Blackjack multijoueur** : salons publics/privés (code), jusqu'à 7 sièges, temps réel. Hit / Stand / Double / Split, assurance, side bets (Perfect Pairs, 21+3), sabot de 6 jeux avec carte de coupe.
- **Boutique** : prêts de jetons (intérêt fixe de 50 %) et skins de jetons (achat/revente).
- **Social** : demandes d'ami, classement mondial (top 50) et entre amis.
- **Progression** : badges (progression, victoires, jetons, blackjack…) et statistiques sur le dashboard.
- **Assistant IA « Thierry »** : chatbot (coin bas-droite) connecté à DeepSeek, qui connaît toutes les règles et la navigation du site.

> 💡 Toute la monnaie est **virtuelle**. Aucun argent réel n'est impliqué.

---

## 🤖 À propos du chatbot Thierry

Thierry est présent sur toutes les pages. Il utilise l'API DeepSeek et une base de connaissances (`src/lib/chat/knowledge.ts`) décrivant le site et les règles. Pour l'activer, renseigne `DEEPSEEK_API_KEY` dans `.env` (le compte DeepSeek doit disposer de crédit). Si tu modifies une fonctionnalité du jeu, pense à mettre à jour `knowledge.ts` pour que Thierry reste exact.
