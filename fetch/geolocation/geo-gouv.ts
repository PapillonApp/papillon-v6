const GEO_API_URL = 'https://api-adresse.data.gouv.fr/search/?type=municipality&limit=6';

export interface GeographicMunicipality {
  geometry: {
    coordinates: [longitude: number, latitude: number]
  }

  properties: {
    name: string
    /** Score from 0 to 1. */
    score: number
    postcode: string
    population: number
    context: string
  }
}

export const getGeographicMunicipalities = async (searchQuery: string): Promise<GeographicMunicipality[]> => {
  const uri = new URL(GEO_API_URL);
  uri.searchParams.set('q', searchQuery);

  const response = await fetch(uri.toString());
  const data = await response.json() as {
    features: GeographicMunicipality[]
  };

  return data.features;
};
