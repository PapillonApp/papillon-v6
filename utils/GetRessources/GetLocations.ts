export async function GetLocation(ressource: string) {
    try {
        const response = await fetch('https://locations.getpapillon.xyz');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des emplacements depuis le GitHub');
        }
        const locationsData = await response.json();
        const location = locationsData[ressource];
        if (!location) {
            throw new Error('Ressource non trouvée dans le fichier des localisations');
        }
        return location;
    } catch (error) {
        console.error('Erreur lors de la récupération de la localisation depuis le fichier des localisations : ', error);
        throw error;
    }
}