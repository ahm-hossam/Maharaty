const { withGradleProperties } = require('@expo/config-plugins');

const withGradleMemory = (config) => {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      item => !(item.type === 'property' && item.key === 'org.gradle.jvmargs')
    );
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: '-Xmx4g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError',
    });
    return config;
  });
};

module.exports = withGradleMemory;
