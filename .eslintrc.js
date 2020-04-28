module.exports = {
  root: true,
  extends: ['marudor'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    __PATH_PREFIX__: false,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: ['marudor/typescript'],
    },
  ],
};
