# 🦋 Papillon — Votre vie scolaire

Votre emploi du temps 📅, votre agenda 📓, vos notes 📝, vos news 📰 et bien plus encore en un clin d’œil grâce à l'application Papillon.

**📚 [Voir la documentation](https://docs.getpapillon.xyz/)**

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

## 💻 Développement

Pour lancer l'application en mode développement, vous devez installer l'application prebuild (un mini expo go qui permet de charger l'application depuis votre PC avec un live reload)
> [!WARNING]
Ce tutoriel est dédié uniquement à Android !

Requis : Android Studio

Pour commencer :

1. Modifiez le fichier `app.json` afin de modifier le nom de l'application ainsi que son package, pour éviter de remplacer la vraie appli.

Ligne 3, variable `name`: remplacer par le nom de votre choix (exemple "Papillon Dev")

Ligne 46, variable `package`: remplacer par `plus.pronote.app.dev`. Ne pas changer cette variable entraînera une erreur à l'installation et un remplacement de l'appli officielle.

2. Exécutez `npx expo prebuild`
3. Ouvrir Android Studio et ouvrir le dossier Android
4. Attendre que Android Studio ai terminé ses processus (visible en bas à droite). Si le logiciel travaille, le statut sera indiqué dans l'encadré rouge (voir screen ci-dessous).

![image](https://github.com/LeMaitre4523/Papillon-v6/assets/54872374/92c93b54-d71a-4cfb-88c6-daa873b9a301)

5. Si le gradle sync ne s'est pas automatiquement exécuté, le faire via Files > Sync project with graddle Files

![image](https://github.com/LeMaitre4523/Papillon-v6/assets/54872374/313f8320-061c-4624-8f42-20a731378968)

6. Connectez votre téléphone à votre PC et vérifiez qu'il soit accessible (il doit apparaître en haut à droite, à côté du marteau vert) (le mode débogage est requis)

![image](https://github.com/LeMaitre4523/Papillon-v6/assets/54872374/e1c746bc-407a-41cb-a969-a21fe18e6a80)
> [!NOTE]
> Voir tutoriel : https://www.01net.com/astuces/android-comment-connecter-votre-smartphone-sur-windows-avec-adb.html

> [!NOTE]
Il est aussi possible de connecter le téléphone via wifi, avec la commande `adb pair` et `adb connect`. Pour cela, il faut se rendre dans les options de développement, cliquer sur "Débogage Wifi" et activer l'option. Cliquer ensuite sur "Associer l'appareil avec un code d'association". La fenêtre vous donnera un code et une adresse. Faites `adb pair <addresse complète>`, et renseignez le code d'association. Ensuite, revenez en arrière, regardez la variable "Adresse IP et port" et utilisez `adb connect <adresse ip et port>`. Votre téléphone devrait être connecté.

7. Appuyer sur l'îcone "play" en haut à droite à côté du nom de votre téléphone pour démarrer le build et l'installer automatiquement sur votre téléphone.

![image](https://github.com/LeMaitre4523/Papillon-v6/assets/54872374/ac2a0bb0-1e07-48fc-ac83-e753ac6a82cd)

> [!NOTE]
Vous pouvez consulter le statut du build en vous rendant dans l'onglet "Build" en bas du logiciel, ou dans View > Tool Window > Build.

9. Sur le PC, exécutez `npm start`
10. Lancer l'appli de dev sur le téléphone. Le serveur doit automatiquement s'afficher en haut, cliquez dessus pour commencer le chargement. Si ce n'est pas le cas, vérifiez que :

- Le wifi du PC est en mode privé (visible via les paramètres réseaux)
- Le téléphone et le PC sont connectés au même réseau
Si malgré tout le serveur ne s'affiche pas, un QR Code est généré dans le terminal. Utilisez votre appareil photo pour le scanner.

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
