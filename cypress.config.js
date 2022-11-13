const { defineConfig } = require('cypress');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 8000,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          launchOptions.extensions.push(path.join(__dirname, 'build/firefox'));
          launchOptions.args.push('--devtools');
        }
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.extensions.push(path.join(__dirname, 'build/chrome'));
          launchOptions.args.push('--auto-open-devtools-for-tabs');
        }

        return launchOptions;
      });
    },
  },
});
