const { chromium } = require('playwright');
require('dotenv').config();

const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'fix-my-kea.com';

async function debugTest() {
    console.log('🐛 Test de débogage (mode visible)\n');
    console.log(`🎯 Domaine cible: ${TARGET_DOMAIN}\n`);

    const testKeyword = 'pièces détachées ikea'; // Mot-clé plus générique

    console.log(`🔍 Test avec: "${testKeyword}"`);
    console.log(`📍 Google France\n`);
    console.log(`⏳ Le navigateur va s'ouvrir...\n`);

    const browser = await chromium.launch({
        headless: false, // MODE VISIBLE
        slowMo: 500 // Ralenti pour mieux voir
    });

    const context = await browser.newContext({
        locale: 'fr-FR',
        extraHTTPHeaders: { 'Accept-Language': 'fr-FR,fr;q=0.9' },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    try {
        const searchUrl = `https://www.google.fr/search?q=${encodeURIComponent(testKeyword)}&gl=fr&hl=fr&num=100`;

        console.log(`📍 Navigation vers Google...\n`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        console.log(`⏳ Attente de 3 secondes...\n`);
        await page.waitForTimeout(3000);

        // Essayer d'accepter les cookies
        try {
            console.log(`🍪 Recherche du bouton cookies...\n`);
            const cookieBtn = page.locator('#L2AGLb, button:has-text("Accepter"), button:has-text("Tout accepter")').first();
            if (await cookieBtn.isVisible({ timeout: 2000 })) {
                console.log(`✅ Bouton cookies trouvé, clic...\n`);
                await cookieBtn.click();
                await page.waitForTimeout(2000);
            }
        } catch (e) {
            console.log(`ℹ️  Pas de popup cookies\n`);
        }

        // Prendre une capture d'écran
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
        console.log(`📸 Capture d'écran sauvegardée: debug-screenshot.png\n`);

        // Extraire les résultats
        console.log(`📊 Extraction des résultats...\n`);
        const resultLinks = await page.evaluate(() => {
            const results = [];
            const selectors = [
                'div#search a[href]',
                'div.g a[href]',
                'div[data-sokoban-container] a[href]',
                'a[jsname]',
                'h3 a',
                '#rso a'
            ];

            const seen = new Set();
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(link => {
                    const href = link.href;
                    if (href &&
                        !href.includes('google.') &&
                        !href.startsWith('javascript:') &&
                        !href.includes('/search?') &&
                        !href.includes('accounts.google') &&
                        (href.startsWith('http://') || href.startsWith('https://')) &&
                        !seen.has(href)) {
                        seen.add(href);
                        results.push(href);
                    }
                });
            });

            return results;
        });

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        console.log(`✅ ${resultLinks.length} résultats extraits\n`);

        if (resultLinks.length > 0) {
            console.log(`📋 Top 10 résultats:\n`);
            resultLinks.slice(0, 10).forEach((link, index) => {
                try {
                    const domain = new URL(link).hostname;
                    const isTarget = domain.includes(TARGET_DOMAIN.replace('www.', ''));
                    const marker = isTarget ? '🎯' : '  ';
                    console.log(`${marker} ${index + 1}. ${domain}`);
                } catch (e) {
                    console.log(`   ${index + 1}. ${link.substring(0, 60)}...`);
                }
            });

            // Chercher le domaine cible
            let position = -1;
            for (let i = 0; i < resultLinks.length; i++) {
                if (resultLinks[i].includes(TARGET_DOMAIN)) {
                    position = i + 1;
                    break;
                }
            }

            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            if (position > 0) {
                console.log(`✅ ${TARGET_DOMAIN} trouvé en position ${position}\n`);
            } else {
                console.log(`ℹ️  ${TARGET_DOMAIN} non trouvé dans les ${resultLinks.length} premiers résultats\n`);
            }
        } else {
            console.log(`⚠️  AUCUN résultat extrait!\n`);
            console.log(`Vérifiez la capture d'écran debug-screenshot.png pour voir ce que Google affiche.\n`);
        }

        console.log(`⏳ Le navigateur reste ouvert 10 secondes pour inspection...\n`);
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error(`❌ Erreur:`, error.message);
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log(`📸 Capture d'erreur: error-screenshot.png\n`);
    }

    await browser.close();
    console.log(`✅ Test terminé!\n`);
}

debugTest().catch(console.error);
