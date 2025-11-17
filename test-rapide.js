const { chromium } = require('playwright');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Feuille 1';
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'fix-my-kea.com';

async function quickTest() {
    console.log('🚀 Test rapide de scraping\n');
    console.log(`🎯 Domaine cible: ${TARGET_DOMAIN}\n`);

    // Connexion au Google Sheet
    const serviceAccountAuth = new JWT({
        email: require('./credentials.json').client_email,
        key: require('./credentials.json').private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_NAME];
    await sheet.loadCells('A1:A10');

    // Lire le premier mot-clé
    const firstKeyword = sheet.getCell(1, 0).value?.toString().trim();

    if (!firstKeyword) {
        console.log('❌ Aucun mot-clé trouvé en A2');
        process.exit(1);
    }

    console.log(`🔍 Test avec le mot-clé: "${firstKeyword}"\n`);
    console.log(`📍 Recherche sur Google France...\n`);

    // Lancer le navigateur
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        locale: 'fr-FR',
        extraHTTPHeaders: { 'Accept-Language': 'fr-FR,fr;q=0.9' }
    });
    const page = await context.newPage();

    try {
        // Recherche Google
        const searchUrl = `https://www.google.fr/search?q=${encodeURIComponent(firstKeyword)}&gl=fr&hl=fr&num=100`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Accepter cookies
        try {
            const cookieBtn = await page.locator('#L2AGLb').first();
            if (await cookieBtn.isVisible({ timeout: 2000 })) {
                await cookieBtn.click();
                await page.waitForTimeout(1000);
            }
        } catch (e) {}

        // Extraire les résultats
        const resultLinks = await page.evaluate(() => {
            const results = [];
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
                        results.push(href);
                    }
                });
            });

            return results;
        });

        console.log(`✅ ${resultLinks.length} résultats extraits\n`);

        // Chercher le domaine cible
        let position = -1;
        for (let i = 0; i < resultLinks.length; i++) {
            if (resultLinks[i].includes(TARGET_DOMAIN)) {
                position = i + 1;
                break;
            }
        }

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        if (position > 0) {
            console.log(`✅ RÉSULTAT: ${TARGET_DOMAIN} trouvé en position ${position}\n`);
        } else {
            console.log(`ℹ️  RÉSULTAT: ${TARGET_DOMAIN} non trouvé (N/A)\n`);
            console.log(`   (Cela peut être normal si le site n'est pas positionné sur ce mot-clé)\n`);
        }

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        console.log(`✅ TEST RÉUSSI!\n`);
        console.log(`Le scraping Google fonctionne correctement.`);
        console.log(`\nVous pouvez maintenant:\n`);
        console.log(`1. Lancer 3_executer.bat pour scraper tous vos mots-clés`);
        console.log(`2. Ou configurer GitHub pour l'automatisation\n`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }

    await browser.close();
}

quickTest().catch(console.error);
