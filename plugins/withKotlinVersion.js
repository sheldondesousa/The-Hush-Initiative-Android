const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withKotlinVersion(config, kotlinVersion = '2.1.0') {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /kotlinVersion\s*=\s*["'][\d.]+["']/g,
      `kotlinVersion = "${kotlinVersion}"`
    );
    return config;
  });
};
