const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');
require('dotenv').config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const TARGET_DOMAIN = 'fix-my-kea.com';

// Configuration des pays
const COUNTRIES = {
    FR: { name: 'France', gl: 'fr', hl: 'fr', lang: 'fr' },
    US: { name: 'États-Unis', gl: 'us', hl: 'en', lang: 'en' },
    DE: { name: 'Allemagne', gl: 'de', hl: 'de', lang: 'de' }
};

// Cache de traductions
const translationCache = {};

async function translateText(text, targetLang) {
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        const result = await translate(text, { to: targetLang });
        translationCache[cacheKey] = result.text;
        return result.text;
    } catch (error) {
        console.error(`    ⚠️  Erreur de traduction: ${error.message}`);
        return text;
    }
}

async function getSearchTerm(originalKeyword, countryConfig) {
    const keyword = originalKeyword.trim();

    // Si commence par "ikea" → pas de traduction
    if (keyword.toLowerCase().startsWith('ikea')) {
        return keyword;
    }

    // Sinon → traduire
    const targetLang = countryConfig.lang;
    return await translateText(keyword, targetLang);
}

async function testSearchWithTranslation() {
    console.log('🧪 Test de recherche avec traduction\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1 : Mot-clé commençant par "ikea" (pas de traduction)
    const keyword1 = "Ikea 131372";
    console.log(`[Test 1] Mot-clé: "${keyword1}" (commence par "ikea")`);
    console.log(`   → Attendu: Pas de traduction\n`);

    for (const [code, config] of Object.entries(COUNTRIES)) {
        const searchTerm = await getSearchTerm(keyword1, config);
        const status = searchTerm === keyword1 ? '✅' : '❌';
        console.log(`   ${status} ${config.name}: "${searchTerm}"`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 2 : Mot-clé ne commençant pas par "ikea" (avec traduction)
    const keyword2 = "Spare parts ikea billy";
    console.log(`[Test 2] Mot-clé: "${keyword2}" (ne commence pas par "ikea")`);
    console.log(`   → Attendu: Traduction dans chaque langue\n`);

    for (const [code, config] of Object.entries(COUNTRIES)) {
        const searchTerm = await getSearchTerm(keyword2, config);
        const status = searchTerm !== keyword2 || config.lang === 'en' ? '✅' : '❌';
        console.log(`   ${status} ${config.name}: "${searchTerm}"`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 3 : Recherche réelle sur SerpApi (1 pays seulement pour économiser le quota)
    console.log(`[Test 3] Recherche réelle sur SerpApi avec "${keyword2}"`);
    console.log(`   → Test sur France uniquement\n`);

    const config = COUNTRIES.FR;
    const searchTerm = await getSearchTerm(keyword2, config);

    console.log(`   Terme original: "${keyword2}"`);
    console.log(`   Terme traduit: "${searchTerm}"`);
    console.log(`   Recherche en cours sur Google France...\n`);

    try {
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                engine: 'google',
                q: searchTerm,
                gl: config.gl,
                hl: config.hl,
                num: 10,
                start: 0,
                api_key: SERPAPI_KEY
            },
            timeout: 20000
        });

        const results = response.data.organic_results || [];
        console.log(`   ✅ ${results.length} résultats trouvés`);

        // Afficher les 3 premiers résultats
        for (let i = 0; i < Math.min(3, results.length); i++) {
            const link = results[i].link || '';
            console.log(`   ${i + 1}. ${link}`);
        }

        // Chercher notre domaine
        let found = false;
        let position = -1;
        for (let i = 0; i < results.length; i++) {
            const link = results[i].link || '';
            if (link.includes(TARGET_DOMAIN)) {
                position = i + 1;
                found = true;
                break;
            }
        }

        console.log('');
        if (found) {
            console.log(`   🎯 Domaine "${TARGET_DOMAIN}" trouvé en position ${position}!`);
        } else {
            console.log(`   ⚠️  Domaine "${TARGET_DOMAIN}" non trouvé dans les 10 premiers résultats`);
        }

        console.log(`\n   💰 Crédits restants: ${response.data.search_metadata?.total_searches_left || 'N/A'}`);

    } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        if (error.response?.data) {
            console.error(`   Détails: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Test terminé!');
}

testSearchWithTranslation();
