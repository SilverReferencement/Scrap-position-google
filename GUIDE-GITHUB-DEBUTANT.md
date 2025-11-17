# 🚀 GUIDE GITHUB POUR DÉBUTANT

## 📊 Résumé de ce qu'on va faire

Vous avez déjà créé votre repository GitHub ici :
https://github.com/SilverReferencement/Scrap-position-google

Maintenant, on va :
1. **Configurer 4 secrets** (informations sensibles)
2. **Pousser le code** depuis votre ordinateur vers GitHub
3. **Activer l'automatisation** (scraping hebdomadaire)

---

## 🔐 ÉTAPE 1 : CONFIGURER LES SECRETS GITHUB

Vous êtes déjà sur la bonne page ! 👍
https://github.com/SilverReferencement/Scrap-position-google/settings/secrets/actions/new

### Secret 1 : SPREADSHEET_ID

**À quoi ça sert ?** Permet au script de se connecter à votre Google Sheet

**Comment faire :**
1. Dans le champ **Name**, écrire exactement : `SPREADSHEET_ID`
2. Dans le champ **Secret**, copier-coller :
   ```
   10DjqchzWuEIsoKu3FAfZTDNV0ExSKIOKH2oXDi-1tA4
   ```
3. Cliquer sur **Add secret** (bouton vert en bas)

---

### Secret 2 : SHEET_NAME

**À quoi ça sert ?** Le nom de l'onglet dans votre Google Sheet

**Comment faire :**
1. Cliquer sur **New repository secret** (en haut à droite)
2. Dans **Name**, écrire : `SHEET_NAME`
3. Dans **Secret**, écrire : `Feuille 1`
4. Cliquer sur **Add secret**

---

### Secret 3 : SERPAPI_KEY

**À quoi ça sert ?** Votre clé API pour faire les recherches Google

**Comment faire :**
1. Cliquer sur **New repository secret**
2. Dans **Name**, écrire : `SERPAPI_KEY`
3. Dans **Secret**, copier-coller :
   ```
   ff3244d668cba2a9c4095e8b0180dd6896b6e4d1d557aacfa42b43ffccfd627e
   ```
4. Cliquer sur **Add secret**

---

### Secret 4 : GOOGLE_CREDENTIALS

**À quoi ça sert ?** Permet à GitHub de se connecter à Google Sheets API

**Comment faire :**
1. Sur votre ordinateur, aller dans le dossier :
   ```
   C:\Users\charl\Automatisation scraping position google
   ```
2. Ouvrir le fichier `credentials.json` avec **Bloc-notes** (clic droit > Ouvrir avec > Bloc-notes)
3. **TOUT SÉLECTIONNER** (Ctrl+A) et **COPIER** (Ctrl+C)
4. Retourner sur GitHub
5. Cliquer sur **New repository secret**
6. Dans **Name**, écrire : `GOOGLE_CREDENTIALS`
7. Dans **Secret**, **COLLER** tout le contenu de credentials.json (Ctrl+V)
8. Cliquer sur **Add secret**

---

## ✅ Vérification

Après avoir ajouté les 4 secrets, vous devriez voir cette page :
https://github.com/SilverReferencement/Scrap-position-google/settings/secrets/actions

Avec 4 secrets listés :
- ✅ GOOGLE_CREDENTIALS
- ✅ SERPAPI_KEY
- ✅ SHEET_NAME
- ✅ SPREADSHEET_ID

**Si vous voyez les 4, c'est parfait ! Passez à l'étape 2** 🎉

---

## 📤 ÉTAPE 2 : POUSSER LE CODE SUR GITHUB

### Option A : Avec le script automatique (PLUS SIMPLE)

1. Dans le dossier `C:\Users\charl\Automatisation scraping position google`
2. **Double-cliquer** sur `setup-github.bat`
3. Attendre que la fenêtre s'ouvre
4. **Copier et exécuter** cette commande (remplacer l'URL si différente) :
   ```bash
   git remote add origin https://github.com/SilverReferencement/Scrap-position-google.git
   git push -u origin main
   ```

### Option B : Manuellement (si Option A ne marche pas)

1. Ouvrir **Git Bash** (ou Command Prompt) dans le dossier du projet
2. Exécuter ces commandes **une par une** :

   ```bash
   git init
   ```

   ```bash
   git add .
   ```

   ```bash
   git commit -m "Initial commit - Automatisation positions Google"
   ```

   ```bash
   git branch -M main
   ```

   ```bash
   git remote add origin https://github.com/SilverReferencement/Scrap-position-google.git
   ```

   ```bash
   git push -u origin main
   ```

### Que faire si on vous demande de vous connecter ?

GitHub peut demander vos identifiants :
- **Username** : SilverReferencement
- **Password** : Utiliser un **Personal Access Token** (pas votre mot de passe GitHub)

**Pour créer un token :**
1. Aller sur https://github.com/settings/tokens
2. Cliquer sur **Generate new token (classic)**
3. Donner un nom : "Scrap position google"
4. Cocher : **repo** (tous les sous-items)
5. Cliquer sur **Generate token**
6. **COPIER le token** (vous ne le reverrez plus !)
7. L'utiliser comme mot de passe quand Git le demande

---

## 🤖 ÉTAPE 3 : ACTIVER L'AUTOMATISATION

Une fois le code poussé sur GitHub :

1. Aller sur : https://github.com/SilverReferencement/Scrap-position-google/actions
2. Vous devriez voir le workflow **"Scraping Positions Google"**
3. Cliquer dessus
4. Cliquer sur **Run workflow** (bouton à droite)
5. Cliquer sur le bouton vert **Run workflow**
6. Attendre ~1-2 minutes
7. Le workflow devrait se terminer avec ✅ (vert)

### Si ça fonctionne :

🎉 **Félicitations !** Votre automatisation est active !

- ✅ Scraping automatique **tous les lundis à 8h00**
- ✅ Vous pouvez aussi le lancer manuellement quand vous voulez
- ✅ Les résultats sont automatiquement écrits dans votre Google Sheet

### Si ça échoue :

Regardez les logs pour voir l'erreur :
1. Cliquer sur le workflow qui a échoué (❌ rouge)
2. Cliquer sur **scrape-positions**
3. Lire le message d'erreur
4. Me contacter avec le message d'erreur

---

## 📅 PLANNING D'EXÉCUTION

### Automatique (hebdomadaire)
Le script s'exécutera automatiquement **tous les lundis à 8h00** (heure de Paris).

### Manuel (à la demande)
Vous pouvez lancer le scraping quand vous voulez :
1. Aller sur https://github.com/SilverReferencement/Scrap-position-google/actions
2. Cliquer sur **Scraping Positions Google**
3. Cliquer sur **Run workflow**
4. Confirmer

---

## 💰 CONSOMMATION DE CRÉDITS SERPAPI

Grâce à l'optimisation, le script n'utilise des crédits QUE pour :
- ✅ Les **nouveaux mots-clés** ajoutés
- ✅ Les **nouvelles exécutions** (pas le même jour)

**Exemple :**
- Lundi matin : 5 mots-clés × 5 pays = 25 recherches
- Lundi après-midi (même jour) : 0 recherche (déjà fait !)
- Vous ajoutez 2 nouveaux mots-clés
- Relancer le script : 2 × 5 = **10 recherches seulement**

---

## 🔧 MAINTENANCE

### Ajouter de nouveaux mots-clés
1. Ouvrir votre Google Sheet
2. Ajouter les mots-clés dans la colonne A (lignes suivantes)
3. Attendre le lundi suivant OU lancer manuellement sur GitHub

### Modifier la fréquence d'exécution
1. Éditer le fichier `.github/workflows/scraping-positions.yml`
2. Modifier la ligne `cron: '0 7 * * 1'`
   - `0 7 * * *` : Tous les jours à 8h
   - `0 7 * * 1,4` : Lundis et jeudis à 8h
   - `0 7 1 * *` : 1er de chaque mois à 8h

### Consulter les logs
Aller sur : https://github.com/SilverReferencement/Scrap-position-google/actions

Cliquer sur une exécution pour voir les détails.

---

## 🆘 EN CAS DE PROBLÈME

### Le workflow GitHub échoue
→ Vérifier que les 4 secrets sont bien configurés

### "Permission denied" sur Google Sheet
→ Vérifier que le sheet est partagé avec :
`ikea-scraper-bot@my-project-1515074611155.iam.gserviceaccount.com`

### "Invalid API key" SerpApi
→ Vérifier que le secret SERPAPI_KEY est correct

### Le code ne se pousse pas sur GitHub
→ Vérifier que vous avez bien créé un Personal Access Token

---

## 📞 PRÊT À CONTINUER ?

Une fois les 4 secrets configurés, **dites-moi** et je vous guiderai pour pousser le code ! 🚀
