module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.tsx', '.ts'],
          alias: {
            '@components': './src/components',
            '@context': './src/context',
            '@hooks': './src/hooks',
            '@theme': './src/theme',
            '@app': './src/app',
            '@assets': './src/assets',
            '@ui': './src/components/ui',
            '@services': './src/services',
            '@lib': './src/lib',
            '@providers': './src/providers',
            '@api': './src/hooks/api'
          },
        },
      ],
    ],
  };
}; 