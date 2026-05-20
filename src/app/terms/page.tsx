"use client";

import Link from "next/link";
import { useState } from "react";
import { Spade, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tabs = [
  { id: "mentions", label: "Mentions légales" },
  { id: "cgu", label: "CGU" },
  { id: "confidentialite", label: "Confidentialité" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function LegalNotice() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Mentions légales</h2>
        <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : [Date]</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">1. Éditeur du site</h3>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Information</TableHead>
                  <TableHead>Détail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Raison sociale</TableCell><TableCell className="text-muted-foreground">[Nom de la société]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Forme juridique</TableCell><TableCell className="text-muted-foreground">[SAS / SARL / etc.]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Capital social</TableCell><TableCell className="text-muted-foreground">[Montant] euros</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Siège social</TableCell><TableCell className="text-muted-foreground">[Adresse complète]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">SIREN</TableCell><TableCell className="text-muted-foreground">[Numéro SIREN]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">SIRET</TableCell><TableCell className="text-muted-foreground">[Numéro SIRET]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">RCS</TableCell><TableCell className="text-muted-foreground">[Ville d&apos;immatriculation] B [Numéro RCS]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">TVA intracommunautaire</TableCell><TableCell className="text-muted-foreground">[Numéro TVA]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Directeur de la publication</TableCell><TableCell className="text-muted-foreground">[Prénom Nom]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Email</TableCell><TableCell className="text-muted-foreground">[contact@domaine.com]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Téléphone</TableCell><TableCell className="text-muted-foreground">[+33 X XX XX XX XX]</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">2. Hébergeur</h3>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Hébergement web</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-medium">Raison sociale</TableCell><TableCell className="text-muted-foreground">Vercel Inc.</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Adresse</TableCell><TableCell className="text-muted-foreground">440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Site web</TableCell><TableCell className="text-muted-foreground">vercel.com</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Téléphone</TableCell><TableCell className="text-muted-foreground">+1 (559) 288-7060</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Stockage des données</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-medium">Raison sociale</TableCell><TableCell className="text-muted-foreground">Supabase Inc.</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Adresse</TableCell><TableCell className="text-muted-foreground">970 Toa Payoh North #07-04, Singapore 318992</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Site web</TableCell><TableCell className="text-muted-foreground">supabase.com</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">3. Propriété intellectuelle</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          L&apos;ensemble des éléments composant le site BlackJack (textes, graphismes, images, logos, icônes, sons, logiciels, structure générale, base de données) est la propriété exclusive de [Nom de la société] ou de ses partenaires.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Toute représentation, reproduction, exploitation, modification ou redistribution totale ou partielle du contenu du site, par quelque procédé que ce soit, sans l&apos;autorisation préalable et écrite de [Nom de la société], est strictement interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Les marques, logos et signes distinctifs reproduits sur le site sont la propriété de [Nom de la société]. Toute utilisation non autorisée de ces éléments engage la responsabilité de leur auteur.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">4. Données personnelles et RGPD</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le site BlackJack collecte et traite des données personnelles dans le cadre de son fonctionnement (création de compte, gestion du profil, fonctionnalités sociales).
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi n°78-17 du 6 janvier 1978 modifiée relative à l&apos;informatique, aux fichiers et aux libertés, vous disposez des droits suivants :
        </p>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Droit</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Droit d&apos;accès</TableCell><TableCell className="text-muted-foreground">Obtenir la confirmation que vos données sont traitées et en obtenir une copie</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Droit de rectification</TableCell><TableCell className="text-muted-foreground">Demander la correction de données inexactes ou incomplètes</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Droit à l&apos;effacement</TableCell><TableCell className="text-muted-foreground">Demander la suppression de vos données personnelles</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Droit à la limitation</TableCell><TableCell className="text-muted-foreground">Demander la suspension du traitement de vos données</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Droit à la portabilité</TableCell><TableCell className="text-muted-foreground">Recevoir vos données dans un format structuré et couramment utilisé</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Droit d&apos;opposition</TableCell><TableCell className="text-muted-foreground">Vous opposer au traitement de vos données pour des motifs légitimes</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm text-muted-foreground">
          Pour exercer ces droits, contactez-nous à : [dpo@domaine.com]
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vous disposez également du droit de déposer une réclamation auprès de la CNIL : cnil.fr
        </p>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-medium">Responsable du traitement</TableCell><TableCell className="text-muted-foreground">[Prénom Nom], [fonction]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">DPO</TableCell><TableCell className="text-muted-foreground">[Prénom Nom], joignable à [dpo@domaine.com]</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">5. Cookies</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le site BlackJack utilise uniquement des cookies strictement nécessaires au fonctionnement du service :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Cookies de session / authentification</strong> : permettent de maintenir votre connexion active et de sécuriser votre session utilisateur</li>
              <li><strong className="text-foreground">Cookies de préférences techniques</strong> : permettent de mémoriser vos paramètres d&apos;affichage</li>
            </ul>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Ces cookies sont exemptés de consentement conformément aux recommandations de la CNIL, car ils sont indispensables à la fourniture du service expressément demandé par l&apos;utilisateur.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Aucun cookie publicitaire, analytique ou de suivi tiers n&apos;est utilisé sur ce site.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">6. Nature du service</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          BlackJack est un jeu en ligne <strong className="text-foreground">100% gratuit</strong> utilisant exclusivement une monnaie virtuelle (jetons). Aucun argent réel n&apos;est impliqué, ni en entrée ni en sortie. Les jetons virtuels n&apos;ont aucune valeur monétaire et ne peuvent en aucun cas être échangés contre de l&apos;argent réel, des biens ou des services.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ce site <strong className="text-foreground">ne constitue pas un site de jeu d&apos;argent</strong> et n&apos;est pas soumis à la réglementation de l&apos;Autorité Nationale des Jeux (ANJ).
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">7. Limitation de responsabilité</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          [Nom de la société] s&apos;efforce d&apos;assurer au mieux l&apos;exactitude et la mise à jour des informations diffusées sur le site, dont elle se réserve le droit de corriger le contenu à tout moment et sans préavis. [Nom de la société] ne peut toutefois garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          [Nom de la société] décline toute responsabilité :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>En cas d&apos;interruption du site pour des opérations de maintenance technique ou de mise à jour</li>
              <li>En cas d&apos;impossibilité momentanée d&apos;accès au site liée à des problèmes techniques indépendants de sa volonté</li>
              <li>En cas de dommages directs ou indirects causés à l&apos;utilisateur résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utilisation du site</li>
              <li>En cas d&apos;utilisation anormale ou frauduleuse du site par un utilisateur ou un tiers</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">8. Loi applicable et juridiction compétente</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </div>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Conditions Générales d&apos;Utilisation</h2>
        <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : [Date]</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">1. Objet</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Les présentes Conditions Générales d&apos;Utilisation (ci-après &ldquo;CGU&rdquo;) ont pour objet de définir les modalités et conditions d&apos;utilisation du site BlackJack (ci-après &ldquo;le Site&rdquo;) édité par [Nom de la société] (ci-après &ldquo;l&apos;Éditeur&rdquo;).
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          L&apos;inscription et l&apos;utilisation du Site impliquent l&apos;acceptation pleine et entière des présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le Site.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">2. Description du service</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le Site propose un jeu de Blackjack en ligne <strong className="text-foreground">entièrement gratuit</strong>, utilisant exclusivement une monnaie virtuelle (jetons). Le service comprend :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Un jeu de Blackjack jouable en solo (contre un croupier virtuel) ou en multijoueur</li>
              <li>Un système de compte utilisateur avec profil personnalisable</li>
              <li>Un système de progression avec badges et succès</li>
              <li>Une boutique virtuelle (prêts de jetons, skins de jetons)</li>
              <li>Un système social (liste d&apos;amis, classement)</li>
            </ul>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Les jetons virtuels n&apos;ont aucune valeur monétaire réelle.</strong> Ils ne peuvent en aucun cas être échangés, vendus, transférés ou convertis en argent réel, en biens ou en services. Le Site ne constitue pas un site de jeu d&apos;argent et de hasard au sens de la loi n°2010-476 du 12 mai 2010.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">3. Inscription et compte utilisateur</h3>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>3.1 Conditions d&apos;inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pour utiliser le Site, l&apos;utilisateur doit créer un compte en fournissant :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Un pseudo unique</li>
              <li>Un mot de passe</li>
              <li>Un avatar (optionnel)</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>3.2 Responsabilité du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              L&apos;utilisateur est seul responsable de la confidentialité de ses identifiants de connexion (pseudo et mot de passe). Toute activité réalisée depuis son compte est réputée effectuée par lui.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              En cas de suspicion d&apos;utilisation non autorisée de son compte, l&apos;utilisateur doit en informer immédiatement l&apos;Éditeur à l&apos;adresse [contact@domaine.com].
            </p>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>3.3 Exactitude des informations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de son inscription et à les maintenir à jour.
            </p>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>3.4 Unicité du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chaque utilisateur ne peut détenir qu&apos;un seul compte. La création de comptes multiples (multi-comptes) est strictement interdite et peut entraîner la suspension ou la suppression de l&apos;ensemble des comptes concernés.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">4. Jetons virtuels</h3>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>4.1 Attribution initiale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Lors de la création de son compte, chaque utilisateur reçoit un solde initial de 200 jetons virtuels.
            </p>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>4.2 Nature des jetons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Les jetons virtuels sont un élément de jeu interne au Site. Ils :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>N&apos;ont aucune valeur monétaire réelle</li>
              <li>Ne peuvent pas être achetés avec de l&apos;argent réel</li>
              <li>Ne peuvent pas être échangés contre de l&apos;argent réel, des biens ou des services</li>
              <li>Ne peuvent pas être transférés entre utilisateurs en dehors des mécanismes prévus par le jeu</li>
              <li>Restent la propriété de l&apos;Éditeur à tout moment</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>4.3 Système de prêt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Le Site propose un système de prêt de jetons virtuels avec un taux d&apos;intérêt fixe de 50%. L&apos;utilisateur peut emprunter des jetons et les rembourser à tout moment. Ce système est purement virtuel et ne constitue en aucun cas un prêt financier au sens de la réglementation bancaire.
            </p>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>4.4 Perte de jetons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              L&apos;Éditeur ne saurait être tenu responsable de la perte de jetons virtuels résultant du fonctionnement normal du jeu (paris perdus) ou d&apos;une maintenance technique.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">5. Boutique et skins</h3>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>5.1 Achats virtuels</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Les skins de jetons disponibles en boutique s&apos;achètent exclusivement avec des jetons virtuels. Aucun achat en argent réel n&apos;est proposé.
            </p>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>5.2 Revente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Les skins peuvent être revendus à hauteur de 50% de leur prix d&apos;achat en jetons virtuels.
            </p>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>5.3 Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              L&apos;achat de skins est impossible tant que l&apos;utilisateur a un prêt de jetons en cours.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">6. Règles de conduite</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">L&apos;utilisateur s&apos;engage à :</p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Utiliser le Site de manière loyale et respectueuse</li>
              <li>Ne pas utiliser de logiciels, scripts, bots ou tout autre moyen automatisé pour interagir avec le Site</li>
              <li>Ne pas exploiter de bugs, failles ou erreurs du Site pour obtenir un avantage indu</li>
              <li>Ne pas tenter de contourner les mesures de sécurité du Site</li>
              <li>Ne pas usurper l&apos;identité d&apos;un autre utilisateur</li>
              <li>Ne pas harceler, menacer ou intimider d&apos;autres utilisateurs</li>
              <li>Ne pas diffuser de contenu illicite, offensant, discriminatoire ou inapproprié (notamment via le pseudo ou l&apos;avatar)</li>
              <li>Ne pas tenter de vendre, acheter ou échanger des comptes, jetons ou skins en dehors du Site</li>
              <li>Respecter les droits de propriété intellectuelle de l&apos;Éditeur et des tiers</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">7. Sanctions</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          En cas de violation des présentes CGU, l&apos;Éditeur se réserve le droit, sans préavis ni indemnité, de :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Avertir l&apos;utilisateur</li>
              <li>Suspendre temporairement le compte de l&apos;utilisateur</li>
              <li>Réinitialiser le solde de jetons virtuels de l&apos;utilisateur</li>
              <li>Révoquer les badges, skins ou avantages obtenus de manière frauduleuse</li>
              <li>Supprimer définitivement le compte de l&apos;utilisateur</li>
            </ul>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          La décision de sanction est prise à la seule discrétion de l&apos;Éditeur, en fonction de la gravité et de la récurrence des manquements constatés. L&apos;utilisateur sera informé par tout moyen de la sanction appliquée.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          L&apos;utilisateur peut contester une sanction en contactant l&apos;Éditeur à [contact@domaine.com].
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">8. Propriété intellectuelle</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          L&apos;ensemble des éléments du Site (code source, design, textes, images, logos, sons, animations, bases de données) est protégé par le droit de la propriété intellectuelle et reste la propriété exclusive de l&apos;Éditeur.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          L&apos;utilisateur ne dispose que d&apos;un droit d&apos;usage personnel, non exclusif et non transférable du Site, dans le cadre de son utilisation normale.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Toute reproduction, représentation, modification, distribution ou exploitation non autorisée de tout ou partie du Site est strictement interdite.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">9. Disponibilité du service</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          L&apos;Éditeur s&apos;efforce de maintenir le Site accessible 24h/24 et 7j/7, mais ne garantit pas une disponibilité permanente. Le Site peut être temporairement indisponible en raison de :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Opérations de maintenance technique</li>
              <li>Mises à jour du service</li>
              <li>Pannes techniques</li>
              <li>Événements de force majeure</li>
            </ul>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          L&apos;Éditeur ne saurait être tenu responsable des conséquences d&apos;une indisponibilité temporaire du Site.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">10. Suppression de compte</h3>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>10.1 À l&apos;initiative de l&apos;utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              L&apos;utilisateur peut demander la suppression de son compte à tout moment depuis son profil ou en contactant l&apos;Éditeur à [contact@domaine.com].
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La suppression du compte entraîne la perte définitive et irréversible de l&apos;ensemble des données associées (jetons, badges, skins, amis, historique de parties) dans un délai de 30 jours.
            </p>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>10.2 À l&apos;initiative de l&apos;Éditeur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              L&apos;Éditeur se réserve le droit de supprimer un compte en cas de :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Violation des présentes CGU</li>
              <li>Inactivité prolongée (plus de 12 mois sans connexion)</li>
              <li>Demande légale ou judiciaire</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              L&apos;utilisateur sera informé préalablement, sauf en cas d&apos;urgence ou d&apos;obligation légale.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">11. Limitation de responsabilité</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le Site est fourni &ldquo;en l&apos;état&rdquo; et &ldquo;selon disponibilité&rdquo;. L&apos;Éditeur ne garantit pas que le Site sera exempt d&apos;erreurs, de bugs ou d&apos;interruptions. L&apos;Éditeur ne saurait être tenu responsable :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Des dommages directs ou indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utilisation du Site</li>
              <li>De la perte de jetons virtuels, badges, skins ou toute autre donnée de jeu</li>
              <li>Des actions ou comportements d&apos;autres utilisateurs</li>
              <li>Du contenu généré par les utilisateurs (pseudos, avatars)</li>
              <li>Des interruptions de service, quelle qu&apos;en soit la cause</li>
            </ul>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          La responsabilité totale de l&apos;Éditeur, toutes causes confondues, ne saurait excéder la somme de 0 euros, le service étant entièrement gratuit.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">12. Modification des CGU</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle via le Site.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          La poursuite de l&apos;utilisation du Site après modification des CGU vaut acceptation des nouvelles conditions. Si l&apos;utilisateur refuse les nouvelles CGU, il doit cesser d&apos;utiliser le Site et peut demander la suppression de son compte.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">13. Droit applicable et litiges</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Les présentes CGU sont régies par le droit français.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGU, les parties s&apos;engagent à rechercher une solution amiable avant toute action judiciaire.
        </p>
        <Card className="mt-4">
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Conformément aux articles L.611-1 et suivants du Code de la consommation, l&apos;utilisateur peut recourir gratuitement au service de médiation de la consommation. Le médiateur compétent est : [Nom du médiateur], [Adresse], [Site web].
            </p>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          À défaut de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">14. Contact</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Pour toute question relative aux présentes CGU, vous pouvez nous contacter :
        </p>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-medium">Email</TableCell><TableCell className="text-muted-foreground">[contact@domaine.com]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Courrier</TableCell><TableCell className="text-muted-foreground">[Nom de la société], [Adresse complète]</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Politique de confidentialité</h2>
        <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : [Date]</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">1. Introduction</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          La présente politique de confidentialité décrit la manière dont [Nom de la société] (ci-après &ldquo;nous&rdquo;, &ldquo;notre&rdquo;, &ldquo;nos&rdquo;) collecte, utilise, stocke et protège les données personnelles des utilisateurs (ci-après &ldquo;vous&rdquo;, &ldquo;votre&rdquo;, &ldquo;vos&rdquo;) du site BlackJack (ci-après &ldquo;le Site&rdquo;).
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Nous nous engageons à respecter votre vie privée et à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi n°78-17 du 6 janvier 1978 modifiée.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">2. Responsable du traitement</h3>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-medium">Raison sociale</TableCell><TableCell className="text-muted-foreground">[Nom de la société]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Adresse</TableCell><TableCell className="text-muted-foreground">[Adresse complète]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Email</TableCell><TableCell className="text-muted-foreground">[contact@domaine.com]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">DPO</TableCell><TableCell className="text-muted-foreground">[Prénom Nom] — [dpo@domaine.com]</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">3. Données collectées</h3>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>3.1 Données fournies par l&apos;utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donnée</TableHead>
                  <TableHead>Finalité</TableHead>
                  <TableHead>Base légale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Pseudo</TableCell><TableCell className="text-muted-foreground">Identification sur le site, affichage dans le jeu</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Mot de passe (hashé)</TableCell><TableCell className="text-muted-foreground">Authentification et sécurisation du compte</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Avatar</TableCell><TableCell className="text-muted-foreground">Personnalisation du profil</TableCell><TableCell className="text-muted-foreground">Consentement</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>3.2 Données générées par l&apos;utilisation du service</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donnée</TableHead>
                  <TableHead>Finalité</TableHead>
                  <TableHead>Base légale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Solde de jetons virtuels</TableCell><TableCell className="text-muted-foreground">Fonctionnement du jeu</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Historique de parties</TableCell><TableCell className="text-muted-foreground">Statistiques, badges, progression</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Liste d&apos;amis</TableCell><TableCell className="text-muted-foreground">Fonctionnalité sociale</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Badges obtenus</TableCell><TableCell className="text-muted-foreground">Système de progression</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Skins possédés</TableCell><TableCell className="text-muted-foreground">Personnalisation</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Prêts de jetons</TableCell><TableCell className="text-muted-foreground">Fonctionnement de la boutique</TableCell><TableCell className="text-muted-foreground">Exécution du contrat</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>3.3 Données collectées automatiquement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donnée</TableHead>
                  <TableHead>Finalité</TableHead>
                  <TableHead>Base légale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Cookies de session</TableCell><TableCell className="text-muted-foreground">Maintien de la connexion</TableCell><TableCell className="text-muted-foreground">Intérêt légitime</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Date et heure de connexion</TableCell><TableCell className="text-muted-foreground">Sécurité du compte</TableCell><TableCell className="text-muted-foreground">Intérêt légitime</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">4. Finalités du traitement</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vos données personnelles sont collectées et traitées pour les finalités suivantes :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Création et gestion de votre compte utilisateur</li>
              <li>Authentification et sécurisation de l&apos;accès à votre compte</li>
              <li>Fonctionnement du jeu (parties, jetons, mises)</li>
              <li>Système de progression (badges, statistiques)</li>
              <li>Fonctionnalités sociales (amis, classement)</li>
              <li>Boutique (prêts de jetons, skins)</li>
              <li>Communication relative au service (notifications techniques)</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">5. Destinataires des données</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vos données personnelles sont accessibles aux destinataires suivants :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><strong className="text-foreground">[Nom de la société]</strong> : équipe technique pour l&apos;administration du site</li>
              <li><strong className="text-foreground">Supabase Inc.</strong> : hébergement de la base de données (sous-traitant, données hébergées sur des serveurs conformes au RGPD)</li>
              <li><strong className="text-foreground">Vercel Inc.</strong> : hébergement du site web (sous-traitant)</li>
            </ul>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vos données personnelles ne sont en aucun cas vendues, louées ou cédées à des tiers à des fins commerciales ou publicitaires.
        </p>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Données visibles par les autres utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Pseudo</li>
              <li>Avatar</li>
              <li>Nombre de jetons</li>
              <li>Skin actif</li>
              <li>Badges obtenus</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">6. Durée de conservation</h3>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Donnée</TableHead>
                  <TableHead>Durée de conservation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Données du compte (pseudo, avatar, mot de passe)</TableCell><TableCell className="text-muted-foreground">Durée de vie du compte + 30 jours après suppression</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Données de jeu (parties, jetons, badges, skins)</TableCell><TableCell className="text-muted-foreground">Durée de vie du compte + 30 jours après suppression</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Liste d&apos;amis</TableCell><TableCell className="text-muted-foreground">Durée de vie du compte</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Cookies de session</TableCell><TableCell className="text-muted-foreground">Durée de la session ou 30 jours maximum</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Logs de connexion</TableCell><TableCell className="text-muted-foreground">12 mois</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          En cas de suppression de compte, l&apos;ensemble de vos données personnelles sera effacé dans un délai de 30 jours, à l&apos;exception des données que nous sommes légalement tenus de conserver.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">7. Sécurité des données</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nous mettons en oeuvre les mesures techniques et organisationnelles appropriées pour protéger vos données personnelles :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Mots de passe hashés (jamais stockés en clair)</li>
              <li>Communications chiffrées via HTTPS/TLS</li>
              <li>Accès à la base de données restreint et sécurisé</li>
              <li>Authentification par token de session sécurisé</li>
              <li>Mises à jour régulières des dépendances et correctifs de sécurité</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">8. Cookies</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le site utilise uniquement des <strong className="text-foreground">cookies strictement nécessaires</strong> :
        </p>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cookie</TableHead>
                  <TableHead>Finalité</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Consentement requis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Session Supabase</TableCell>
                  <TableCell className="text-muted-foreground">Authentification et maintien de la connexion</TableCell>
                  <TableCell className="text-muted-foreground">Durée de la session / 30 jours</TableCell>
                  <TableCell className="text-muted-foreground">Non (cookie technique)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Aucun cookie publicitaire, analytique ou de suivi tiers n&apos;est déposé sur votre terminal.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Conformément aux recommandations de la CNIL, les cookies strictement nécessaires au fonctionnement du service sont exemptés du recueil de consentement.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">9. Vos droits</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
        </p>
        <Card className="mt-4">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Droit</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Accès</TableCell><TableCell className="text-muted-foreground">Obtenir une copie de l&apos;ensemble de vos données personnelles</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Rectification</TableCell><TableCell className="text-muted-foreground">Corriger des données inexactes ou incomplètes</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Effacement</TableCell><TableCell className="text-muted-foreground">Demander la suppression de vos données</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Limitation</TableCell><TableCell className="text-muted-foreground">Demander la suspension du traitement</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Portabilité</TableCell><TableCell className="text-muted-foreground">Recevoir vos données dans un format structuré (JSON, CSV)</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Opposition</TableCell><TableCell className="text-muted-foreground">Vous opposer au traitement pour motifs légitimes</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Comment exercer vos droits</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-medium">Par email</TableCell><TableCell className="text-muted-foreground">[dpo@domaine.com]</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Par courrier</TableCell><TableCell className="text-muted-foreground">[Nom de la société], [Adresse complète]</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nous nous engageons à répondre à votre demande dans un délai d&apos;un mois à compter de sa réception. Ce délai peut être prolongé de deux mois en cas de complexité de la demande.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          En cas de doute raisonnable sur votre identité, nous pourrons vous demander de fournir des informations complémentaires pour confirmer votre identité.
        </p>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Réclamation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Si vous estimez que le traitement de vos données ne respecte pas la réglementation en vigueur, vous pouvez introduire une réclamation auprès de la CNIL :
            </p>
            <Table>
              <TableBody>
                <TableRow><TableCell className="font-medium">Site web</TableCell><TableCell className="text-muted-foreground">cnil.fr</TableCell></TableRow>
                <TableRow><TableCell className="font-medium">Adresse</TableCell><TableCell className="text-muted-foreground">CNIL, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">10. Transferts de données hors UE</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Certains de nos sous-traitants (Vercel, Supabase) peuvent être amenés à traiter des données en dehors de l&apos;Union européenne, notamment aux États-Unis.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ces transferts sont encadrés par :
        </p>
        <Card className="mt-4">
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Les clauses contractuelles types (CCT) approuvées par la Commission européenne</li>
              <li>Le Data Privacy Framework (DPF) UE-États-Unis, le cas échéant</li>
            </ul>
          </CardContent>
        </Card>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nous nous assurons que nos sous-traitants offrent des garanties suffisantes quant à la mise en oeuvre de mesures techniques et organisationnelles appropriées.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">11. Mineurs</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le site BlackJack est accessible à tous les âges. Toutefois, si vous êtes mineur, nous vous recommandons de consulter vos parents ou tuteurs légaux avant de créer un compte.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Aucune donnée sensible n&apos;est collectée et aucun argent réel n&apos;est impliqué dans l&apos;utilisation du service.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold">12. Modifications de la politique</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. En cas de modification substantielle, les utilisateurs seront informés via le site.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          La date de dernière mise à jour est indiquée en haut de ce document.
        </p>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("mentions");

  const tabContent: Record<TabId, React.ReactNode> = {
    mentions: <LegalNotice />,
    cgu: <TermsOfService />,
    confidentialite: <PrivacyPolicy />,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Spade className="h-6 w-6 fill-emerald-500 text-emerald-500" />
            <span className="text-lg font-bold tracking-tight">BlackJack</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/10 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 px-4 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
