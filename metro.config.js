const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure resolver for web dependencies
config.resolver.platforms = ['native', 'ios', 'android', 'web'];
config.resolver.alias = {
  'react-dom': 'react-dom',
};

module.exports = withNativeWind(config, { input: './global.css' })
