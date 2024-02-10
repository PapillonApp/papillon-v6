# Papillon — Votre vie scolaire

> [!WARNING]  
> **Des modifications majeures de la structure de ce projet sont en cours**
> 
> Le fonctionnement du code risque de changer de manière importante, merci de ne pas merge sur `main`

Votre emploi du temps 📅, votre agenda 📓, vos notes 📝, vos news 📰 et bien plus encore en un clin d’œil grâce à l'application Papillon.

## 🚀 Sommaire

- [À propos du projet](#-à-propos-du-projet)
- [Développé avec](#-développé-avec)
- [Pour commencer](#-pour-commencer)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
- [Développement](#-développement)
- [Avancement](#-avancement)
- [Contribuer](#-contribuer)
  - [Créer une Pull Request](#créer-une-pull-request)
- [License](#-license)

## Feuille de route

Voici un aperçu de ce que nous avons accompli jusqu'à présent et de ce qui reste à faire :

- [x] Structure
  - [x] Routage & Navigation
  - [x] Appels à l'API
  - [x] Gestion des données utilisateurs (équivalent LocalStorage)
  - [x] Intégration du Framework UI (React Native Paper)
- [x] Connexion à un service scolaire _(Pronote pour le moment)_
  - [x] Interface de choix du service scolaire
  - [x] Interface de sélection de l'établissement
  - [x] Interface de connexion au service
  - [x] Appel à l'API pour se connecter et conservation de la session
- [x] Affichage des données _(Pronote en priorité)_
  - [x] Données utilisateur
  - [x] Emploi du temps
  - [x] Devoirs
  - [x] Notes
  - [x] Compétences
  - [x] Contenu des cours
  - [x] Fichiers
  - [x] Actualités
  - [x] Conversations
  - [x] Vie scolaire

## 📖 À propos du projet

Papillon est une application mobile qui vise à simplifier la vie scolaire des étudiants en France.

## 🛠 Développé avec

- React Native
- React Native Paper
- Expo
- Node.js

## 🎓 Pour commencer

### Prérequis

- Node.js (avec NPM)
- Expo CLI

### Installation

1. Clonez le repo

```sh
git clone https://github.com/PapillonApp/Papillon.git
```

2. Installez les packages NPM

```sh
npm install
```

### Développer à distance

Il est tout à fait possible d'avoir son pc chez soi et son téléphone au lycée (à titre d'exemple). Dans la ligne de commande, il faudra simplement rajouter `--tunnel`.
Le scan du QR Code sera requis pour connecter le téléphone au PC.

## 👥 Contribuer

Nous accueillons les contributions de tous. Veuillez lire notre [guide de contribution](CONTRIBUTING.md) pour commencer.

### Créer une Pull Request

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
