# 🦋 Papillon — Votre assistant de vie scolaire

Votre emploi du temps 📅, votre agenda 📓, vos notes 📝, vos news 📰 et bien plus encore en un clin d’œil grâce à l'application Papillon.

**📚 [Voir la documentation](https://github.com/PapillonApp/Papillon/wiki)**



## 🚀 Sommaire

* [À propos du projet](#-à-propos-du-projet)
* [Screenshots](#-screenshots)
* [Développé avec](#-développé-avec)
* [Pour commencer](#-pour-commencer)
   * [Prérequis](#prérequis)
   * [Installation](#installation)
* [Usage](#-usage)
* [Avancement](#-avancement)
* [Contribuer](#-contribuer)
   * [Créer une Pull Request](#créer-une-pull-request)
* [License](#-license)

## Feuille de route
Voici un aperçu de ce que nous avons accompli jusqu'à présent et de ce qui reste à faire :
- [x] Structure
    - [x] Routage & Navigation
    - [x] Appels à l'API
    - [x] Gestion des données utilisateurs (équivalent LocalStorage)
    - [x] Intégration du Framework UI (React Native Paper)
- [x] Connexion à un service scolaire *(Pronote pour le moment)*
    - [x] Interface de choix du service scolaire
    - [x] Interface de sélection de l'établissement
    - [x] Interface de connexion au service
    - [x] Appel à l'API pour se connecter et conservation de la session
- [ ] Affichage des données *(Pronote en priorité)*
    - [x] Données utilisateur
    - [x] Emploi du temps
    - [x] Devoirs
    - [x] Notes
    - [x] Compétences
    - [ ] Contenu des cours
    - [x] Fichiers
    - [x] Actualités
    - [ ] Conversations
    - [x] Vie scolaire

## 📖 À propos du projet

Papillon est une application mobile qui vise à simplifier la vie scolaire des étudiants en France.

## 📸 Screenshots

![Screenshot1](screenshot1.png)
![Screenshot2](screenshot2.png)

## 🛠 Développé avec

- React Native
- React Native Paper
- Expo
- Node.js

## 🎓 Pour commencer

### Prérequis

- Node.js
- Yarn
- Expo CLI

### Installation

1. Clonez le repo
```sh
git clone https://github.com/PapillonApp/Papillon.git
```

2. Installez les packages NPM
```sh
yarn install
```

## 🎮 Usage

Après l'installation, vous pouvez lancer l'application avec [expo start](file:///d%3A/Documents/Code/Papillon/package.json#6%2C15-6%2C15).

## 📈 Avancement

Nous travaillons actuellement sur la version 1.0.0 de l'application.

## 👥 Contribuer

Nous accueillons les contributions de tous. Veuillez lire notre [guide de contribution](CONTRIBUTING.md) pour commencer.

### Créer une Pull Request

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
