# chrome-extension-prototype-3
DOM Workbench is a Chrome extension that makes it easy to perform DOM operations on web pages. It provides functions such as screen capturing of selected DOM elements, adding comments, and sharing in PDF or PPT format.

## Main features
- Select DOM elements and display information
- Screen capture and comment functions
- Share screen capture with comments in PDF or PPT format
- Intuitive operation with side panel UI

## Technology stack
- **Language**: TypeScript
- **Library/Framework**: React
- **Tool**: Webpack, PostCSS

## Install and setup

1. Clone the repository
```bash
git clone https://github.com/miyaichi/chrome-extension-prototype-3.git
```

2. Install dependencies
```bash
cd chrome-extension-prototype-3
npm install
```

3. Build the extension
```bash
npm run build
```

4. Load the extension
   - Open Chrome and go to `chrome://extensions/`
   - Enable `Developer mode`
   - Click `Load unpacked` and select the `dist` directory

## Usage
1. Open the side panel by clicking the extension icon
2. Select the DOM selector tool and click on the element you want to select
3. Use the screen capture tool to capture the selected element

## Directory Structure

```
├── asset/
|   ├── fonts/                   # Fonts
├── dist/                        # Compiled files (git ignored)
├── node_modules/                # Node modules (git ignored)
├── public/
│   └── sidepanel.html           # Side panel HTML
├── src/
│   ├── background.ts            # Background script
│   ├── components/
│   │   ├── utils/               # Component-specific utilities
│   │   │   └── htmlTagFormatter.tsx # HTML tag formatting utility 
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
│   │   ├── settings.ts          # Settings
│   │   ├── shareAsPDF.ts        # Share in PDF
│   │   └── shareAsPPT.ts        # Share in PPT
│   ├── sidepanel/
│   │   ├── App.css
│   │   ├── App.tsx              # Side panel
│   │   └── index.tsx
│   ├── styles/
│   │   └── common.css           # Common styles
│   └── utils/                   # Utilities
│       ├── domSelection.ts      # DOM selection utility
│       ├── download.ts          # Download utility
│       └── formatter.ts         # Formatter utility
├── .gitignore                   # Git ignore
├── .prettierrc.js               # Prettier configuration
├── custom.d.ts                  # Custom type definitions
├── LICENSE                      # License
├── manifest.json                # Chrome extension manifest
├── package-lock.json            # NPM lock file
├── package.json                 # NPM configuration
├── postcss.config.js            # PostCSS configuration
├── README.md                    # Readme
├── tsconfig.json                # TypeScript configuration
└── webpack.config.js            # Webpack configuration
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```