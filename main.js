const axios = require('axios');
const cheerio = require('cheerio');
const readlineSync = require('readline-sync');

// Liste de quelques User-Agents
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
];

// Fonction pour obtenir un User-Agent aléatoire
function getRandomUserAgent() {
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
}

// Fonction pour introduire des délais aléatoires
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchErrorCode(errorCode, domain) {
    const searchUrl = `https://www.google.com/search?q=${errorCode}+site:${domain}`;

    try {
        await delay(Math.floor(Math.random() * 5000) + 1000); // Délai aléatoire entre 1 et 6 secondes

        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': getRandomUserAgent()
            }
        });

        const $ = cheerio.load(data);
        const searchResults = [];
        let pageTitle = '';

        $('a').each((i, element) => {
            const href = $(element).attr('href');
            if (href && href.includes(errorCode)) {
                searchResults.push(href);
            }
        });

        const filteredResults = searchResults.filter(result => result.includes(domain));

        if (filteredResults.length > 0) {
            const resultUrl = filteredResults[0];
            console.log(`Lien trouvé : ${resultUrl}`);

            // Obtenir le titre de la page
            const resultPage = await axios.get(resultUrl, {
                headers: {
                    'User-Agent': getRandomUserAgent()
                }
            });

            const $resultPage = cheerio.load(resultPage.data);
            pageTitle = $resultPage('title').text();

            console.log(`Titre de la page : ${pageTitle}`);
        } else {
            console.log('Aucun lien trouvé avec le code d\'erreur spécifié sur le domaine spécifié.');
        }
    } catch (error) {
        console.error(`Erreur lors de la recherche : ${error.message}`);
    }
}

// Demande d'input pour le code d'erreur
const errorCode = readlineSync.question('Entrez le code d\'erreur Windows : ');
const domain = 'malekal.com'; // Domaine spécifié

searchErrorCode(errorCode, domain);
