const axios = require('axios');
require('dotenv').config();

async function getQuotas() {
    console.log('🔍 Récupération des quotas SerpApi depuis votre configuration...\n');

    // Génère dynamiquement jusqu'à 10 clés
    const keys = [];
    for (let i = 1; i <= 10; i++) {
        const envKey = i === 1 ? 'SERPAPI_KEY' : `SERPAPI_KEY${i}`;
        const key = process.env[envKey];
        if (key) {
            keys.push({ name: `Compte ${i}`, envKey, key });
        }
    }

    if (keys.length === 0) {
        console.log('❌ Aucune clé SerpApi configurée dans le fichier .env');
        console.log('   Assurez-vous d\'avoir configuré SERPAPI_KEY, SERPAPI_KEY2, etc.\n');
        return;
    }

    console.log(`📌 ${keys.length} compte(s) détecté(s)\n`);

    let totalRemaining = 0;
    let nextRenewalDate = null;
    const accountsInfo = [];

    for (const { name, envKey, key } of keys) {
        try {
            const response = await axios.get('https://serpapi.com/account', {
                params: { api_key: key },
                timeout: 10000
            });

            const data = response.data;
            const remaining = data.total_searches_left || 0;
            const plan = data.plan || 'Free';
            const monthlyUsed = data.searches_used || 0;
            const monthlyLimit = data.monthly_limit || 0;
            const resetDate = data.reset_date || null;

            totalRemaining += remaining;

            // Détermine le prochain renouvellement
            if (resetDate) {
                const resetDateObj = new Date(resetDate);
                if (!nextRenewalDate || resetDateObj < nextRenewalDate) {
                    nextRenewalDate = resetDateObj;
                }
            }

            // Statut visuel
            let status = '✅';
            if (remaining === 0) status = '❌';
            else if (remaining < 50) status = '⚠️ ';

            accountsInfo.push({
                name,
                status,
                remaining,
                plan,
                monthlyUsed,
                monthlyLimit,
                resetDate,
                envKey
            });

        } catch (error) {
            accountsInfo.push({
                name,
                status: '❌',
                error: error.message,
                envKey
            });
        }
    }

    // Affiche les détails de chaque compte
    console.log('═══════════════════════════════════════════════════════════════');
    for (const info of accountsInfo) {
        console.log(`${info.status} ${info.name}`);
        console.log(`   Variable: ${info.envKey}`);

        if (info.error) {
            console.log(`   ❌ Erreur: ${info.error}`);
        } else {
            console.log(`   Plan: ${info.plan}`);
            console.log(`   📍 Recherches restantes: ${info.remaining}`);

            if (info.monthlyLimit > 0) {
                const percentUsed = ((info.monthlyUsed / info.monthlyLimit) * 100).toFixed(1);
                const percentRemaining = (100 - percentUsed).toFixed(1);
                console.log(`   📊 Quota mensuel: ${info.monthlyUsed}/${info.monthlyLimit} (${percentUsed}% utilisé, ${percentRemaining}% restant)`);
            }

            if (info.resetDate) {
                const resetDateObj = new Date(info.resetDate);
                const dateFormatted = resetDateObj.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const now = new Date();
                const daysUntil = Math.ceil((resetDateObj - now) / (1000 * 60 * 60 * 24));
                console.log(`   🔄 Renouvellement: ${dateFormatted} (dans ${daysUntil} jour(s))`);
            }
        }
        console.log('');
    }

    // Résumé final
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 RÉSUMÉ TOTAL:`);
    console.log(`   • Comptes actifs: ${keys.length}`);
    console.log(`   • Recherches restantes: ${totalRemaining}`);

    if (nextRenewalDate) {
        const dateFormatted = nextRenewalDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const now = new Date();
        const daysUntil = Math.ceil((nextRenewalDate - now) / (1000 * 60 * 60 * 24));
        console.log(`   • Prochain renouvellement: ${dateFormatted} (dans ${daysUntil} jour(s))`);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    // Avertissement si épuisé
    if (totalRemaining < 100) {
        console.log('⚠️  ATTENTION: Budget faible! Vous avez moins de 100 recherches disponibles.');
        console.log('');
    }

    console.log('💡 Conseil: Exécutez ce script régulièrement pour surveiller votre consommation');
    console.log('');
}

getQuotas();
