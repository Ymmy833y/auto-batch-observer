module.exports = [
  {
    // files: [
    //   'src/**/*.ts',
    //   'tests/**/*.ts',
    // ],
    ignores: [
      'node_modules/**',
      'dist/**',
      'static/js/bootstrap.min.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
        es2021: true,
      },
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'windows'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
];
