const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:browser:launch', (browser, launchOptions) => {
        // supply the absolute path to an unpacked extension's folder
        // NOTE: extensions cannot be loaded in headless Chrome
        launchOptions.extensions.push(`${__dirname}/src`)
      
        return launchOptions
      })
    },
  },
});
