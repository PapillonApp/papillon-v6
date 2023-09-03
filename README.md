# 🦋 Papillon — Votre vie scolaire

Votre emploi du temps 📅, votre agenda 📓, vos notes 📝, vos news 📰 et bien plus encore en un clin d’œil grâce à l'application Papillon.

**📚 [Voir la documentation](<[https://github.com/PapillonApp/Papillon/wiki](https://docs.getpapillon.xyz/)>)**

## 🚀 Sommaire

- [À propos du projet](#-à-propos-du-projet)
- [Screenshots](#-screenshots)
- [Développé avec](#-développé-avec)
- [Pour commencer](#-pour-commencer)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
- [Usage](#-usage)
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
- [ ] Affichage des données _(Pronote en priorité)_
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
npm i
```

## 💻 Développement

Pour lancer l'application en mode développement, vous devez installer l'application prebuild (un mini expo go qui permet de charger l'application depuis votre PC avec un live reload)
Attention, cette partie est valable pour Android uniquement !
Requis : Android Studio

Pour commencer :

1. Modifiez le fichier `app.json` afin de modifier le nom de l'application ainsi que son package, pour éviter de remplacer la vraie appli.
2. Exécutez `npx expo prebuild`
3. Ouvrir Android Studio et ouvrir le dossier Android
4. Attendre que Android Studio ai terminé ses processus (visible en bas à droite)
5. Si le graddle sync ne s'est pas automatiquement exécuté, le faire via Files > Sync project with graddle Files
6. Connectez votre téléphone À votre PC et vérifiez qu'il soit accessible (il doit apparaître en haut à droite, à côté du marteau vert) (le mode débogage est requis)
7. Appuyer sur l'îcone "play" en haut à droite à côté du nom de votre téléphone pour démarrer le build et l'installer automatiquement sur votre téléphone.
8. Sur le PC, exécuter `npx expo start --dev-client --tunnel`
9. Lancer l'appli de dev sur le téléphone. Le serveur doit automatiquement s'afficher en haut, cliquez dessus pour commencer le chargement. Si ce n'est pas le cas, vérifiez que :

- Le wifi du PC est en mode privé (visible via les paramètres réseaux)
- Le téléphone et le PC sont connectés au même réseau

## 📈 Avancement

Nous travaillons actuellement sur la version 6.0.0 de l'application.

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
