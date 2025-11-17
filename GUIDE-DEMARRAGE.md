# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## ✅ Ce qui est déjà fait

- ✅ Structure du projet créée
- ✅ Dépendances npm installées
- ✅ Playwright installé
- ✅ Credentials Google copiés
- ✅ Scripts batch créés pour faciliter l'utilisation
- ✅ Workflow GitHub Actions configuré

## 📋 CE QU'IL VOUS RESTE À FAIRE

### Étape 1 : Préparer votre Google Sheet

1. **Créer ou ouvrir votre Google Sheet**
2. **Structurer votre sheet comme ceci :**

   | A (Mot-clé) | B (France) | C (USA) | D (Allemagne) | E (UK) | F (Italie) |
   |-------------|------------|---------|---------------|--------|------------|
   | pièces détachées ikea | | | | | |
   | fix my ikea | | | | | |
   | réparation meuble ikea | | | | | |

3. **Partager le sheet** avec l'email du service account :
   ```
   ikea-scraper-bot@my-project-1515074611155.iam.gserviceaccount.com
   ```
   (Donner les droits d'édition)

4. **Récupérer l'ID du sheet** dans l'URL :
   ```
   https://docs.google.com/spreadsheets/d/[VOTRE_ID_ICI]/edit
   ```

### Étape 2 : Configurer le fichier .env

1. **Ouvrir le fichier `.env`** dans ce dossier
2. **Remplacer** `VOTRE_ID_ICI` par l'ID de votre Google Sheet
3. **Vérifier** le nom de l'onglet (par défaut "Feuille 1")

Exemple :
```env
SPREADSHEET_ID=1iU7CXCNQkJeYlY6Sm-LHU2DFmI_H4LFzp_TRm7SWb4s
SHEET_NAME=Feuille 1
TARGET_DOMAIN=fix-my-kea.com
```

### Étape 3 : Tester en local

**Double-cliquer sur `2_tester.bat`**

Ce test va :
- Effectuer UNE recherche Google sur "pièces détachées ikea"
- Vous montrer le navigateur en action (mode visible)
- Prendre une capture d'écran
- Afficher les résultats

Si le test fonctionne ✅, passez à l'étape suivante !

### Étape 4 : Exécuter le scraping complet

**Double-cliquer sur `3_executer.bat`**

Cela va :
- Lire TOUS les mots-clés de votre Google Sheet (colonne A)
- Faire 5 recherches par mot-clé (FR, US, DE, UK, IT)
- Mettre à jour automatiquement votre Google Sheet

**⏱️ Temps estimé :** Environ 2-3 minutes par mot-clé (avec 5 recherches)

### Étape 5 : Déployer sur GitHub (automatisation)

#### 5.1 Créer le repository GitHub

1. Aller sur https://github.com/new
2. Créer un nouveau repository :
   - Nom : `automatisation-positions-google` (ou autre)
   - Visibilité : **Privé** (important pour protéger vos credentials)
   - Ne PAS initialiser avec README

3. Copier l'URL du repository (ex: `https://github.com/VotreUsername/automatisation-positions-google.git`)

#### 5.2 Pousser le code sur GitHub

**Double-cliquer sur `setup-github.bat`**

Puis dans le terminal, exécuter (remplacer [URL] par votre URL) :
```bash
git remote add origin [URL]
git push -u origin main
```

#### 5.3 Configurer les secrets GitHub

1. Sur GitHub, aller dans **Settings > Secrets and variables > Actions**
2. Cliquer sur **New repository secret** et ajouter :

   **Secret 1 : SPREADSHEET_ID**
   - Name : `SPREADSHEET_ID`
   - Value : L'ID de votre Google Sheet

   **Secret 2 : SHEET_NAME**
   - Name : `SHEET_NAME`
   - Value : `Feuille 1` (ou le nom de votre onglet)

   **Secret 3 : GOOGLE_CREDENTIALS**
   - Name : `GOOGLE_CREDENTIALS`
   - Value : Le contenu COMPLET du fichier `credentials.json`
     (Ouvrir le fichier avec Notepad, copier TOUT le contenu)

#### 5.4 Activer et tester l'automatisation

1. Aller dans l'onglet **Actions** de votre repository
2. Cliquer sur **Scraping Positions Google** dans la liste des workflows
3. Cliquer sur **Run workflow** pour tester manuellement

✅ Si tout fonctionne, le workflow s'exécutera automatiquement **tous les lundis à 8h00** !

## 🔧 Personnalisation

### Modifier la fréquence d'exécution

Éditer `.github/workflows/scraping-positions.yml` :

```yaml
schedule:
  - cron: '0 7 * * 1'  # Tous les lundis à 8h (heure de Paris)
```

Exemples :
- `0 7 * * *` : Tous les jours à 8h
- `0 7 * * 1,4` : Lundis et jeudis à 8h
- `0 7 1 * *` : Le 1er de chaque mois à 8h

### Ajouter un nouveau pays

Éditer `scraper-positions.js` et ajouter dans l'objet `COUNTRIES`.

## 📊 Résultats attendus

Dans votre Google Sheet, vous verrez :
- **Position numérique** (ex: 1, 5, 12) si le site est trouvé
- **N/A** si le site n'est pas dans les 100 premiers résultats
- **Erreur: ...** en cas de problème technique

## ⚠️ Notes importantes

- Google peut bloquer les requêtes trop fréquentes → Ne pas abuser
- Les résultats peuvent varier selon l'IP et l'historique
- Maximum 100 premiers résultats analysés par recherche
- Le script attend 2 secondes entre chaque recherche pour éviter le rate limiting

## 🆘 En cas de problème

### Erreur "SPREADSHEET_ID non configuré"
→ Vérifier que le fichier `.env` contient le bon ID

### Erreur "Sheet non trouvé"
→ Vérifier que le nom de l'onglet est correct dans `.env`

### Erreur "Permission denied"
→ Vérifier que le sheet est partagé avec le service account

### Erreur "Aucun résultat trouvé"
→ Google a peut-être bloqué la requête, réessayer plus tard

### GitHub Actions échoue
→ Vérifier que les 3 secrets sont bien configurés dans GitHub

## 📞 Questions ?

Consultez le fichier `README.md` pour plus de détails techniques.

---

**Bonne automatisation ! 🚀**
