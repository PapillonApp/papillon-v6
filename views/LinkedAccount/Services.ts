// authType :
// 0 : Aucune
// 1 : Username / Password
// 2 : Token
// 3 : OAuth
// 4 : QRCode
let Services = [
  {
    name: 'Restauration',
    services: [
      {
        logo: require('../../assets/logo/Turboself_logo.png'),
        name: 'Turboself',
        description: 'Réservation de repas en ligne',
        color: '#E32833',
        official: false,
        authType: 1,
        package: {
          name: 'Papillon-Turboself-Core',
          version: '1.0.0',
        }
      },
      {
        logo: require('../../assets/logo/WebRestos_logo.png'),
        name: 'WebRestos',
        description: 'Réservation de repas en ligne',
        official: false,
        color: '#FF5E00',
        authType: 1,
        package: {
          name: 'Papillon-WebRestos-Core',
          version: '1.0.0',
        }
      },
      {
        logo: require('../../assets/logo/Alise_logo.png'),
        name: 'Alise',
        description: 'Gestion d\'accès aux restaurants',
        official: false,
        color: '#3BA4DD',
        authType: 1,
        package: {
          name: 'Papillon-Alise-Core',
          version: '1.0.0',
        }
      },
    ],
  }
];

export default Services;
