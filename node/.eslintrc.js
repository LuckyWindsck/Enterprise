module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': [
      'warn',
      {
        allow: ['log'],
      },
    ],
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
  },
};
