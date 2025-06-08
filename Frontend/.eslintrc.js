// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'expo',
  ignorePatterns: ["/dist/*"],
  settings: {
    'import/resolver': {
      'babel-module': {
        alias: {
          '@components': './src/components',
          '@context': './src/context',
          '@hooks': './src/hooks',
          '@theme': './src/theme',
          '@app': './src/app',
          '@assets': './src/assets',
          '@ui': './src/components/ui'
        }
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    'import/no-unresolved': 'error'
  }
};
