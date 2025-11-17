const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config();

// Configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Feuille 1';
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'fix-my-kea.com';

// Support de 2 clés API SerpApi (500 recherches gratuites total)
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_KEY2 = process.env.SERPAPI_KEY2; // Optionnelle (2e compte)

// Rotation des clés API
let currentApiKey = SERPAPI_KEY;
let apiKeyIndex = 1;

// Configuration des pays pour SerpApi
const COUNTRIES = {
    FR: {
        name: 'France',
        gl: 'fr',
        hl: 'fr',
        column: 1 // Colonne B
    },
    US: {
        name: 'États-Unis',
        gl: 'us',
        hl: 'en',
        column: 2 // Colonne C
    },
    DE: {
        name: 'Allemagne',
        gl: 'de',
        hl: 'de',
        column: 3 // Colonne D
    },
    UK: {
        name: 'Royaume-Uni',
        gl: 'uk',
        hl: 'en',
        column: 4 // Colonne E
    },
    IT: {
        name: 'Italie',
        gl: 'it',
        hl: 'it',
        column: 5 // Colonne F
    },
    NL: {
        name: 'Pays-Bas',
        gl: 'nl',
        hl: 'nl',
        column: 6 // Colonne G
    },
    ES: {
        name: 'Espagne',
        gl: 'es',
        hl: 'es',
        column: 7 // Colonne H
    }
};

// Check configuration
const fs = require('fs');
if (!fs.existsSync('credentials.json')) {
    console.error('\n❌ ERREUR: Le fichier credentials.json n\'existe pas!\n');
    process.exit(1);
}

if (!SPREADSHEET_ID || SPREADSHEET_ID === 'VOTRE_ID_ICI') {
    console.error('\n❌ ERREUR: SPREADSHEET_ID non configuré dans .env!\n');
    process.exit(1);
}

if (!SERPAPI_KEY) {
    console.error('\n❌ ERREUR: SERPAPI_KEY non configuré dans .env!');
    console.error('\nPour obtenir une clé SerpApi:');
    console.error('1. Créer un compte sur https://serpapi.com/ (100 recherches gratuites)');
    console.error('2. Copier votre API Key');
    console.error('3. Ajouter SERPAPI_KEY=votre_cle dans le fichier .env\n');
    process.exit(1);
}

const serviceAccountAuth = new JWT({
    email: require('./credentials.json').client_email,
    key: require('./credentials.json').private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

/**
 * Recherche la position d'un domaine via SerpApi (Google Light Search)
 * Supporte jusqu'à 200 résultats (2 pages Google)
 */
async function searchPosition(keyword, countryCode) {
    try {
        const config = COUNTRIES[countryCode];
        console.log(`  → Recherche "${keyword}" sur Google ${config.name}...`);

        // Appel à SerpApi avec Google Light Search (jusqu'à 200 résultats = 2 pages)
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                engine: 'google',
                q: keyword,
                gl: config.gl,
                hl: config.hl,
                num: 100, // 100 résultats par page (max)
                start: 0,
                no_cache: false,
                api_key: currentApiKey
            },
            timeout: 20000
        });

        // Si quota dépassé sur la clé actuelle, basculer sur la clé 2
        if (response.data.error?.includes('exceeded') && SERPAPI_KEY2 && currentApiKey === SERPAPI_KEY) {
            console.log(`    ⚠️  Quota dépassé sur clé API #1, basculement sur clé #2...`);
            currentApiKey = SERPAPI_KEY2;
            apiKeyIndex = 2;
            // Réessayer avec la 2e clé
            return await searchPosition(keyword, countryCode);
        }

        let results = response.data.organic_results || [];

        if (results.length === 0) {
            console.log(`    ⚠️ Aucun résultat`);
            return 'N/A';
        }

        // Chercher le domaine cible dans les 100 premiers résultats
        let position = -1;
        for (let i = 0; i < results.length; i++) {
            const link = results[i].link || '';
            if (link.includes(TARGET_DOMAIN)) {
                position = i + 1;
                console.log(`    ✓ Position: ${position} (page 1)`);
                return position;
            }
        }

        // Si pas trouvé dans les 100 premiers, chercher dans les 100 suivants (page 2)
        try {
            const response2 = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google',
                    q: keyword,
                    gl: config.gl,
                    hl: config.hl,
                    num: 100,
                    start: 100, // Page 2
                    no_cache: false,
                    api_key: currentApiKey
                },
                timeout: 20000
            });

            const results2 = response2.data.organic_results || [];

            for (let i = 0; i < results2.length; i++) {
                const link = results2[i].link || '';
                if (link.includes(TARGET_DOMAIN)) {
                    position = 100 + i + 1;
                    console.log(`    ✓ Position: ${position} (page 2)`);
                    return position;
                }
            }
        } catch (e) {
            console.log(`    ⚠️  Erreur page 2, recherche limitée à la page 1`);
        }

        console.log(`    ✗ Non trouvé dans les 200 premiers résultats`);
        return 'N/A';

    } catch (error) {
        console.error(`    ❌ Erreur: ${error.message}`);

        if (error.response?.status === 401) {
            return 'Erreur: Clé API invalide';
        } else if (error.response?.status === 429) {
            // Si quota dépassé et on a une 2e clé, basculer
            if (SERPAPI_KEY2 && currentApiKey === SERPAPI_KEY) {
                console.log(`    ⚠️  Quota dépassé sur clé API #1, basculement sur clé #2...`);
                currentApiKey = SERPAPI_KEY2;
                apiKeyIndex = 2;
                return await searchPosition(keyword, countryCode);
            }
            return 'Erreur: Quota dépassé';
        }

        return `Erreur: ${error.message.substring(0, 30)}`;
    }
}

/**
 * Fonction principale
 */
async function main() {
    console.log('🚀 Démarrage du scraper de positions Google (SerpApi)\n');
    console.log(`🎯 Domaine cible: ${TARGET_DOMAIN}\n`);

    // Connexion à Google Sheets
    console.log('📊 Connexion à Google Sheets...');
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

    try {
        await doc.loadInfo();
        console.log(`✅ Connecté à: ${doc.title}\n`);
    } catch (error) {
        console.error('❌ Erreur de connexion à Google Sheets:', error.message);
        process.exit(1);
    }

    const sheet = doc.sheetsByTitle[SHEET_NAME];
    if (!sheet) {
        console.error(`❌ Onglet "${SHEET_NAME}" non trouvé!`);
        process.exit(1);
    }

    // Lire les mots-clés depuis la colonne A
    console.log('📝 Lecture des mots-clés depuis la colonne A...');
    const maxRows = Math.min(sheet.rowCount, 1000);
    await sheet.loadCells(`A1:H${maxRows}`); // Jusqu'à la colonne H (Espagne)

    const keywords = [];
    let rowIndex = 1; // Commence à la ligne 2 (index 1)

    while (rowIndex < maxRows) {
        const cell = sheet.getCell(rowIndex, 0); // Colonne A
        if (!cell.value || cell.value.toString().trim() === '') {
            break;
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

    // Vérifier si les en-têtes sont déjà à jour avec la date du jour
    const headerB1 = sheet.getCell(0, 1).value?.toString() || '';
    const alreadyScrapedToday = headerB1.includes(dateStr);

    if (alreadyScrapedToday) {
        console.log(`📅 Données déjà scrapées aujourd'hui (${dateStr})`);
        console.log(`   → Les cellules déjà remplies seront ignorées\n`);
    } else {
        console.log(`📅 Mise à jour des en-têtes avec la date: ${dateStr}\n`);
        sheet.getCell(0, 1).value = `France (${dateStr})`;
        sheet.getCell(0, 2).value = `États-Unis (${dateStr})`;
        sheet.getCell(0, 3).value = `Allemagne (${dateStr})`;
        sheet.getCell(0, 4).value = `Royaume-Uni (${dateStr})`;
        sheet.getCell(0, 5).value = `Italie (${dateStr})`;
        sheet.getCell(0, 6).value = `Pays-Bas (${dateStr})`;
        sheet.getCell(0, 7).value = `Espagne (${dateStr})`;
        await sheet.saveUpdatedCells();
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startTime = Date.now();
    let totalSearches = 0;
    let skippedSearches = 0;

    // Traiter chaque mot-clé
    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i].value;
        const row = keywords[i].row;

        console.log(`[${i + 1}/${keywords.length}] Mot-clé: "${keyword}"`);

        // Pour chaque pays
        for (const [countryCode, config] of Object.entries(COUNTRIES)) {
            const cell = sheet.getCell(row, config.column);

            // Si déjà scrapé aujourd'hui ET que la cellule a une valeur, on skip
            if (alreadyScrapedToday && cell.value && cell.value.toString().trim() !== '') {
                console.log(`  ⏭️  ${config.name}: Déjà scrapé (${cell.value})`);
                skippedSearches++;
                continue;
            }

            // Faire la recherche
            const position = await searchPosition(keyword, countryCode);

            // Écrire dans la cellule correspondante
            cell.value = position;

            totalSearches++;

            // Sauvegarder toutes les 10 recherches
            if (totalSearches % 10 === 0) {
                await sheet.saveUpdatedCells();
                console.log(`  💾 Sauvegarde intermédiaire (${totalSearches} recherches)\n`);
            }

            // Délai pour respecter les rate limits de SerpApi
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('');
    }

    // Sauvegarde finale
    await sheet.saveUpdatedCells();

    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(1);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✅ Scraping terminé!`);
    console.log(`📊 ${keywords.length} mots-clés traités`);
    console.log(`✅ ${totalSearches} nouvelles recherches effectuées`);
    if (SERPAPI_KEY2) {
        console.log(`🔑 Clé API utilisée: #${apiKeyIndex}`);
    }
    if (skippedSearches > 0) {
        console.log(`⏭️  ${skippedSearches} recherches ignorées (déjà faites aujourd'hui)`);
        console.log(`💰 Crédits économisés: ${skippedSearches}`);
    }
    console.log(`⏱️  Temps total: ${totalTime}s (${(totalTime / 60).toFixed(1)} minutes)`);
    if (totalSearches > 0) {
        console.log(`📈 Vitesse moyenne: ${(totalSearches / (totalTime / 60)).toFixed(1)} recherches/minute`);
    }
    console.log(`\n🔗 Google Sheet mis à jour: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

// Exécuter le scraper
main().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
});
