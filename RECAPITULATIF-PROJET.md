# 📦 RÉCAPITULATIF DU PROJET

## 🎯 Objectif du projet

Automatisation pour tracker les positions Google du site **fix-my-kea.com** sur différents mots-clés dans **5 pays** (France, USA, Allemagne, UK, Italie), avec mise à jour automatique dans **Google Sheets** via **GitHub Actions**.

---

## 📁 Structure du projet

```
Automatisation scraping position google/
│
├── 📄 FICHIERS PRINCIPAUX
│   ├── scraper-positions.js          ← Script principal de scraping
│   ├── test-scraper.js                ← Script de test (mode visible)
│   ├── package.json                   ← Dépendances npm
│   └── credentials.json               ← Credentials Google (copié depuis projet IKEA)
│
├── ⚙️ CONFIGURATION
│   ├── .env                           ← Configuration locale (À MODIFIER avec votre SPREADSHEET_ID)
│   ├── .env.example                   ← Template de configuration
│   └── .gitignore                     ← Fichiers à ignorer par Git
│
├── 🚀 SCRIPTS BATCH (Double-clic pour exécuter)
│   ├── 1_installer.bat                ← Installation des dépendances
│   ├── 2_tester.bat                   ← Test rapide (1 recherche)
│   ├── 3_executer.bat                 ← Exécution complète du scraping
│   └── setup-github.bat               ← Configuration Git pour GitHub
│
├── 📚 DOCUMENTATION
│   ├── README.md                      ← Documentation technique complète
│   ├── GUIDE-DEMARRAGE.md             ← Guide pas-à-pas pour démarrer
│   ├── CHECKLIST.md                   ← Checklist de déploiement
│   └── INFORMATIONS-NECESSAIRES.txt   ← Infos à fournir pour finaliser
│
└── 🤖 AUTOMATISATION GITHUB
    └── .github/
        └── workflows/
            └── scraping-positions.yml ← Workflow GitHub Actions (hebdomadaire + manuel)
```

---

## 🔧 Fonctionnalités implémentées

### ✅ Scraping multi-pays
- France (google.fr)
- USA (google.com)
- Allemagne (google.de)
- Royaume-Uni (google.co.uk)
- Italie (google.it)

### ✅ Intégration Google Sheets
- Lecture automatique des mots-clés (colonne A)
- Mise à jour automatique des positions (colonnes B-F)
- En-têtes avec date de scraping

### ✅ Automatisation GitHub Actions
- Exécution mensuelle : **Le 5 de chaque mois à 6h00** (heure de Paris)
- Exécution manuelle à la demande
- Logs détaillés pour chaque exécution

### ✅ Scripts facilitateurs
- Installation en un clic
- Test simple avant production
- Configuration Git automatisée

---

## 🛠️ Technologies utilisées

- **Node.js** : Environnement d'exécution
- **Playwright** : Automatisation du navigateur (Chromium)
- **Google Sheets API** : Lecture/écriture des données
- **GitHub Actions** : Automatisation de l'exécution
- **dotenv** : Gestion des variables d'environnement

---

## 📊 Format du Google Sheet

### Structure attendue

| Colonne | Contenu | Exemple |
|---------|---------|---------|
| A | Mot-clé | pièces détachées ikea |
| B | Position France | 3 ou N/A |
| C | Position USA | 5 ou N/A |
| D | Position Allemagne | N/A |
| E | Position UK | 12 |
| F | Position Italie | 2 |

### Notes importantes
- **Ligne 1** : En-têtes (mis à jour automatiquement avec la date)
- **À partir de ligne 2** : Vos mots-clés
- **Cellule vide** : Le script s'arrête à la première cellule vide en colonne A

---

## ⏱️ Performances

### Temps d'exécution estimé
- **1 mot-clé** : ~1-2 minutes (5 recherches : FR, US, DE, UK, IT)
- **10 mots-clés** : ~10-20 minutes
- **50 mots-clés** : ~50-100 minutes

### Optimisations implémentées
- Délai de 2 secondes entre chaque recherche (évite le rate limiting)
- Sauvegarde intermédiaire tous les 10 résultats
- Contexte navigateur renouvelé à chaque recherche (IP/session différente)

---

## 🔐 Sécurité

### Fichiers sensibles (.gitignore)
- ✅ `credentials.json` : Non versionné (sécurité)
- ✅ `.env` : Non versionné (configuration locale)
- ✅ `node_modules/` : Non versionné (volumétrie)

### GitHub Secrets
Les informations sensibles sont stockées dans GitHub Secrets :
- `SPREADSHEET_ID` : ID du Google Sheet
- `SHEET_NAME` : Nom de l'onglet
- `GOOGLE_CREDENTIALS` : Contenu de credentials.json

---

## 🎯 Prochaines étapes

1. **Configurer le Google Sheet** (voir GUIDE-DEMARRAGE.md)
2. **Modifier le fichier .env** avec votre SPREADSHEET_ID
3. **Tester en local** avec `2_tester.bat`
4. **Créer le repository GitHub** (privé)
5. **Pousser le code** avec `setup-github.bat`
6. **Configurer les secrets GitHub**
7. **Tester l'automatisation** (Run workflow)

---

## 📞 Support

### Documentation disponible
- `GUIDE-DEMARRAGE.md` : Guide pas-à-pas complet
- `CHECKLIST.md` : Liste de vérification
- `README.md` : Documentation technique
- `INFORMATIONS-NECESSAIRES.txt` : Infos à préparer

### En cas de problème
1. Consulter les logs dans le terminal (local) ou GitHub Actions (en ligne)
2. Vérifier la checklist
3. Consulter la section "En cas de problème" du GUIDE-DEMARRAGE.md

---

## ✨ Fonctionnalités futures possibles

- [ ] Support pour d'autres moteurs de recherche (Bing, DuckDuckGo)
- [ ] Graphiques d'évolution des positions
- [ ] Alertes email en cas de changement de position
- [ ] Support multi-domaines (tracker plusieurs sites)
- [ ] Export des résultats en CSV
- [ ] Dashboard web pour visualiser les résultats

---

**Projet créé le :** 17 novembre 2024
**Dernière mise à jour :** 17 novembre 2024
**Statut :** ✅ Prêt pour les tests locaux
