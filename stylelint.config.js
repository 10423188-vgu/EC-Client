export default {
  plugins: ['stylelint-order'],
  rules: {
    'order/properties-alphabetical-order': true,
    'unit-disallowed-list': ['s'],
  },
  overrides: [
    {
      files: ['src/shared/styles/globals.css'],
      rules: {
        'order/properties-alphabetical-order': null,
      },
    },
  ],
}
