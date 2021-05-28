module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@config': './src/config',
        '@database': './src/database',
        '@helpers': './src/helpers',
        '@middlewares': './src/middlewares',
        '@models': './src/models',
        '@routes': './src/routes',
        '@schemas': './src/schemas',
        '@services': './src/services',
      }
    }],
    'babel-plugin-transform-typescript-metadata',
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ],
  ignore: ['**/*.spec.ts'],
}