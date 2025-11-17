const { chromium } = require('playwright');
require('dotenv').config();

const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'fix-my-kea.com';

/**
 * Test simple pour vérifier que le scraping fonctionne
 */
async function testSearch() {
    console.log('🧪 Test du scraper de positions Google\n');
    console.log(`🎯 Domaine cible: ${TARGET_DOMAIN}\n`);

    const testKeyword = 'pièces détachées ikea';
    const testCountry = {
        name: 'France',
        googleUrl: 'https://www.google.fr',
        locale: 'fr-FR',
        acceptLanguage: 'fr-FR,fr;q=0.9',
        gl: 'fr',
        hl: 'fr'
    };

    console.log(`🔍 Test de recherche: "${testKeyword}" sur Google ${testCountry.name}\n`);

    const browser = await chromium.launch({
        headless: false, // Mode visible pour le test
        timeout: 60000
    });

    const context = await browser.newContext({
        locale: testCountry.locale,
        extraHTTPHeaders: {
            'Accept-Language': testCountry.acceptLanguage
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    try {
        // Construire l'URL de recherche
        const searchUrl = `${testCountry.googleUrl}/search?q=${encodeURIComponent(testKeyword)}&gl=${testCountry.gl}&hl=${testCountry.hl}&num=100`;

        console.log(`📍 Navigation vers: ${searchUrl}\n`);
        await page.goto(searchUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Attendre le chargement
        await page.waitForTimeout(3000);

        // Accepter les cookies si présents
        try {
            const cookieButtons = [
                'button:has-text("Accepter tout")',
                'button:has-text("Tout accepter")',
                '#L2AGLb'
            ];

            for (const selector of cookieButtons) {
                const count = await page.locator(selector).count();
                if (count > 0) {
                    console.log('🍪 Acceptation des cookies...\n');
                    await page.locator(selector).first().click();
                    await page.waitForTimeout(2000);
                    break;
                }
            }
        } catch (e) {
            console.log('ℹ️  Pas de popup de cookies\n');
        }

        // Extraire les résultats
        console.log('📊 Extraction des résultats...\n');
        const resultLinks = await page.evaluate(() => {
            const results = [];
            // Essayer plusieurs sélecteurs pour les résultats Google
            const selectors = [
                'div#search a[href]',
                'div.g a[href]',
                'div[data-sokoban-container] a[href]',
                'a[jsname]',
                'h3 a'
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
                        results.push({
                            href: href,
                            text: link.textContent
                        });
                    }
                });
            });

            return results;
        });

        console.log(`✅ ${resultLinks.length} résultats extraits\n`);
        console.log('📋 Top 10 résultats:\n');

        // Afficher les 10 premiers résultats
        resultLinks.slice(0, 10).forEach((result, index) => {
            const domain = new URL(result.href).hostname;
            const isTarget = domain.includes(TARGET_DOMAIN.replace('www.', ''));
            const marker = isTarget ? '🎯' : '  ';
            console.log(`${marker} ${index + 1}. ${domain}`);
        });

        // Chercher le domaine cible
        let position = -1;
        for (let i = 0; i < resultLinks.length; i++) {
            if (resultLinks[i].href.includes(TARGET_DOMAIN)) {
                position = i + 1;
                break;
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (position > 0) {
            console.log(`✅ RÉSULTAT: ${TARGET_DOMAIN} trouvé en position ${position}\n`);
        } else {
            console.log(`❌ RÉSULTAT: ${TARGET_DOMAIN} non trouvé dans les ${resultLinks.length} premiers résultats\n`);
        }

        // Prendre une capture d'écran
        await page.screenshot({ path: 'test-screenshot.png', fullPage: false });
        console.log('📸 Capture d\'écran sauvegardée: test-screenshot.png\n');

        // Garder le navigateur ouvert quelques secondes
        console.log('⏳ Navigateur reste ouvert 5 secondes pour inspection...\n');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ Erreur durant le test:', error.message);
    }

    await browser.close();
    console.log('✅ Test terminé!\n');
}

// Exécuter le test
testSearch().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
