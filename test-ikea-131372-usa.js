const axios = require('axios');
require('dotenv').config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const TARGET_DOMAIN = 'fix-my-kea.com';

async function testSearch() {
    console.log('🧪 Test de recherche: Ikea 131372 sur Google USA\n');
    console.log(`🎯 Domaine recherché: ${TARGET_DOMAIN}\n`);

    try {
        // Page 1
        console.log('📄 Page 1 (résultats 1-100)...');
        const response1 = await axios.get('https://serpapi.com/search', {
            params: {
                engine: 'google',
                q: 'Ikea 131372',
                gl: 'us',
                hl: 'en',
                num: 100,
                start: 0,
                api_key: SERPAPI_KEY
            }
        });

        console.log(`✅ ${response1.data.organic_results?.length || 0} résultats trouvés`);

        let found = false;
        let position = -1;

        // Chercher dans page 1
        const results1 = response1.data.organic_results || [];
        for (let i = 0; i < results1.length; i++) {
            const link = results1[i].link || '';
            console.log(`   ${i + 1}. ${link.substring(0, 80)}`);
            if (link.includes(TARGET_DOMAIN)) {
                position = i + 1;
                found = true;
                console.log(`   🎯 TROUVÉ EN POSITION ${position}!`);
                break;
            }
        }

        if (!found) {
            console.log('\n📄 Page 2 (résultats 101-200)...');
            const response2 = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google',
                    q: 'Ikea 131372',
                    gl: 'us',
                    hl: 'en',
                    num: 100,
                    start: 100,
                    api_key: SERPAPI_KEY
                }
            });

            console.log(`✅ ${response2.data.organic_results?.length || 0} résultats trouvés`);

            const results2 = response2.data.organic_results || [];
            for (let i = 0; i < results2.length; i++) {
                const link = results2[i].link || '';
                console.log(`   ${100 + i + 1}. ${link.substring(0, 80)}`);
                if (link.includes(TARGET_DOMAIN)) {
                    position = 100 + i + 1;
                    found = true;
                    console.log(`   🎯 TROUVÉ EN POSITION ${position}!`);
                    break;
                }
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (found) {
            console.log(`\n✅ RÉSULTAT: Position ${position}`);
        } else {
            console.log(`\n❌ RÉSULTAT: Non trouvé dans les 200 premiers résultats`);
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.response?.data) {
            console.error('Détails:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSearch();
