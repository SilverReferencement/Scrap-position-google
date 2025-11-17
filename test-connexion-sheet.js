const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Feuille 1';

async function testConnection() {
    console.log('🧪 Test de connexion au Google Sheet\n');
    console.log(`📊 SPREADSHEET_ID: ${SPREADSHEET_ID}`);
    console.log(`📄 SHEET_NAME: ${SHEET_NAME}\n`);

    try {
        // Connexion
        const serviceAccountAuth = new JWT({
            email: require('./credentials.json').client_email,
            key: require('./credentials.json').private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        console.log('🔐 Authentification...');
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        console.log('📡 Connexion au Google Sheet...');
        await doc.loadInfo();

        console.log(`✅ Connecté avec succès!\n`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        console.log(`📊 Titre du document: "${doc.title}"`);
        console.log(`📝 Onglets disponibles: ${Object.keys(doc.sheetsByTitle).join(', ')}\n`);

        // Vérifier si l'onglet existe
        const sheet = doc.sheetsByTitle[SHEET_NAME];
        if (!sheet) {
            console.log(`❌ Onglet "${SHEET_NAME}" non trouvé!`);
            console.log(`\n💡 Modifiez le fichier .env avec un des onglets ci-dessus.\n`);
            process.exit(1);
        }

        console.log(`✅ Onglet "${SHEET_NAME}" trouvé!`);
        console.log(`📏 Dimensions: ${sheet.rowCount} lignes × ${sheet.columnCount} colonnes\n`);

        // Lire les premières lignes de la colonne A
        console.log('📖 Lecture de la colonne A (mots-clés)...\n');
        await sheet.loadCells('A1:A20');

        const keywords = [];
        for (let i = 1; i < Math.min(20, sheet.rowCount); i++) {
            const cell = sheet.getCell(i, 0);
            if (!cell.value || cell.value.toString().trim() === '') {
                break;
            }
            keywords.push(cell.value.toString().trim());
        }

        if (keywords.length === 0) {
            console.log(`⚠️  Aucun mot-clé trouvé dans la colonne A (à partir de A2)\n`);
            console.log(`💡 Ajoutez vos mots-clés dans la colonne A, à partir de la ligne 2.\n`);
        } else {
            console.log(`✅ ${keywords.length} mot(s)-clé(s) trouvé(s):\n`);
            keywords.forEach((keyword, index) => {
                console.log(`   ${index + 1}. ${keyword}`);
            });
            console.log('');
        }

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        console.log(`✅ TEST RÉUSSI!\n`);
        console.log(`Le script peut communiquer avec votre Google Sheet.`);
        console.log(`Vous pouvez maintenant lancer 2_tester.bat pour tester le scraping.\n`);

    } catch (error) {
        console.error(`\n❌ ERREUR:\n`);
        console.error(error.message);
        console.error('\n');

        if (error.message.includes('permission')) {
            console.error('💡 Solution:');
            console.error('   Vérifiez que le Google Sheet est bien partagé avec:');
            console.error('   ikea-scraper-bot@my-project-1515074611155.iam.gserviceaccount.com\n');
        }

        process.exit(1);
    }
}

testConnection();
