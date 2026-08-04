const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Expo SDK 52 is tested with Gradle 8.6. Gradle 8.8+ breaks expo-module-gradle-plugin
// resolution via includeBuild and introduces 'components.release' incompatibilities
// in expo-modules-core.
const GRADLE_VERSION = '8.6';

const withGradleWrapper = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const wrapperPropsPath = path.join(
        config.modRequest.platformProjectRoot,
        'gradle/wrapper/gradle-wrapper.properties'
      );
      let contents = fs.readFileSync(wrapperPropsPath, 'utf-8');
      contents = contents.replace(
        /distributionUrl=.*/,
        `distributionUrl=https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-all.zip`
      );
      fs.writeFileSync(wrapperPropsPath, contents);
      return config;
    },
  ]);
};

module.exports = withGradleWrapper;
