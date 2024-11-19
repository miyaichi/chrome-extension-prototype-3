# chrome-extension-prototype-3
Prototype of a chrome extension using side panel.

# Directory Structure

```
├── dist/                        # Compiled files (git ignored)
├── node_modules/                # Node modules (git ignored)
├── public/
│   └── sidepanel.html           # Side panel HTML
├── src/
│   ├── background.ts            # Background script
│   ├── components/
│   │   ├── DOMSelector.css
│   │   ├── DOMSelector.tsx      # DOM selector
│   │   ├── SettingPanel.css
│   │   ├── SettingPanel.tsx     # Setting panel
│   │   ├── ShareCapture.css
│   │   ├── ShareCapture.tsx     # Share Screen Capture
│   │   ├── TagInjection.css
│   │   └── TagInjection.tsx     # Tag injection
│   ├── contentScript.ts         # Content script
│   ├── lib/
│   │   ├── connectionManager.ts # Connection manager
│   │   ├── logger.ts            # Logger
│   │   └── settings.ts          # Settings
│   ├── sidepanel/
│   │   ├── App.css
│   │   ├── App.tsx              # Side panel
│   │   └── index.tsx
│   └── styles/
│       └── common.css           # Common styles
├── manifest.json                # Chrome extension manifest
├── package-lock.json            # NPM lock file
├── package.json                 # NPM configuration
├── postcss.config.js            # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── webpack.config.js            # Webpack configuration
```
