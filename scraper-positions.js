const { chromium } = require('playwright');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

// Configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Feuille 1';
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'fix-my-kea.com';

// Configuration des pays pour les recherches Google
const COUNTRIES = {
    FR: {
        name: 'France',
        googleUrl: 'https://www.google.fr',
        locale: 'fr-FR',
        acceptLanguage: 'fr-FR,fr;q=0.9',
        gl: 'fr',
        hl: 'fr',
        column: 1 // Colonne B
    },
    US: {
        name: 'USA',
        googleUrl: 'https://www.google.com',
        locale: 'en-US',
        acceptLanguage: 'en-US,en;q=0.9',
        gl: 'us',
        hl: 'en',
        column: 2 // Colonne C
    },
    DE: {
        name: 'Allemagne',
        googleUrl: 'https://www.google.de',
        locale: 'de-DE',
        acceptLanguage: 'de-DE,de;q=0.9',
        gl: 'de',
        hl: 'de',
        column: 3 // Colonne D
    },
    UK: {
        name: 'Royaume-Uni',
        googleUrl: 'https://www.google.co.uk',
        locale: 'en-GB',
        acceptLanguage: 'en-GB,en;q=0.9',
        gl: 'uk',
        hl: 'en',
        column: 4 // Colonne E
    },
    IT: {
        name: 'Italie',
        googleUrl: 'https://www.google.it',
        locale: 'it-IT',
        acceptLanguage: 'it-IT,it;q=0.9',
        gl: 'it',
        hl: 'it',
        column: 5 // Colonne F
    }
};

// Check if credentials file exists
const fs = require('fs');
if (!fs.existsSync('credentials.json')) {
    console.error('\n❌ ERREUR: Le fichier credentials.json n\'existe pas!');
    console.error('Veuillez copier le fichier depuis votre autre projet.\n');
    process.exit(1);
}

if (!SPREADSHEET_ID || SPREADSHEET_ID === 'VOTRE_ID_ICI') {
    console.error('\n❌ ERREUR: SPREADSHEET_ID non configuré!');
    console.error('Veuillez modifier le fichier .env avec votre ID de Google Sheet.\n');
    process.exit(1);
}

const serviceAccountAuth = new JWT({
    email: require('./credentials.json').client_email,
    key: require('./credentials.json').private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

/**
 * Recherche la position d'un domaine dans les résultats Google pour un mot-clé
 */
async function searchPosition(page, keyword, countryCode) {
    try {
        const config = COUNTRIES[countryCode];
        console.log(`  → Recherche "${keyword}" sur Google ${config.name}...`);

        // Construire l'URL de recherche avec les paramètres de géolocalisation
        const searchUrl = `${config.googleUrl}/search?q=${encodeURIComponent(keyword)}&gl=${config.gl}&hl=${config.hl}&num=100`;

        // Naviguer vers la page de recherche
        await page.goto(searchUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Attendre que les résultats se chargent
        await page.waitForTimeout(2000);

        // Accepter les cookies si présents (première visite)
        try {
            const cookieButtons = [
                'button:has-text("Accept all")',
                'button:has-text("I agree")',
                'button:has-text("Accepter tout")',
                'button:has-text("Tout accepter")',
                'button:has-text("Akzeptieren")',
                'button:has-text("Accetta tutto")',
                '#L2AGLb' // ID du bouton Google "Tout accepter"
            ];

            for (const selector of cookieButtons) {
                const count = await page.locator(selector).count();
                if (count > 0) {
                    await page.locator(selector).first().click();
                    await page.waitForTimeout(1000);
                    break;
                }
            }
        } catch (e) {
            // Ignorer les erreurs de cookies
        }

        // Extraire tous les liens des résultats de recherche
        const resultLinks = await page.evaluate(() => {
            const results = [];
            // Essayer plusieurs sélecteurs pour les résultats Google
            const selectors = [
                'div#search a[href]',
                'div.g a[href]',
                'div[data-sokoban-container] a[href]',
                'a[jsname]',
                'h3 a'
            ];

            const links = new Set();
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(link => {
                    const href = link.href;
                    if (href &&
                        !href.includes('google.') &&
                        !href.startsWith('javascript:') &&
                        !href.includes('/search?') &&
                        !href.includes('accounts.google') &&
                        (href.startsWith('http://') || href.startsWith('https://'))) {
                        links.add(href);
                    }
                });
            });

            return Array.from(links);
        });

        if (resultLinks.length === 0) {
            console.log(`    ⚠️ Aucun résultat trouvé`);
            return 'N/A';
        }

        // Chercher le domaine cible dans les résultats
        let position = -1;
        for (let i = 0; i < resultLinks.length; i++) {
            if (resultLinks[i].includes(TARGET_DOMAIN)) {
                position = i + 1;
                break;
            }
        }

        if (position > 0) {
            console.log(`    ✓ Position: ${position}`);
            return position;
        } else {
            console.log(`    ✗ Non trouvé dans les ${resultLinks.length} premiers résultats`);
            return 'N/A';
        }

    } catch (error) {
        console.error(`    ❌ Erreur: ${error.message}`);
        return `Erreur: ${error.message.substring(0, 30)}`;
    }
}

/**
 * Fonction principale
 */
async function main() {
    console.log('🚀 Démarrage du scraper de positions Google\n');
    console.log(`🎯 Domaine cible: ${TARGET_DOMAIN}\n`);

    // Connexion à Google Sheets
    console.log('📊 Connexion à Google Sheets...');
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

    try {
        await doc.loadInfo();
        console.log(`✅ Connecté à: ${doc.title}\n`);
    } catch (error) {
        console.error('❌ Erreur de connexion à Google Sheets:', error.message);
        console.error('Vérifiez que:');
        console.error('1. Le SPREADSHEET_ID est correct');
        console.error('2. Le sheet est partagé avec:', require('./credentials.json').client_email);
        process.exit(1);
    }

    const sheet = doc.sheetsByTitle[SHEET_NAME];
    if (!sheet) {
        console.error(`❌ Onglet "${SHEET_NAME}" non trouvé!`);
        console.error(`Onglets disponibles: ${Object.keys(doc.sheetsByTitle).join(', ')}`);
        process.exit(1);
    }

    // Lire les mots-clés depuis la colonne A
    console.log('📝 Lecture des mots-clés depuis la colonne A...');
    const maxRows = Math.min(sheet.rowCount, 1000);
    await sheet.loadCells(`A1:F${maxRows}`);

    const keywords = [];
    let rowIndex = 1; // Commence à la ligne 2 (index 1)

    while (rowIndex < maxRows) {
        const cell = sheet.getCell(rowIndex, 0); // Colonne A
        if (!cell.value || cell.value.toString().trim() === '') {
            break; // Stop à la première cellule vide
        }
        keywords.push({
            value: cell.value.toString().trim(),
            row: rowIndex
        });
        rowIndex++;
    }

    console.log(`✅ ${keywords.length} mots-clés trouvés (A2:A${rowIndex})\n`);

    if (keywords.length === 0) {
        console.log('❌ Aucun mot-clé trouvé dans la colonne A');
        process.exit(0);
    }

    // Écrire les en-têtes avec la date d'aujourd'hui (format DD/MM/YY)
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getFullYear()).slice(-2)}`;

    console.log(`📅 Mise à jour des en-têtes avec la date: ${dateStr}\n`);
    sheet.getCell(0, 1).value = `France (${dateStr})`; // B1
    sheet.getCell(0, 2).value = `USA (${dateStr})`; // C1
    sheet.getCell(0, 3).value = `Allemagne (${dateStr})`; // D1
    sheet.getCell(0, 4).value = `UK (${dateStr})`; // E1
    sheet.getCell(0, 5).value = `Italie (${dateStr})`; // F1
    await sheet.saveUpdatedCells();

    // Lancer le navigateur
    console.log('🌐 Lancement du navigateur...\n');
    const browser = await chromium.launch({
        headless: true,
        timeout: 60000
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startTime = Date.now();
    let totalSearches = 0;

    // Traiter chaque mot-clé
    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i].value;
        const row = keywords[i].row;

        console.log(`[${i + 1}/${keywords.length}] Mot-clé: "${keyword}"`);

        // Pour chaque pays
        for (const [countryCode, config] of Object.entries(COUNTRIES)) {
            // Créer un nouveau contexte pour chaque recherche (IP/session différente)
            const context = await browser.newContext({
                locale: config.locale,
                extraHTTPHeaders: {
                    'Accept-Language': config.acceptLanguage
                },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            const page = await context.newPage();

            // Rechercher la position
            const position = await searchPosition(page, keyword, countryCode);

            // Écrire dans la cellule correspondante
            const cell = sheet.getCell(row, config.column);
            cell.value = position;

            // Fermer le contexte pour libérer les ressources
            await context.close();

            totalSearches++;

            // Sauvegarder toutes les 10 recherches
            if (totalSearches % 10 === 0) {
                await sheet.saveUpdatedCells();
                console.log(`  💾 Sauvegarde intermédiaire (${totalSearches} recherches)\n`);
            }

            // Délai entre les recherches pour éviter le rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('');
    }

    // Sauvegarde finale
    await sheet.saveUpdatedCells();
    await browser.close();

    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(1);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✅ Scraping terminé!`);
    console.log(`📊 ${keywords.length} mots-clés × ${Object.keys(COUNTRIES).length} pays = ${totalSearches} recherches`);
    console.log(`⏱️  Temps total: ${totalTime}s (${(totalTime / 60).toFixed(1)} minutes)`);
    console.log(`📈 Vitesse moyenne: ${(totalSearches / (totalTime / 60)).toFixed(1)} recherches/minute`);
    console.log(`\n🔗 Google Sheet mis à jour: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

// Exécuter le scraper
main().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
});
