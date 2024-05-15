<br/>
<p align="center">
  <a href="https://github.com/PapillonApp/Papillon">
    <img src="https://i.ibb.co/BL8qgJQ/image.png" alt="Logo" width="96" height="96">
  </a>
  <h1 align="center">Papillon — L'appli scolaire</h1>

  <p align="center">
    Votre emploi du temps 📅, votre agenda 📓, vos notes 📝, vos news 📰 et bien plus encore en un clin d’œil grâce à l'application Papillon.
    <br/>
    <br/>
    <a href="https://docs.getpapillon.xyz/"><strong>Voir la documentation »</strong></a><br><br>
  </p>

  <div class="badges" align="center">
        <img alt="Téléchargements" src="https://img.shields.io/github/downloads/PapillonApp/Papillon/total">
        <img alt="Contributeurs" src="https://img.shields.io/github/contributors/PapillonApp/Papillon?color=dark-green">
        <img alt="Problèmes" src="https://img.shields.io/github/issues/PapillonApp/Papillon">
        <img alt="License" src="https://img.shields.io/github/license/PapillonApp/Papillon">
        <br />
        <a href="https://discord.gg/vFmCwSzvAp">
            <img src="https://img.shields.io/badge/Discord-Rejoindre-5865F2?style=flat&amp;logo=discord&amp;logoColor=white" alt="Rejoindre notre serveur Discord">
        </a>
        <a href="https://www.instagram.com/thepapillonapp/">
            <img src="https://img.shields.io/badge/Instagram-thepapillonapp-E4405F?style=flat&amp;logo=instagram&amp;logoColor=white" alt="Nous suivre sur Instagram">
        </a>
    </div>
</p>

## 🚀 Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Développer](#-développer)
- [Contribuer](#-contribuer)
  - [Créer une Pull Request](#créer-une-pull-request)
- [License](#-license)

## Fonctionnalités

Voici un aperçu de ce que nous avons accompli jusqu'à présent et de ce qui reste à faire :

- 🏗️ Structure
  - 🗺️ Routage & Navigation (React Navigation)
  - 🔄 Appels à l'API
  - 🗄️ Gestion des données utilisateurs (Expo AsyncStorage)
  - 🎨 Intégration du Framework UI
- 🎓 Connexion à un service scolaire
  - 🏫 Interface de choix du service scolaire
    - [x] 🟢 Pronote
    - [ ] 🔵 EcoleDirecte
    - [ ] 🟡 Skolengo
  - 🏠 Interface de sélection de l'établissement
    - **Pour PRONOTE**
      - URL de l'établissement
      - Localisation de l'utilisateur
      - Renseignement de la localité (code postal / ville)
      - QR-code PRONOTE mobile
  - 🔑 Interface de connexion au service
    - **Pour PRONOTE**
      - Connexion par identifiants et mots de passe
      - Connexion par QR-Code mobile
      - Connexion par cookie d'ENT
  - 🔐 Appel à l'API pour se connecter et conservation de la session
- 📊 Affichage des données
  - 👤 Données utilisateur
  - 📅 Emploi du temps
  - 📝 Devoirs
  - 🏅 Notes
  - 🧠 Compétences
  - 📚 Contenu des cours
  - 📁 Fichiers
  - 📰 Actualités
  - 💬 Conversations
  - 🎒 Vie scolaire

## 📖 À propos du projet
Papillon est une application mobile qui vise à simplifier la vie scolaire des étudiants en France.

## 🛠 Développement
> Vous pouvez commencer à développer sur la **[documentation pour développeurs](https://developers.getpapillon.xyz/development/intro/)**.

## 👥 Contribuer
Nous accueillons les contributions de tous. Veuillez lire notre [guide de contribution](CONTRIBUTING.md) pour commencer.

### Créer une Pull Request
1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 🔒 Vie privée & confidentialité
Papillon est engagé à protéger les données de tous ses utilisateurs, pour fournir une expérience fiable et de confiance.

>L'application est gratuite, sans publicités, ne revend pas vos données, n'utilise pas de serveurs, n'utilise pas d'outils d'analyse, et ne récupère pas de logs de manière automatisée.

**Par souci de transparence, vous pouvez retrouver le fonctionnement exact du traitement des données et nos politiques sur : <https://safety.getpapillon.xyz/>**
<!-- Obliger de renommer le lien sinon, ça ajoute les étoiles dans l'URL -->

## 📄 Licence
Distribué sous la licence GPLv3. Voir [`LICENSE`](LICENSE) pour plus d'informations.
