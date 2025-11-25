const { translate } = require('@vitalets/google-translate-api');

// Configuration test
const COUNTRIES = {
    FR: { name: 'France', lang: 'fr' },
    US: { name: 'États-Unis', lang: 'en' }
};

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
        console.error(`Erreur: ${error.message}`);
        return text;
    }
}

async function getSearchTerm(originalKeyword, countryConfig) {
    const keyword = originalKeyword.trim();

    // Cas 1 : Si commence par "ikea" ou "Ikea" (casse exacte)
    if (keyword.startsWith('ikea') || keyword.startsWith('Ikea')) {
        return keyword;
    }

    // Cas 2 : Traduire le terme
    const targetLang = countryConfig.lang;
    return await translateText(keyword, targetLang);
}

async function testCaseVariants() {
    console.log('🧪 Test des variantes de casse pour "ikea"\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testCases = [
        { keyword: "ikea 131372", shouldTranslate: false, reason: "commence par 'ikea'" },
        { keyword: "Ikea 131372", shouldTranslate: false, reason: "commence par 'Ikea'" },
        { keyword: "IKEA 131372", shouldTranslate: true, reason: "commence par 'IKEA' (doit être traduit)" },
        { keyword: "iKea 131372", shouldTranslate: true, reason: "commence par 'iKea' (doit être traduit)" },
        { keyword: "Spare parts ikea", shouldTranslate: true, reason: "ne commence pas par ikea/Ikea" },
        { keyword: "spare parts ikea", shouldTranslate: true, reason: "ne commence pas par ikea/Ikea" }
    ];

    const config = COUNTRIES.FR;

    for (const testCase of testCases) {
        const searchTerm = await getSearchTerm(testCase.keyword, config);
        const wasTranslated = searchTerm !== testCase.keyword;

        let status;
        if (testCase.shouldTranslate && wasTranslated) {
            status = '✅ CORRECT';
        } else if (!testCase.shouldTranslate && !wasTranslated) {
            status = '✅ CORRECT';
        } else {
            status = '❌ ERREUR';
        }

        console.log(`${status}: "${testCase.keyword}"`);
        console.log(`   Raison: ${testCase.reason}`);
        console.log(`   Attendu: ${testCase.shouldTranslate ? 'TRADUCTION' : 'PAS DE TRADUCTION'}`);
        console.log(`   Résultat: "${searchTerm}"${wasTranslated ? ' (traduit)' : ' (non traduit)'}`);
        console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Test terminé!\n');

    console.log('Règle appliquée:');
    console.log('  → "ikea" ou "Ikea" au début: PAS de traduction');
    console.log('  → Toute autre variante: TRADUCTION');
}

testCaseVariants();
