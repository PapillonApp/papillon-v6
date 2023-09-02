# Papillon v6
Bienvenue à l'aube d'une nouvelle ère pour Papillon 👀

## Pour les contributeurs
Vous souhaitez contribuer à Papillon ? Voici quelques ressources pour vous aider à démarrer :
- [🍱 Composants](/components/README.md)

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


## À propos du projet
> "J'avais parlé de la possibilité d'une future réécriture de Papillon en React Native pendant les vacances pour une sortie possible à la rentrée 2023. Maintenant, je passe enfin à l'action." - Vince (@ecnivtwelve), 2023

La v6 de Papillon est une **réécriture** de la v5. Notre objectif est de conserver les mêmes concepts de structure et d'organisation interne pour faciliter la transition des APIs, tout en proposant une interface entièrement nouvelle.

Nous avons appris de nos erreurs passées et nous nous efforçons de ne pas les répéter. Notre but est de créer une application qui soit à la fois performante et agréable à utiliser.

### L'histoire de Papillon
Papillon a parcouru un long chemin depuis sa première version. Voici un aperçu de notre parcours :

La **version 1**, encore appelée `pronoteplus-app`, était une application très basique construite avec Ionic Framework et du JS vanilla. Un changement majeur de back-end a conduit à une nouvelle version.

La **version 2.0** a été créée à partir d'une nouvelle API plus efficace, mais a dû être remplacée en raison d'une structure de code trop complexe.

La **v3**, la plus populaire à ce jour, a été la première à porter le nom de code `Papillon`. Cette version avait deux objectifs principaux : simplifier la structure du code et améliorer l'interface utilisateur. Cependant, elle a dû être remplacée car elle était devenue trop lente en raison d'un code trop lourd et d'un manque de structure solide.

La **v4** a été créée dans le but de partir d'une nouvelle base, en passant du JS vanilla au framework Vue.js. Cependant, elle a été rapidement remplacée par l'arrivée d'un projet plus ambitieux et plus intéressant, la v5.

**Papillon v5**, la dernière version en date, est née d'une volonté : celle de ne pas reproduire les mêmes erreurs. Plusieurs mois après : le pari est réussi. Cependant, la v5 a atteint ses limites, notamment en termes de performances. L'application est lente et le devient de plus en plus avec le temps. La cause : l'utilisation d'une technologie web inadaptée aux appareils les plus anciens et causant des problèmes de performances.

**Papillon v6** a pris note des erreurs du passé et s'efforce d'avancer vers l'avenir. Pour la première fois, Papillon quitte le statut de webapp pour devenir une application native. Cela devrait permettre un gain significatif en termes de stabilité et de performances.

### Les défis et les solutions
Un des défis majeurs que la v6 doit relever est d'éviter le flop de la v4. Pourquoi ? La v4 a été créée dans les mêmes conditions : un changement majeur de technologie dans le but d'obtenir de meilleures performances. Cependant, le manque de connaissances en Vue.js à l'époque a conduit la v4 à devenir une "version test", déjà vouée à l'obsolescence.

Comment éviter de reproduire cela ? En gardant une idée claire en tête : **la structuration**. Le principal problème de la v4 était son manque de structure claire et le manque d'outils adaptés au développement mobile. La v6 résout ces deux problèmes en basant sa structure sur celle de la v5 qui fonctionne bien, et en utilisant un framework complet et reconnu : `react-native-papers`, avec la possibilité de s'en détacher à tout moment.

## Licence
Papillon est distribué sous licence MIT. Pour plus d'informations, veuillez consulter le fichier [LICENSE](licence.md).

