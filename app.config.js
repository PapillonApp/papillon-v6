const widgetConfig = {
  // Paths to all custom fonts used in all widgets
  fonts: [
    './assets/fonts/FixelText-Bold.ttf',
    './assets/fonts/FixelText-Light.ttf',
    './assets/fonts/FixelText-Medium.ttf',
    './assets/fonts/FixelText-Regular.ttf',
    './assets/fonts/FixelText-SemiBold.ttf'
  ],
  widgets: [
    {
      name: 'Hello', // This name will be the **name** with which we will reference our widget.
      label: 'My Hello Widget', // Label shown in the widget picker
      minWidth: '320dp',
      minHeight: '120dp',
      description: 'This is my first widget', // Description shown in the widget picker
      previewImage: './android-widgets/hello.png', // Path to widget preview image

      // How often, in milliseconds, that this AppWidget wants to be updated.
      // The task handler will be called with widgetAction = 'UPDATE_WIDGET'.
      // Default is 0 (no automatic updates)
      // Minimum is 1800000 (30 minutes == 30 * 60 * 1000).
      updatePeriodMillis: 1800000,
      resizeMode: "horizontal"
    },
    {
      name: 'ClickDemo',
      label: 'My Hello Widget',
      minWidth: '320dp',
      minHeight: '120dp',
      description: 'This is my first widget',
      previewImage: './android-widgets/hello.png',
      updatePeriodMillis: 1800000,
      resizeMode: "horizontal"
    },
    {
      name: 'EDT',
      label: 'Emploi du temps (3 cours)',
      minWidth: '320dp',
      minHeight: '120dp',
      description: 'Affiche les 3 prochains cours de votre emploi du temps au jour d\'aujourd\'hui',
      previewImage: './android-widgets/EDTWidget-preview.png',
      updatePeriodMillis: 1800000,
      resizeMode: "horizontal"
    },
  ],
};

module.exports = {
  "expo": {
    "name": "Papillon Dev",
    "slug": "papillonvex",
    "version": "6.3.1",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#34AC90"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "skoapp-prod"
          }
        ],
        "category": [
          "BROWSABLE",
          "DEFAULT"
        ]
      }
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "plus.pronote.app.dev"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#29947A"
      },
      "splash": {
        "image": "./assets/splash.png",
        "backgroundColor": "#34AC90",
        "resizeMode": "cover"
      },
      "package": "plus.pronote.app.dev",
      "permissions": [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.FOREGROUND_SERVICE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "f2cc90da-6b71-4890-860a-d4f72c764f3a"
      }
    },
    "plugins": [
      ['react-native-android-widget', widgetConfig],
      [
        "expo-notifications",
        {
          "sounds": [
            "assets/papillon_ding.wav"
          ]
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Papillon utilise ta position pour localiser des établissements autour de toi et également pour te localiser sur la carte."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Papillon utilise ta pellicule pour personnaliser ton profil et ton expérience."
        }
      ],
      [
        "expo-calendar",
        {
          "calendarPermission": "Papillon utilise ton calendrier pour ajouter des cours à celui-ci.",
          "remindersPermission": "Papillon utilise tes rappels pour ajouter des devoirs à celui-ci."
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Autorisez Papillon à utiliser Face ID."
        }
      ],
      [
        "expo-barcode-scanner",
        {
          "cameraPermission": "Papillon utilise ta caméra pour personnaliser ton compte ou scanner un QR-Code."
        }
      ],
      [
        "expo-dynamic-app-icon",
        {
          "relief": {
            "image": "./assets/customicons/relief.png",
            "prerendered": true
          },
          "beta": {
            "image": "./assets/customicons/beta.png",
            "prerendered": true
          },
          "black": {
            "image": "./assets/customicons/black.png",
            "prerendered": true
          },
          "chip": {
            "image": "./assets/customicons/chip.png",
            "prerendered": true
          },
          "cutted": {
            "image": "./assets/customicons/cutted.png",
            "prerendered": true
          },
          "classic": {
            "image": "./assets/customicons/classic.png",
            "prerendered": true
          },
          "gold": {
            "image": "./assets/customicons/gold.png",
            "prerendered": true
          },
          "gradient": {
            "image": "./assets/customicons/gradient.png",
            "prerendered": true
          },
          "metal": {
            "image": "./assets/customicons/metal.png",
            "prerendered": true
          },
          "neon": {
            "image": "./assets/customicons/neon.png",
            "prerendered": true
          },
          "pride": {
            "image": "./assets/customicons/pride.png",
            "prerendered": true
          },
          "purple": {
            "image": "./assets/customicons/purple.png",
            "prerendered": true
          },
          "rayspurple": {
            "image": "./assets/customicons/rayspurple.png",
            "prerendered": true
          },
          "rays": {
            "image": "./assets/customicons/rays.png",
            "prerendered": true
          },
          "retro": {
            "image": "./assets/customicons/retro.png",
            "prerendered": true
          },
          "sparkles": {
            "image": "./assets/customicons/sparkles.png",
            "prerendered": true
          },
          "backtoschool": {
            "image": "./assets/customicons/backtoschool.png",
            "prerendered": true
          },
          "barbie": {
            "image": "./assets/customicons/barbie.png",
            "prerendered": true
          },
          "betterneon": {
            "image": "./assets/customicons/betterneon.png",
            "prerendered": true
          },
          "macos": {
            "image": "./assets/customicons/macos.png",
            "prerendered": true
          },
          "oldios": {
            "image": "./assets/customicons/oldios.png",
            "prerendered": true
          },
          "verscinq": {
            "image": "./assets/customicons/verscinq.png",
            "prerendered": true
          }
        }
      ]
    ],
    "owner": "papillonapp"
  }
}