Voici une version nettoyée et optimisée de ton design Figma, sans duplicata et avec une structure claire et réutilisable. J’ai regroupé les styles communs, supprimé les redondances et clarifié la hiérarchie des composants.

---

## **Structure Globale**

### **1. Variables & Tokens Globaux**
*(À définir dans Figma comme "Design Tokens" ou "Variables")*

#### **Couleurs**
| Nom                | Valeur (HEX)       | Usage principal                     |
|--------------------|--------------------|-------------------------------------|
| Primary            | #8E55AD            | Boutons, accents, fond header        |
| Primary Light      | #A172BC            | Lignes, bordures                    |
| Text Dark          | #23142A            | Textes sombres                     |
| Text Light         | #D2D2D2            | Textes clairs                       |
| Text Gray          | #606060            | Métadonnées, texte secondaire       |
| Background         | #FDF9FF            | Fond de page                        |
| White              | #FFFFFF            | Cartes, fond sections               |
| Category Sport     | #00FF3F            | Bordure catégorie "Sport"           |
| Category Tech      | #009FFB            | Bordure catégorie "Tech"            |
| Category Culture   | #FF8100            | Bordure catégorie "Culture"         |

#### **Typographie**
- **Police**: Inter (à importer dans Figma)
- **Tailles & Poids**:
  - H1: 24px, Bold (700), uppercase
  - H2: 20px, Medium (500)
  - Body: 16px, Regular (400)
  - Meta: 12px, Regular (400)

---

## **2. Composants Réutilisables**

### **A. Header**
- **Structure**:
  - Logo (image)
  - Navigation (menu horizontal)
  - Langue + Thème (boutons)

```css
/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: white;
  width: 100%;
  height: 130px;
}

/* Logo */
.logo {
  width: 105px;
  height: 50px;
}

/* Navigation */
.nav {
  display: flex;
  gap: 40px;
  list-style: none;
}
.nav a {
  color: #653778;
  text-decoration: none;
  font-size: 16px;
}

/* Thème & Langue */
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(95, 57, 116, 0.2);
  border-radius: 60px;
  padding: 5px 10px;
}
```

---

### **B. Carte d’Article (Article Card)**
- **Variantes**:
  - Grande (avec image en fond)
  - Petite (image + texte en dessous)

```css
/* Carte Grande */
.article-card-large {
  width: 515px;
  height: 490px;
  border-radius: 10px;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.9)), url(image);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;
}
.article-card-large h3 {
  font-size: 20px;
  margin-bottom: 10px;
}
.article-card-large .meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  opacity: 0.9;
}

/* Carte Petite */
.article-card-small {
  width: 366px;
  height: 115px;
  background: white;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  gap: 10px;
}
.article-card-small img {
  width: 100px;
  height: 100px;
  border-radius: 5px;
}
.article-card-small .content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
```

---

### **C. Section avec Titre et Ligne**
- **Utilisation**: Pour chaque section (Actualités, Vidéos, etc.)

```css
.section {
  margin: 40px 0;
}
.section-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 20px;
}
.section-title {
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  color: #333;
}
.section-line {
  height: 1px;
  background: #A172BC;
}
```

---

### **D. Carte Vidéo (Video Card)**
- **Variantes**:
  - Grande (avec fond sombre)
  - Petite (liste horizontale)

```css
/* Carte Vidéo Grande */
.video-card-large {
  width: 730px;
  height: 419px;
  border-radius: 10px;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url(image);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;
  position: relative;
}
.video-card-large .play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 55px;
  height: 55px;
  border: 1.5px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Carte Vidéo Petite */
.video-card-small {
  width: 306px;
  height: 172px;
  border-radius: 10px;
  background: url(image);
  position: relative;
  overflow: hidden;
}
.video-card-small .play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 34px;
  border: 1.5px solid white;
  border-radius: 50%;
}
```

---

### **E. Catégorie (Tag)**
- **Utilisation**: Pour les tags de catégorie (Sport, Tech, etc.)

```css
.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 50px;
  font-size: 8px;
  text-transform: uppercase;
}
.category-tag.sport { border-color: #00FF3F; }
.category-tag.tech  { border-color: #009FFB; }
.category-tag.culture { border-color: #FF8100; }
```

---

### **F. Footer**
- **Structure**:
  - Logo + description
  - Coordonnées
  - Liens réseaux sociaux
  - Copyright

```css
.footer {
  background: white;
  border-radius: 55px;
  padding: 40px;
  margin-top: 60px;
  display: flex;
  justify-content: space-between;
}
.footer-section h4 {
  font-size: 20px;
  margin-bottom: 10px;
}
.social-icons {
  display: flex;
  gap: 10px;
}
.social-icons a {
  width: 24px;
  height: 24px;
  background: #23142A;
  border-radius: 3px;
}
```

---

## **3. Pages & Layouts**

### **A. Page d’Accueil**
- **Sections**:
  1. Header
  2. Hero (grande carte d’article)
  3. Actualités (grille de cartes)
  4. Vidéos (grande carte + liste)
  5. Publicités (bannières)
  6. Footer

```css
.home-page {
  background: #FDF9FF;
  min-height: 100vh;
  padding: 0 20px;
}
.main-container {
  max-width: 1280px;
  margin: 0 auto;
}
```

---

## **4. Conseils d’Optimisation Figma**
- **Utilise les "Components"** pour les cartes, boutons, tags, etc.
- **Crée des "Auto Layouts"** pour les listes et grilles.
- **Définit des "Styles"** pour les couleurs et typographies.
- **Organise tes frames** par section (Header, Hero, Actualités, etc.).

---
**Besoin d’aide pour implémenter un composant spécifique ou pour l’export en code ?** Dis-moi !