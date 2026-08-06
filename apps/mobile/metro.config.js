const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// extraNodeModules is a fallback and loses to root node_modules.
// resolveRequest intercepts every resolution, so react-native (hoisted at root)
// always gets React 19 from apps/mobile instead of React 18 from root.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react' ||
    moduleName.startsWith('react/') ||
    moduleName === 'react-native-webview' ||
    moduleName.startsWith('react-native-webview/')
  ) {
    return {
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
      type: 'sourceFile',
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
