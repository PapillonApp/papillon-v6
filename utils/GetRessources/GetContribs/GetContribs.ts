export interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
}

export interface ContributorsResponse {
    contributors: Contributor[];
    jsonResponse: any;
}

let contributorsGlobal: Contributor[] | null = null;

export async function fetchPapillonContributors(): Promise<ContributorsResponse> {
    const response = await fetch("https://api.github.com/repos/PapillonApp/Papillon/contributors");
    if (!response.ok) {
        throw new Error(`Les PapiContributeurs n'ont pas pu être récupérés : ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    const contributors = jsonResponse.map((contributor: any) => ({
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url
    }));
    contributorsGlobal = contributors;
    return { contributors, jsonResponse };
}

export function getPapillonContributors(): Contributor[] | null {
    return contributorsGlobal;
}

fetchPapillonContributors();