module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['standard', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: 'cypress/**/*.js',
      extends: ['standard', 'plugin:cypress/recommended', 'plugin:prettier/recommended'],
      rules: {
        'prettier/prettier': ['error', require('./.prettierrc.json')],
        'cypress/no-unnecessary-waiting': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'prettier/prettier': ['error', require('./.prettierrc.json')],
  },
};
