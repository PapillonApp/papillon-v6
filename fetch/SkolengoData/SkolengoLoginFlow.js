import { deserialize } from 'jsonapi-fractal';

import { SkolengoBase } from './SkolengoBase';

export class SkolengoStatic extends SkolengoBase {
  static getSchools = (
    { text, lat, lon },
    { limit, offset } = {
      limit: 100,
      offset: 0,
    }
  ) =>
    fetch(
      `${this.BASE_URL}/schools${this.searchParamsSerialiser({
        page: {
          limit,
          offset,
        },
        filter: {
          text: text || undefined,
          lat: lat || undefined,
          lon: lon || undefined,
        },
      })}`
    )
      .then((res) => res.json())
      .then((res) => deserialize(res));

  static getSSchools = (
    { text, lat, lon },
    { limit, offset } = {
      limit: 10,
      offset: 0,
    }
  ) => {
    console.log('search');
    return fetch({
      url: `${SkolengoStatic.BASE_URL}/schools`,
      method: 'GET',
      params: {
        page: {
          limit,
          offset,
        },
        filter: {
          text: text ?? undefined,
          lat: lat ?? undefined,
          lon: lon ?? undefined,
        },
      },
    })
      .then((res) => res.json())
      .then((res) => deserialize(res))
      .catch((err) => console.log(err));
  };
}
