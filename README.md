# papillon-v6
Serait-ce le début d'une nouvelle ère pour Papillon 👀

## Pour les contributeurs
- [🍱 Composants](/components/README.md)

## Roadmap
- [x] Structure
    - [x] Routage & Navigation
    - [x] Appels à l'API
    - [x] Données utilisateurs (équivalent LocalStorage)
    - [x] Framework UI (React Native Paper)
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


## Le projet
> J'avais parlé de la possibilité d'une future réécriture de Papillon en React Native pendant les vacances pour une sortie possible à la rentrée 2023. Maintenant, je passe enfin à l'action -  Vince (@ecnivtwelve), 2023

La v6 de Papillon serait donc une **réécriture** de la v5, dans le sens ou celle ci doit garder les mêmes concepts de structure et d'organisation interne, afin de faciliter la transition des APIs. Cependant, l'interface de l'app sera entièrement nouvelle.

L'idée derrière la notion de réécriture est de ne pas réinventer la roue et de pouvoir réutiliser ce sur quoi nous avons travaillé pendant plusieurs mois.

### Encore une nouvelle version ?
Revenons en arrière dans la chronologie de Papillon.

La **version 1**, encore appelée `pronoteplus-app` fonctionnait de manière très primaire avec Ionic Framework et du JS vanilla. Un changement majeur de back-end à conduit à une nouvelle version.

La **version 2.0** est donc née à partir d'une nouvelle API bien plus efficace, mais celle ci à été remplacée à cause d'une structure de code trop compliquée.

La **v3** (la plus populaire) à été la première à porter comme nom de code `Papillon`. Cette version avait 2 objectifs majeurs : simplifier la structure du code et améliorer l'interface utilisateur. Celle ci à été remplacée, devenue trop lente à cause d'un code devenu trop lourd et d'un manque de structure solide.

La **v4** est née de la volonté de partir d'une vraie nouvelle base, en quittant le JS vanilla pour le framework Vue.js. Mais celle-ci à été vite remplacée par l'arrivée d'un projet plus ambitieux et plus intéressant, la v5.

**Papillon v5** est la dernière version en date. Celle ci est partie d'une volonté : celle de ne pas reproduire encore et encore les mêmes erreurs. Plusieurs mois après : le pari est réussi. Mais il se pose une limite à la v5, et une limite majeure : ses performances. L'app est lente, et elle le devient de plus en plus avec le temps. La cause : l'usage d'une technologie web inadaptée aux appareils les plus anciens et causant des problèmes de performances.

**Papillon v6** a pris des notes des erreurs du passé, en essayant d'avancer vers l'avenir. Pour la première fois, Papillon quitte le statut de webapp et devient une application native. Cela va permettre un gain de stabilité et de performances très intéressant.

### Le risque & la solution
Une chose que la v6 doit prendre en compte, c'est le flop de la v4. Pourquoi ? Celle-ci est née dans les mêmes conditions : un changement majeur de technologie dans la volonté d'obtenir de meilleures performances. Cependant, le manque de connaissances en Vue.js de l'époque a conduit la v4 à devenir une "version test", déjà amenée à s'éteindre.

Comment ne pas reproduire cela ? En gardant une idée claire en tête : **la structuration**. Le principal problème de la v4 était son manque de structure claire et le manque d'outils adaptés au développement mobile. La v6 résout ces 2 problèmes en basant sa structure sur celle de la v5 qui fonctionne bien, et en se basant sur un framework complet et reconnu : `react-native-papers`, avec la possibilité de s'en détacher à tout instant.

## License
Distribué sous licence MIT. Rendez vous sur [LICENSE](licence.md) pour plus d'informations.
