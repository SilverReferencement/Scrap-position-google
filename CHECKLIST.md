# ✅ CHECKLIST DE DÉPLOIEMENT

Utilisez cette checklist pour vous assurer que tout est bien configuré.

## 📋 Avant de commencer

- [ ] Node.js est installé sur votre machine
- [ ] Vous avez un compte Google Cloud avec l'API Sheets activée
- [ ] Vous avez un compte GitHub

## 🔧 Configuration locale

### Google Sheet
- [ ] Google Sheet créé avec la structure : A (Mot-clé), B-F (Pays)
- [ ] Sheet partagé avec `ikea-scraper-bot@my-project-1515074611155.iam.gserviceaccount.com`
- [ ] ID du Google Sheet récupéré

### Fichier .env
- [ ] Fichier `.env` modifié avec le bon SPREADSHEET_ID
- [ ] SHEET_NAME vérifié (ex: "Feuille 1")
- [ ] TARGET_DOMAIN = fix-my-kea.com

### Mots-clés
- [ ] Mots-clés ajoutés dans la colonne A du Google Sheet (à partir de A2)
- [ ] Aucune cellule vide entre les mots-clés

## 🧪 Tests locaux

- [ ] Exécuté `2_tester.bat` avec succès
- [ ] Capture d'écran `test-screenshot.png` créée
- [ ] Position affichée correctement dans le terminal
- [ ] (Optionnel) Exécuté `3_executer.bat` pour tester le script complet

## 🚀 Déploiement GitHub

### Création du repository
- [ ] Nouveau repository créé sur GitHub (privé recommandé)
- [ ] URL du repository récupérée

### Push du code
- [ ] Exécuté `setup-github.bat`
- [ ] Commandes `git remote add origin` et `git push` exécutées
- [ ] Code visible sur GitHub

### Configuration des secrets
- [ ] Secret `SPREADSHEET_ID` ajouté dans GitHub
- [ ] Secret `SHEET_NAME` ajouté dans GitHub
- [ ] Secret `GOOGLE_CREDENTIALS` ajouté dans GitHub (contenu complet de credentials.json)

### Test de l'automatisation
- [ ] Workflow visible dans l'onglet "Actions" de GitHub
- [ ] Exécution manuelle testée via "Run workflow"
- [ ] Workflow terminé avec succès (✅ vert)
- [ ] Google Sheet mis à jour automatiquement

## 🎯 Vérification finale

- [ ] Les positions s'affichent correctement dans le Google Sheet
- [ ] Les 5 colonnes (B-F) sont remplies pour chaque mot-clé
- [ ] Les en-têtes contiennent la date de scraping
- [ ] Le workflow est programmé pour s'exécuter le 1er du mois à 6h

## 📊 Monitoring

- [ ] Premier scraping automatique (le 1er du mois prochain) vérifié
- [ ] Notifications GitHub configurées (optionnel)
- [ ] Logs des exécutions consultés régulièrement

---

## ✅ Tout est coché ?

**Félicitations ! Votre automatisation est opérationnelle ! 🎉**

Le script s'exécutera automatiquement le 1er du mois à 6h (heure de Paris), et vous pouvez le lancer manuellement à tout moment depuis GitHub Actions.

---

## 🔄 Maintenance régulière

### Hebdomadaire
- Vérifier que le Google Sheet est bien mis à jour
- Consulter les logs dans GitHub Actions

### Mensuel
- Vérifier qu'il n'y a pas trop d'erreurs "N/A"
- Mettre à jour les mots-clés si nécessaire

### Si besoin
- Ajouter/supprimer des mots-clés dans la colonne A
- Modifier la fréquence d'exécution dans `.github/workflows/scraping-positions.yml`
