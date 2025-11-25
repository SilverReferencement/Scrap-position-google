const { translate } = require('@vitalets/google-translate-api');

async function testTranslation() {
    console.log('🧪 Test de traduction\n');

    const keyword = "Spare parts ikea billy";
    const languages = {
        'fr': 'Français',
        'en': 'Anglais',
        'de': 'Allemand',
        'it': 'Italien',
        'nl': 'Néerlandais',
        'es': 'Espagnol'
    };

    console.log(`📝 Texte original: "${keyword}"\n`);

    for (const [lang, langName] of Object.entries(languages)) {
        try {
            const result = await translate(keyword, { to: lang });
            console.log(`${langName} (${lang}): "${result.text}"`);
        } catch (error) {
            console.error(`❌ ${langName}: Erreur - ${error.message}`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test avec un terme commençant par "ikea"
    const ikeaKeyword = "Ikea 131372";
    console.log(`📝 Texte commençant par "ikea": "${ikeaKeyword}"`);
    console.log('   → Ce terme ne doit PAS être traduit\n');

    if (ikeaKeyword.toLowerCase().startsWith('ikea')) {
        console.log('✅ Détection correcte: commence par "ikea"');
        console.log('   → Utilisation du terme tel quel sans traduction');
    }
}

testTranslation();
