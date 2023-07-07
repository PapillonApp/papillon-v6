# Composants
L'interface de Papillon est composée d'une multitude d'élements personnalisés : les composants. Voici leur liste et leurs paramètres

## Table des matières
- [`<ListItem/>`](hey)
- [`<PapillonButton/>`](hey)
- [`<PapillonIcon/>`](hey)

## `<ListItem/>`
### Aperçu
<img src="https://i.imgur.com/rshTN7n.png" alt="Aperçu" width="500"/>

### Propriétés

| Propriété | Type/Paramètres | Par défaut | Commentaire |
|-|-|-|-|
| `title` | **string** | ` ` |
| `subtitle` | **string** | ` ` |
| `color` | **string** (hex) | ` ` |
| `icon` | **`<Component/>`** | ` ` | Utilisez préférablement une icone de `lucide-react-native` |
| `left` | **`<Component/>`** | ` ` | **Ne pas combiner avec `icon`** |
| `isLarge` | **boolean** | `false` | Agrandit l'espace entre `title` et `subtitle` : à utiliser pour une info non cliquable |
| `onPress` | **function()** | ` ` |
| `style` | **StyleSheet** | ` ` |

## `<PapillonButton/>`
### Aperçu
<img src="https://i.imgur.com/KnBA6qC.png" alt="Aperçu" width="500"/>

### Propriétés

| Propriété | Type/Paramètres | Par défaut | Commentaire |
|-|-|-|-|
| `title` | **string** | ` ` |
| `color` | **string** (hex) | ` ` |
| `light` | **boolean** | `false` | Définit si le bouton est rempli ou non |
| `onPress` | **function()** | ` ` |
| `style` | **StyleSheet** | ` ` |

## `<PapillonIcon/>`
### Aperçu
<img src="https://i.imgur.com/yQ2Fde5.png" alt="Aperçu" width="500"/>

### Propriétés

| Propriété | Type/Paramètres | Par défaut | Commentaire |
|-|-|-|-|
| `icon` | **`<Component/>`** | ` ` | Utilisez préférablement une icone de `lucide-react-native` |
| `color` | **string** (hex) | ` ` |
| `fill` | **boolean** | `false` | Définit si l'icône est remplie ou non |
| `small` | **boolean** | `false` | Permet d'afficher l'icone en taille réduite |
| `style` | **StyleSheet** | ` ` |