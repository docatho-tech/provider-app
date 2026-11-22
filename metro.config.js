const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

/*
 * `@100mslive/react-native-hms` ships a commonjs build whose
 * `lib/commonjs/classes/HMSSDK.js` requires `../../package.json` — which
 * resolves to `lib/package.json`, a file the published package does not
 * contain. The path is correct only against the TypeScript source layout.
 *
 * Metro fails the whole bundle on it. Point the request at the package's real
 * manifest instead. This is a resolver shim rather than a patched
 * `node_modules`, so it survives a reinstall.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === '../../package.json' &&
    context.originModulePath.includes('@100mslive/react-native-hms')
  ) {
    return {
      type: 'sourceFile',
      filePath: require.resolve('@100mslive/react-native-hms/package.json'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/styles/global.css' })
