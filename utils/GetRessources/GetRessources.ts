import { GetLocation } from './GetLocations';

export async function GetRessource(ressource: string) {
    try {
        const response = await fetch(await GetLocation(ressource));
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des ressources depuis le GitHub');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des ressources depuis le GitHub : ', error);
        throw error;
    }
}