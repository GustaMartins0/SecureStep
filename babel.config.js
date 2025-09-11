module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // plugins: ['react-native-worklets/plugin'], // Remova ou comente esta linha para web
  };
};
