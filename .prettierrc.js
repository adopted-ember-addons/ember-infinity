// eslint-disable-next-line no-undef
module.exports = {
  printWidth: 120,
  overrides: [
    {
      files: '*.{js,ts}',
      options: {
        printWidth: 100,
        singleQuote: true,
      },
    },
  ],
};
