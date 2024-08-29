// Importation des modules nécessaires
const readline = require('readline'); // Pour lire l'entrée utilisateur
const axios = require('axios'); // Pour effectuer des requêtes HTTP
const cheerio = require('cheerio'); // Pour analyser et manipuler le HTML
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Crée une fenêtre de l'application
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'), // Charge le fichier de script pour l'interface
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Charge le fichier HTML dans la fenêtre
  win.loadFile('index.html');
}

// Initialise l'application lorsque prête
app.whenReady().then(createWindow);

// Quitte l'application quand toutes les fenêtres sont fermées (pour macOS, c'est spécifique)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Réouvre la fenêtre sur macOS quand l'icône est cliquée
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Déclaration de la variable du domaine
const domain = 'malekal.com';

// Création d'une interface pour lire l'entrée utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction principale qui demande le code d'erreur et effectue la recherche Google
function searchErrorCode() {
  rl.question("Veuillez entrer le code d'erreur : ", async (errorCode) => {
    if (!errorCode) {
      console.log("Le code d'erreur ne peut pas être vide.");
      rl.close();
      return;
    }

    // Construction de l'URL de recherche Google
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(errorCode)}+site:${domain}`;

    console.log(`Recherche sur Google : ${searchUrl}`);

    try {
      // Effectue une requête GET à Google
      const response = await axios.get(searchUrl, {
        headers: {
          // User-Agent pour imiter un navigateur, sinon Google peut bloquer la requête
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Analyse le HTML de la réponse avec cheerio
      const $ = cheerio.load(response.data);

      // Sélectionne le premier élément des résultats de recherche
      const firstResult = $('a h3').first(); // Premier titre trouvé
      const title = firstResult.text(); // Récupère le texte du titre
      const link = firstResult.parent().attr('href'); // Récupère le lien du parent

      // Vérifie si un résultat a été trouvé
      if (title && link) {
        console.log('Premier résultat trouvé :');
        console.log(`Titre : ${title}`);
        console.log(`Lien : ${link}`);
      } else {
        console.log('Aucun résultat trouvé ou Google a bloqué l\'accès.');
      }
    } catch (error) {
      console.error(
        'Erreur lors de la recherche sur Google :',
        error.message || error
      );
    }

    // Ferme l'interface readline
    rl.close();
  });
}

// Appel de la fonction pour démarrer le script
searchErrorCode();
