// Base de connaissances complète du site, injectée dans le prompt de Thierry.
// Tout est tiré du comportement réel du code (source de vérité). Si une règle
// change dans le code, mets ce fichier à jour pour que Thierry reste exact.

export const APP_KNOWLEDGE = `
=== PRÉSENTATION ===
Site de Blackjack multijoueur en ligne, 100% gratuit, avec une monnaie virtuelle (les "jetons"). JAMAIS d'argent réel. À l'inscription, chaque joueur reçoit 200 jetons offerts.

=== NAVIGATION ===
Avant connexion (page d'accueil "/") : présentation du jeu + boutons "Connexion" et "Inscription".
Après connexion, une barre de navigation en haut donne accès à :
- "Dashboard" (/dashboard) : tableau de bord du joueur.
- "Jouer" (/play) : liste des salons et création de partie.
- "Boutique" (/shop) : prêts et skins.
- "Amis" (/friends) : gérer ses amis.
- "Classement" (/ranking) : classements (icône trophée 🏆).
- "Règles" (/rules) : règles du Blackjack.
En haut à droite : l'avatar ouvre un menu avec la "Déconnexion".

=== COMPTE ===
INSCRIPTION (/signup) :
- Pseudo : au moins 3 caractères, unique (refusé s'il est déjà pris).
- Mot de passe : au moins 10 caractères, avec AU MOINS une minuscule, une majuscule, un chiffre et un caractère spécial.
- Confirmation du mot de passe : doit être identique.
- Avatar : image optionnelle à uploader.
- 200 jetons offerts.
CONNEXION (/login) : pseudo + mot de passe. La session reste active 30 jours.
DÉCONNEXION : menu de l'avatar en haut à droite.

=== JETONS ===
Monnaie virtuelle du jeu. Servent à miser au Blackjack et à acheter dans la boutique. On en gagne en gagnant des parties, on peut en emprunter via les prêts.

=== RÈGLES DU BLACKJACK ===
But : se rapprocher le plus possible de 21 SANS dépasser, et battre la main du croupier.
Valeur des cartes : 2 à 10 = valeur nominale ; Valet/Dame/Roi = 10 ; As = 1 ou 11 (la valeur la plus avantageuse sans dépasser 21).
Le sabot : 6 jeux de 52 cartes (312 cartes) mélangés. Une carte de coupe est placée entre 60% et 80% du sabot. Le sabot n'est pas remélangé entre chaque manche ; quand la carte de coupe est atteinte, le sabot est remélangé à la fin de la manche. Le nombre de cartes restantes est visible.
Mise : minimum 1 jeton, maximum = tout le solde du joueur. Pas de mise = on ne reçoit pas de cartes (spectateur).

=== DÉROULEMENT D'UNE MANCHE (MULTIJOUEUR) ===
Tout se joue dans des salons, autour d'une table pouvant aller jusqu'à 7 sièges. Un même joueur peut occuper plusieurs sièges et mise indépendamment sur chacun.
1. Countdown de 60 s : on s'assoit sur un siège libre et on place ses mises. Jetons disponibles pour miser : 1, 5, 25, 50, 100, 1000.
2. Distribution : 2 cartes à chaque joueur ayant misé, 2 au croupier (une visible, une cachée).
3. Si le croupier montre un As : phase d'assurance (20 s).
4. Tour des joueurs (chacun son tour, 20 s par action, sinon Stand automatique).
5. Tour du croupier : il révèle sa carte cachée, tire tant qu'il est à 16 ou moins, reste à 17 ou plus.
6. Résolution et affichage des résultats (~8 s), puis un nouveau countdown démarre automatiquement.

=== ACTIONS DU JOUEUR ===
- Hit (Tirer) : prendre une carte de plus. Si on dépasse 21 → "bust", mise perdue.
- Stand (Rester) : garder sa main, passer au suivant.
- Double : seulement sur les 2 premières cartes ; double la mise, reçoit UNE seule carte, puis stand automatique.
- Split (Séparer) : seulement si les 2 premières cartes ont la même valeur ; crée 2 mains indépendantes, chacune avec une mise égale à la mise de départ. Pas de re-split (une seule séparation). Split d'As : une seule carte par main, pas de Hit ensuite.

=== ASSURANCE ===
Proposée uniquement quand la carte visible du croupier est un As. On peut miser jusqu'à la moitié de sa mise principale. Si le croupier a un Blackjack, l'assurance paie 2:1. Sinon, elle est perdue. 20 s pour décider, sinon refus automatique.

=== GAINS ===
- Blackjack naturel (As + carte à 10 dès les 2 premières cartes) : paie 3:2 (mise × 1,5 de gain).
- Victoire (meilleure main que le croupier sans dépasser 21, ou croupier qui bust) : on double sa mise.
- Égalité (push, même total que le croupier) : mise rendue.
- Défaite ou bust : mise perdue.

=== SIDE BETS (mises secondaires, optionnelles, placées avant la distribution) ===
PERFECT PAIRS (les 2 premières cartes du joueur forment une paire) :
- Paire mixte (même valeur, couleurs différentes) : ×5
- Paire colorée (même valeur, même couleur) : ×10
- Paire parfaite (carte exactement identique) : ×30
21+3 (2 cartes du joueur + carte visible du croupier) :
- Flush (même enseigne) : ×5
- Straight (suite) : ×10
- Three of a kind (3 mêmes valeurs) : ×30
- Straight flush (suite + même enseigne) : ×40
- Suited three of a kind (3 cartes identiques) : ×100

=== SALONS (page /play) ===
- Salon public : visible dans la liste des salons ouverts, n'importe qui peut le rejoindre.
- Salon privé : créé avec un code à partager ; on le rejoint en entrant ce code.
- On peut créer son propre salon (lui donner un nom) ou rejoindre un salon existant.
- L'hôte (créateur) lance la partie.

=== BOUTIQUE — PRÊTS (page /shop) ===
But : emprunter des jetons quand on est à court. Tout est virtuel.
- Taux d'intérêt FIXE de 50%, fixé au moment de l'emprunt : à rembourser = montant emprunté × 1,5.
- Offres (emprunté → à rembourser) : 50→75, 100→150, 200→300, 500→750, 1000→1500, 2000→3000.
- Les jetons empruntés sont crédités immédiatement.
- Remboursement : à tout moment depuis la Boutique, en une ou plusieurs fois (de 1 jeton jusqu'au reste dû). Le remboursement est déduit du solde (il faut donc avoir les jetons).
- Un prêt est "en cours" tant qu'il n'est pas remboursé entièrement.
- On peut avoir plusieurs prêts en même temps, sans limite.
- Aucune date limite, aucune pénalité de retard, l'intérêt n'augmente jamais avec le temps.
- Les prêts en cours apparaissent aussi sur le Dashboard.

=== BOUTIQUE — SKINS (page /shop) ===
Les skins personnalisent l'apparence des jetons. Système d'achat/revente : la revente rapporte 50% du prix d'achat. Pour l'instant, seul le skin "Classique" (gratuit, par défaut) est disponible ; d'autres skins pourront être ajoutés plus tard.

=== AMIS (page /friends) ===
- Rechercher un joueur par pseudo (au moins 2 caractères) et lui envoyer une demande d'ami.
- Si la personne t'avait déjà envoyé une demande, l'ajout est validé automatiquement.
- On peut accepter ou refuser les demandes reçues, et annuler les demandes envoyées.
- La liste d'amis est triée du plus riche au moins riche en jetons.
- On peut retirer un ami.

=== CLASSEMENT (page /ranking) ===
- Classement mondial : les 50 meilleurs joueurs par nombre de jetons.
- Classement entre amis : toi et tes amis, triés par jetons.
- Ton rang mondial est affiché.

=== DASHBOARD (page /dashboard) ===
Affiche : solde de jetons, nombre de parties jouées, % de victoires, victoires totales, série de victoires actuelle et meilleure série, rang mondial et rang parmi les amis, un graphique d'évolution des jetons (7 jours / 30 jours / depuis le début), les parties récentes, les badges, la liste d'amis et les prêts en cours.

=== BADGES (affichés sur le Dashboard) ===
Objectifs à débloquer, chaque catégorie a 5 niveaux :
- Progression : jouer 1, 50, 200, 500, 1000 parties.
- Victoires : séries de 1, 5, 10, 20, 50 victoires d'affilée.
- Jetons : atteindre 500, 1000, 5000, 10000, 50000 jetons.
- Blackjack : réaliser 1, 10, 20, 50, 100 Blackjacks naturels.
Et des badges uniques : Premier ami, Première partie multijoueur, Premier skin.
`.trim();
