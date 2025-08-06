module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // or other presets
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env", // This is the alias you'll use for importing
          path: ".env",
        },
      ],
    ],
  };
};
