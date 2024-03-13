export async function fetchPapiAPI(path: string) {
    try {
        const response = await fetch(`https://api.getpapillon.xyz/${path}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la requête à l\'API Papillon');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la requête à l\'API Papillon :', error);
        throw error;
    }
}
