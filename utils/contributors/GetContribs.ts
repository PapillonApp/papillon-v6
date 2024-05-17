export interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    displayname: string;
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
    const contributorsPromises = jsonResponse.map(async (contributor: any) => {
        const userResponse = await fetch(`https://api.github.com/users/${contributor.login}`);
        const userData = await userResponse.json();
        let blogUrl = userData.blog;
        if (blogUrl && !blogUrl.startsWith('http://') && !blogUrl.startsWith('https://')) {
            blogUrl = 'https://' + blogUrl;
        }
        return {
            displayname: userData.name || contributor.login, 
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            html_url: blogUrl || contributor.html_url
        };
    });
    const contributors = await Promise.all(contributorsPromises);
    contributorsGlobal = contributors;
    return { contributors, jsonResponse };
}

export function getPapillonContributors(): Contributor[] | null {
    return contributorsGlobal;
}

fetchPapillonContributors();
