// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules['openid-client'] = path.resolve(__dirname, 'package.json')

module.exports = config;