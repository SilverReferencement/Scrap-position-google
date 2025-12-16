const axios = require('axios');
require('dotenv').config();

async function getQuotas() {
    console.log('🔍 Récupération des quotas SerpApi depuis votre configuration...\n');

    // Génère dynamiquement jusqu'à 10 clés
    const keys = [];
    const missingKeys = [];

    for (let i = 1; i <= 10; i++) {
        const envKey = i === 1 ? 'SERPAPI_KEY' : `SERPAPI_KEY${i}`;
        const key = process.env[envKey];
        if (key) {
            keys.push({ name: `Compte ${i}`, envKey, key });
        } else if (i <= 5) {
            // Les 5 premiers comptes sont attendus
            missingKeys.push(envKey);
        }
    }

    if (keys.length === 0) {
        console.log('❌ Aucune clé SerpApi configurée dans le fichier .env');
        console.log('   Assurez-vous d\'avoir configuré SERPAPI_KEY, SERPAPI_KEY2, etc.\n');
        return;
    }

    console.log(`📌 ${keys.length} compte(s) détecté(s)\n`);

    let totalRemaining = 0;
    const accountsInfo = [];

    for (const { name, envKey, key } of keys) {
        try {
            const response = await axios.get('https://serpapi.com/account', {
                params: { api_key: key },
                timeout: 10000
            });

            const data = response.data;
            const remaining = data.total_searches_left || 0;
            const plan = data.plan_name || 'Free';
            const monthlyUsed = data.this_month_usage || 0;
            const monthlyLimit = data.searches_per_month || 250;
            const accountStatus = data.account_status || '';

            totalRemaining += remaining;

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
                accountStatus,
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

            if (info.accountStatus) {
                console.log(`   ℹ️  Statut: ${info.accountStatus}`);
            }

            if (info.monthlyLimit > 0) {
                const percentUsed = ((info.monthlyUsed / info.monthlyLimit) * 100).toFixed(1);
                const percentRemaining = (100 - percentUsed).toFixed(1);
                console.log(`   📊 Quota mensuel: ${info.monthlyUsed}/${info.monthlyLimit} (${percentUsed}% utilisé, ${percentRemaining}% restant)`);
            }
        }
        console.log('');
    }

    // Résumé final
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 RÉSUMÉ TOTAL:`);
    console.log(`   • Comptes actifs: ${keys.length}`);
    console.log(`   • Comptes manquants: ${missingKeys.length}`);
    console.log(`   • Recherches restantes: ${totalRemaining}`);

    // Calcule le prochain renouvellement
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const dateFormatted = nextMonth.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const daysUntil = Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
    console.log(`   • Prochain renouvellement: ${dateFormatted} (dans ${daysUntil} jour(s))`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    // Affiche les clés manquantes
    if (missingKeys.length > 0) {
        console.log(`⚠️  ${missingKeys.length} clé(s) manquante(s):\n`);
        for (const missingKey of missingKeys) {
            console.log(`   • ${missingKey}`);
        }
        console.log('');
        console.log('📌 SOLUTION:');
        console.log('   1. Allez dans GitHub > Settings > Secrets and variables > Actions');
        console.log('   2. Récupérez les clés SerpApi manquantes');
        console.log('   3. Ajoutez-les à votre fichier .env local:');
        console.log('');
        for (const missingKey of missingKeys) {
            console.log(`      ${missingKey}=votre_cle_ici`);
        }
        console.log('');
        console.log('   Ou créez des comptes gratuits sur https://serpapi.com/');
        console.log('');
    }

    // Avertissement si épuisé
    if (totalRemaining < 100) {
        console.log('⚠️  ATTENTION: Budget faible! Vous avez moins de 100 recherches disponibles.');
        console.log('');
    }

    if (keys.length >= 5) {
        console.log('✅ Tous les 5 comptes SerpApi sont configurés!');
    }

    console.log('💡 Conseil: Exécutez ce script régulièrement pour surveiller votre consommation');
    console.log('');
}

getQuotas();
