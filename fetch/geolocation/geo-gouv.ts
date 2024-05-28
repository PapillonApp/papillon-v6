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
  // Vérification de la validité du searchQuery
  if (!/^[a-zA-Z0-9]/.test(searchQuery) || searchQuery.length < 3 || searchQuery.length > 200) {
    throw new Error('searchQuery must contain between 3 and 200 chars and start with a number or a letter');
  }

  const uri = new URL(GEO_API_URL);
  uri.searchParams.set('q', searchQuery);

  const response = await fetch(uri.toString());
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json() as {
    features: GeographicMunicipality[]
  };

  return data.features;
};
