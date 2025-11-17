const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config();

// Configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Feuille 1';
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'fix-my-kea.com';

// Support de plusieurs clés API SerpApi (extensible jusqu'à 10 clés)
const API_KEYS = [
    process.env.SERPAPI_KEY,
    process.env.SERPAPI_KEY2,
    process.env.SERPAPI_KEY3,
    process.env.SERPAPI_KEY4,
    process.env.SERPAPI_KEY5,
    process.env.SERPAPI_KEY6,
    process.env.SERPAPI_KEY7,
    process.env.SERPAPI_KEY8,
    process.env.SERPAPI_KEY9,
    process.env.SERPAPI_KEY10,
].filter(key => key && key !== 'undefined' && key.trim() !== ''); // Filtrer les clés vides

// Système de gestion des quotas
let apiKeyIndex = 0;
let currentApiKey = API_KEYS[apiKeyIndex];
const apiKeyQuotas = {}; // Stocke les quotas restants pour chaque clé

// Initialiser les quotas à null (seront récupérés lors de la première requête)
API_KEYS.forEach((key, index) => {
    apiKeyQuotas[index] = null;
});

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

if (API_KEYS.length === 0) {
    console.error('\n❌ ERREUR: Aucune clé API SerpApi configurée!');
    console.error('\nPour obtenir une clé SerpApi:');
    console.error('1. Créer un compte sur https://serpapi.com/ (250 recherches gratuites)');
    console.error('2. Copier votre API Key');
    console.error('3. Ajouter SERPAPI_KEY=votre_cle dans le fichier .env\n');
    console.error('Pour plus de recherches, créez plusieurs comptes avec des emails différents');
    console.error('et ajoutez SERPAPI_KEY2, SERPAPI_KEY3, etc.\n');
    process.exit(1);
}

console.log(`🔑 ${API_KEYS.length} clé(s) API SerpApi chargée(s)\n`);

const serviceAccountAuth = new JWT({
    email: require('./credentials.json').client_email,
    key: require('./credentials.json').private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

/**
 * Récupère les informations de compte SerpApi (quota restant)
 */
async function getAccountInfo(apiKey, keyIndex) {
    try {
        const response = await axios.get('https://serpapi.com/account', {
            params: { api_key: apiKey },
            timeout: 10000
        });

        if (response.data) {
            const searches_remaining = response.data.total_searches_left || response.data.searches_remaining || 0;
            apiKeyQuotas[keyIndex] = searches_remaining;
            return searches_remaining;
        }
        return null;
    } catch (error) {
        console.error(`    ⚠️  Impossible de récupérer le quota pour la clé #${keyIndex + 1}`);
        return null;
    }
}

/**
 * Affiche les quotas de toutes les clés API
 */
function displayQuotas() {
    console.log('\n📊 Quotas SerpApi:');
    API_KEYS.forEach((key, index) => {
        const quota = apiKeyQuotas[index];
        const current = index === apiKeyIndex ? ' ← ACTIVE' : '';
        if (quota !== null) {
            const status = quota > 50 ? '✅' : quota > 10 ? '⚠️ ' : '❌';
            console.log(`   ${status} Clé #${index + 1}: ${quota} recherches restantes${current}`);
        } else {
            console.log(`   ❓ Clé #${index + 1}: Quota non récupéré${current}`);
        }
    });
    console.log('');
}

/**
 * Bascule sur la clé API suivante avec le plus de quota disponible
 */
function switchToNextApiKey() {
    // Trouver la clé avec le plus de quota disponible
    let maxQuota = -1;
    let bestKeyIndex = apiKeyIndex;

    API_KEYS.forEach((key, index) => {
        const quota = apiKeyQuotas[index];
        if (quota !== null && quota > maxQuota && quota > 0) {
            maxQuota = quota;
            bestKeyIndex = index;
        }
    });

    if (bestKeyIndex !== apiKeyIndex && maxQuota > 0) {
        console.log(`\n🔄 Basculement de la clé #${apiKeyIndex + 1} vers la clé #${bestKeyIndex + 1} (${maxQuota} recherches restantes)\n`);
        apiKeyIndex = bestKeyIndex;
        currentApiKey = API_KEYS[apiKeyIndex];
        return true;
    }

    return false; // Aucune clé disponible
}

/**
 * Recherche la position d'un domaine via SerpApi (Google Light Search)
 * Supporte jusqu'à 200 résultats (2 pages Google)
 */
async function searchPosition(keyword, countryCode) {
    try {
        const config = COUNTRIES[countryCode];
        console.log(`  → Recherche "${keyword}" sur Google ${config.name}...`);

        // Vérifier le quota avant de faire la recherche
        if (apiKeyQuotas[apiKeyIndex] !== null && apiKeyQuotas[apiKeyIndex] <= 0) {
            console.log(`    ⚠️  Quota épuisé sur clé #${apiKeyIndex + 1}, basculement...`);
            if (switchToNextApiKey()) {
                return await searchPosition(keyword, countryCode);
            } else {
                return 'Erreur: Tous les quotas épuisés';
            }
        }

        // Rechercher sur plusieurs pages jusqu'à 200 résultats
        let allResults = [];
        let currentPage = 0;
        const maxPages = 20; // 20 pages × 10 résultats = 200 résultats max

        // Boucle pour récupérer toutes les pages
        while (currentPage < maxPages && allResults.length < 200) {
            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google',
                    q: keyword,
                    gl: config.gl,
                    hl: config.hl,
                    num: 10, // 10 résultats par page (plus fiable)
                    start: currentPage * 10,
                    no_cache: false,
                    api_key: currentApiKey
                },
                timeout: 20000
            });

            // Mettre à jour le quota à partir de la réponse
            if (response.data.search_metadata?.total_searches_left !== undefined) {
                apiKeyQuotas[apiKeyIndex] = response.data.search_metadata.total_searches_left;
            }

            // Si quota dépassé dans la réponse, basculer sur la clé suivante
            if (response.data.error && response.data.error.includes('exceeded')) {
                console.log(`    ⚠️  Quota dépassé sur clé #${apiKeyIndex + 1}, basculement...`);
                apiKeyQuotas[apiKeyIndex] = 0;
                if (switchToNextApiKey()) {
                    return await searchPosition(keyword, countryCode);
                } else {
                    return 'Erreur: Tous les quotas épuisés';
                }
            }

            const pageResults = response.data.organic_results || [];

            // Si plus de résultats, arrêter
            if (pageResults.length === 0) {
                break;
            }

            // Ajouter les résultats de cette page
            allResults = allResults.concat(pageResults);

            // Chercher le domaine cible dans cette page
            for (let i = 0; i < pageResults.length; i++) {
                const link = pageResults[i].link || '';
                if (link.includes(TARGET_DOMAIN)) {
                    const position = currentPage * 10 + i + 1;
                    const pageNum = Math.floor(position / 10) + 1;
                    console.log(`    ✓ Position: ${position} (page ${pageNum})`);
                    return position;
                }
            }

            currentPage++;

            // Petit délai entre les pages pour éviter le rate limiting
            if (currentPage < maxPages && allResults.length < 200) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        console.log(`    ✗ Non trouvé dans les ${allResults.length} premiers résultats`);
        return 'N/A';

    } catch (error) {
        console.error(`    ❌ Erreur: ${error.message}`);

        if (error.response?.status === 401) {
            return 'Erreur: Clé API invalide';
        } else if (error.response?.status === 429) {
            // Si quota dépassé (HTTP 429), basculer sur la clé suivante
            console.log(`    ⚠️  Quota dépassé sur clé #${apiKeyIndex + 1} (HTTP 429)`);
            apiKeyQuotas[apiKeyIndex] = 0; // Marquer comme épuisé
            if (switchToNextApiKey()) {
                return await searchPosition(keyword, countryCode);
            } else {
                return 'Erreur: Tous les quotas épuisés';
            }
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

    // Récupérer les quotas de toutes les clés API au démarrage
    console.log('🔍 Récupération des quotas API...');
    for (let i = 0; i < API_KEYS.length; i++) {
        await getAccountInfo(API_KEYS[i], i);
    }
    displayQuotas();

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

        // Toujours mettre à jour TOUS les en-têtes (au cas où de nouveaux pays ont été ajoutés)
        console.log(`📝 Mise à jour des en-têtes pour tous les pays...\n`);
        sheet.getCell(0, 1).value = `France (${dateStr})`;
        sheet.getCell(0, 2).value = `États-Unis (${dateStr})`;
        sheet.getCell(0, 3).value = `Allemagne (${dateStr})`;
        sheet.getCell(0, 4).value = `Royaume-Uni (${dateStr})`;
        sheet.getCell(0, 5).value = `Italie (${dateStr})`;
        sheet.getCell(0, 6).value = `Pays-Bas (${dateStr})`;
        sheet.getCell(0, 7).value = `Espagne (${dateStr})`;
        await sheet.saveUpdatedCells();
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
    if (skippedSearches > 0) {
        console.log(`⏭️  ${skippedSearches} recherches ignorées (déjà faites aujourd'hui)`);
        console.log(`💰 Crédits économisés: ${skippedSearches}`);
    }
    console.log(`⏱️  Temps total: ${totalTime}s (${(totalTime / 60).toFixed(1)} minutes)`);
    if (totalSearches > 0) {
        console.log(`📈 Vitesse moyenne: ${(totalSearches / (totalTime / 60)).toFixed(1)} recherches/minute`);
    }

    // Afficher les quotas finaux
    displayQuotas();

    console.log(`🔗 Google Sheet mis à jour: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

// Exécuter le scraper
main().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
});
