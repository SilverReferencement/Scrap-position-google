const axios = require('axios');
require('dotenv').config();

async function getQuotas() {
    console.log('🔍 Récupération des quotas SerpApi...\n');

    const keys = [
        { name: 'Compte 1', key: process.env.SERPAPI_KEY },
        { name: 'Compte 2', key: process.env.SERPAPI_KEY2 }
    ];

    for (const { name, key } of keys) {
        if (!key) {
            console.log(`⚠️  ${name}: Clé non configurée`);
            continue;
        }

        try {
            const response = await axios.get('https://serpapi.com/account', {
                params: { api_key: key },
                timeout: 10000
            });

            const remaining = response.data.total_searches_left || 0;
            const plan = response.data.plan || 'Free';
            const status = remaining > 50 ? '✅' : remaining > 10 ? '⚠️ ' : '❌';

            console.log(`${status} ${name}: ${remaining} recherches restantes (Plan: ${plan})`);

            if (response.data.plan_searches_left !== undefined) {
                console.log(`   └─ Quota mensuel: ${response.data.plan_searches_left}`);
            }
        } catch (error) {
            console.log(`❌ ${name}: Erreur - ${error.message}`);
        }
    }

    console.log('');
}

getQuotas();
