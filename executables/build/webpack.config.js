import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: 'node',
  mode: 'production',
  entry: '../../backEnd/server.js',
  output: {
    path: __dirname,
    filename: 'server-bundled.js',
    library: {
      type: 'commonjs2'
    },
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: '18'
                }
              }]
            ]
          }
        }
      }
    ]
  },
  externals: {
    // Keep node built-ins as externals
  }
};
