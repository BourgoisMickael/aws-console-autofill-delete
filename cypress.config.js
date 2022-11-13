const { defineConfig } = require('cypress');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 8000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:browser:launch', (browser, launchOptions) => {
        // supply the absolute path to an unpacked extension's folder
        // NOTE: extensions cannot be loaded in headless Chrome
        launchOptions.extensions.push(path.join(__dirname, 'src'));
        launchOptions.args.push('--auto-open-devtools-for-tabs'); // chrome

        return launchOptions;
      });
    },
  },
});
