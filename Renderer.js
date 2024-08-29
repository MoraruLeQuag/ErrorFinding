// renderer.js - Gère les interactions de l'interface utilisateur et la recherche d'erreurs
const { shell } = require('electron'); // Importation du module shell d'Electron
const axios = require('axios');
const cheerio = require('cheerio');

const domain = 'malekal.com';
const searchBtn = document.getElementById('searchBtn');
const errorCodeInput = document.getElementById('errorCode');
const resultDiv = document.getElementById('result');

// Fonction pour effectuer la recherche
async function searchErrorCode(errorCode) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(errorCode)}+site:${domain}`;

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const firstResult = $('a h3').first();
    const title = firstResult.text();
    const link = firstResult.parent().attr('href');

    if (title && link) {
      // Mise en forme du résultat avec un lien cliquable
      resultDiv.innerHTML = `
        <h3>Premier Résultat Trouvé :</h3>
        <p><strong>Titre :</strong> ${title}</p>
        <p><strong>Lien :</strong> <a href="#" id="resultLink">${link}</a></p>`;

      // Ajouter un événement de clic pour ouvrir le lien dans le navigateur
      const resultLink = document.getElementById('resultLink');
      resultLink.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche le comportement par défaut du lien
        shell.openExternal(link); // Ouvre le lien dans le navigateur par défaut
      });
    } else {
      resultDiv.innerHTML = `<p>Aucun résultat trouvé ou Google a bloqué l'accès.</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p>Erreur lors de la recherche : ${error.message || error}</p>`;
  }
}

// Événement sur le bouton de recherche
searchBtn.addEventListener('click', () => {
  const errorCode = errorCodeInput.value.trim();
  if (!errorCode) {
    alert("Veuillez entrer un code d'erreur.");
    return;
  }
  resultDiv.innerHTML = '<p>Recherche en cours...</p>';
  searchErrorCode(errorCode);
});
