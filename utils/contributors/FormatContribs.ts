import { getPapillonContributors } from './GetContribs';

export async function formatPapillonContributors() {
    const contributors = getPapillonContributors();
    if (contributors === null) {
        setTimeout(formatPapillonContributors, 1000);
        return;
    }

    const maintaineurs = [
        {
            "name": "Vince (ecnivtwelve)",
            "role": "Fondateur",
            "avatar": "https://avatars.githubusercontent.com/u/32978709?v=4&s=100",
            "link": "https://github.com/ecnivtwelve"
        },
        {
            "name": "Lucas (Tryon)",
            "role": "Mainteneur",
            "avatar": "https://avatars.githubusercontent.com/u/68423470?v=4&s=100",
            "link": "https://tryon-lab.fr/"
        },
        {
            "name": "Maël Gangloff",
            "role": "Mainteneur",
            "avatar": "https://avatars.githubusercontent.com/u/51171251?v=4",
            "link": "https://maelgangloff.fr/"
        },
        {
            "name": "Olivier T.",
            "role": "Mainteneur",
            "avatar": "https://avatars.githubusercontent.com/u/69359417?v=4",
            "link": "https://github.com/Vilerio"
        }
    ];

    const manualContributors = [

    ];

    const excludedContribs = {
        "Vilerio": true,
        "maelgangloff": true,
        "tryon-dev": true,
        "ecnivtwelve": true,
        "dependabot[bot]": true
    };

    const filteredContributors = contributors.filter(contributor => !excludedContribs[contributor.login]);

    const formattedContributors = {
        lastupdated: new Date().toISOString().split('T')[0],
        team: [
            {
                name: "Mainteneurs",
                member: maintaineurs
            },
            {
                name: "Contributeurs",
                member: [
                    ...filteredContributors.map(contributor => ({
                        name: contributor.displayname,
                        role: "Contributeur",
                        avatar: contributor.avatar_url,
                        link: contributor.html_url
                    })),
                    ...manualContributors
                ]
            }
        ]
    };

    return formattedContributors;
}

formatPapillonContributors();
