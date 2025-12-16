# 🔍 Automatisation Scraping Positions Google

Automatisation pour tracker les positions Google du site **fix-my-kea.com** sur différents mots-clés dans 5 pays (France, USA, Allemagne, Royaume-Uni, Italie).

## 🎯 Fonctionnalités

- ✅ Scraping automatique des positions Google par pays
- ✅ Mise à jour automatique dans Google Sheets
- ✅ Exécution mensuelle (le 5 du mois) via GitHub Actions
- ✅ Possibilité de lancer manuellement à la demande
- ✅ Support multi-pays : FR, US, DE, UK, IT

## 📋 Prérequis

- Node.js 16+ installé
- Un compte Google Cloud avec API Sheets activée
- Un Google Sheet configuré avec la structure suivante :

| Colonne A | Colonne B | Colonne C | Colonne D | Colonne E | Colonne F |
|-----------|-----------|-----------|-----------|-----------|-----------|
| Mot-clé   | France    | USA       | Allemagne | UK        | Italie    |

## 🚀 Installation locale

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Copier le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Modifier `.env` avec vos informations :

```env
SPREADSHEET_ID=votre_id_de_spreadsheet_ici
SHEET_NAME=Feuille 1
TARGET_DOMAIN=fix-my-kea.com
```

### 3. Configurer Google Sheets API

Le fichier `credentials.json` doit être présent (déjà copié depuis le projet IKEA).

Partager votre Google Sheet avec l'email du service account :
```
ikea-scraper-bot@my-project-1515074611155.iam.gserviceaccount.com
```

### 4. Tester le script

```bash
# Test simple avec un mot-clé
npm test

# Exécution complète
npm start
```

## 🤖 Configuration GitHub Actions

### 1. Créer le repository GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git push -u origin main
```

### 2. Configurer les secrets GitHub

Aller dans **Settings > Secrets and variables > Actions** et ajouter :

- `SPREADSHEET_ID` : L'ID de votre Google Sheet
- `SHEET_NAME` : Le nom de l'onglet (ex: "Feuille 1")
- `GOOGLE_CREDENTIALS` : Le contenu complet du fichier `credentials.json`

### 3. Activer GitHub Actions

Le workflow s'exécutera :
- **Automatiquement** : Le 5 de chaque mois à 6h00 (heure de Paris)
- **Manuellement** : Via l'onglet "Actions" de votre repository

## 📊 Structure du Google Sheet

### Format attendu

**Ligne 1** : En-têtes (mis à jour automatiquement avec la date)
- A1 : "Mot-clé"
- B1 : "France (JJ/MM/AAAA)"
- C1 : "USA (JJ/MM/AAAA)"
- etc.

**À partir de la ligne 2** : Mots-clés
- Colonne A : Vos mots-clés à tracker
- Colonnes B-F : Positions trouvées (ou "N/A" si non trouvé)

### Exemple

| Mot-clé                    | France | USA | Allemagne | UK | Italie |
|----------------------------|--------|-----|-----------|----|----|
| pièces détachées ikea      | 3      | N/A | 5         | 12 | N/A |
| fix my ikea                | 1      | 2   | 1         | 1  | 3 |
| réparation meuble ikea     | 8      | N/A | N/A       | N/A | N/A |

## 🛠️ Architecture technique

### Technologies utilisées

- **Playwright** : Automatisation du navigateur pour simuler les recherches Google
- **Google Sheets API** : Lecture/écriture des données
- **GitHub Actions** : Automatisation de l'exécution
- **Node.js** : Environnement d'exécution

### Workflow

1. Connexion à Google Sheets
2. Lecture des mots-clés depuis la colonne A
3. Pour chaque mot-clé :
   - Recherche sur Google pour chaque pays
   - Extraction de la position du domaine cible
   - Écriture dans la colonne correspondante
4. Sauvegarde dans Google Sheets

## 🔧 Maintenance

### Modifier la fréquence d'exécution

Éditer `.github/workflows/scraping-positions.yml` :

```yaml
schedule:
  - cron: '0 5 5 * *'  # Le 5 de chaque mois à 5h UTC (6h Paris hiver / 7h Paris été)
```

Format cron : `minute heure jour mois jour_semaine`

### Ajouter un nouveau pays

Modifier `scraper-positions.js` et ajouter dans `COUNTRIES` :

```javascript
ES: {
    name: 'Espagne',
    googleUrl: 'https://www.google.es',
    locale: 'es-ES',
    acceptLanguage: 'es-ES,es;q=0.9',
    gl: 'es',
    hl: 'es',
    column: 6 // Colonne G
}
```

## 📝 Logs et débogage

- Les logs d'exécution sont disponibles dans l'onglet **Actions** de GitHub
- En local, les logs s'affichent dans le terminal
- Le script de test (`test-scraper.js`) prend une capture d'écran pour vérifier visuellement

## ⚠️ Limitations

- Google peut bloquer les requêtes trop fréquentes (rate limiting)
- Les résultats peuvent varier selon l'IP et l'historique de navigation
- Maximum 100 premiers résultats analysés par recherche

## 📞 Support

Pour toute question ou problème, vérifier :
1. Les logs dans GitHub Actions
2. Que le Google Sheet est bien partagé avec le service account
3. Que les secrets GitHub sont correctement configurés

## 📜 Licence

Usage privé - Automatisation personnelle
