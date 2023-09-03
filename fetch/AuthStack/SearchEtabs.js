/* eslint-disable no-param-reassign */
function getCoordsFromPostal(_postal) {
  const postal = _postal.normalize('NFD').replace(/\p{Diacritic}/gu, '');

  if (postal.trim() === '') {
    return new Promise((resolve, reject) => {
      reject('Postal code is not valid');
    });
  }

  return fetch(`https://geocode.maps.co/search?q=france+${postal}`, {
    method: 'GET',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((result) => result);
}

function getPronoteEtabsFromCoords(lat, lon) {
  const body = new URLSearchParams();
  body.append('nomFonction', 'geoLoc');
  body.append('lat', lat);
  body.append('long', lon);

  return fetch('https://www.index-education.com/swie/geoloc.php', {
    headers: {
      accept: '*/*',
      'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'sec-ch-ua':
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'sec-gpc': '1',
    },
    referrer: 'http://localhost:8081/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: `data=%7B%22nomFonction%22%3A%22geoLoc%22%2C%22lat%22%3A${lat}%2C%22long%22%3A${lon}%7D`,
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
  })
    .then((response) => response.json())
    .then((res) => {
      // remove all items without URL
      const result = res.filter((item) => item.url.trim() !== '');

      // for each item in result, if url starts by 035, replace index-education.net by toutatice.fr
      result.forEach((item) => {
        if (item.url.startsWith('https://035')) {
          item.url = item.url.replace(
            'index-education.net',
            'pronote.toutatice.fr'
          );
        } else if (item.url.startsWith('https://022')) {
          item.url = item.url.replace(
            'index-education.net',
            'pronote.toutatice.fr'
          );
        } else if (item.url.startsWith('https://056')) {
          item.url = item.url.replace(
            'index-education.net',
            'pronote.toutatice.fr'
          );
        } else if (item.url.startsWith('https://029')) {
          item.url = item.url.replace(
            'index-education.net',
            'pronote.toutatice.fr'
          );
        }
      });

      return result;
    });
}

export { getCoordsFromPostal, getPronoteEtabsFromCoords };
