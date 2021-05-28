const path = require('path');
module.exports = {
    root: true,
    extends: ['scratch', 'scratch/es6', 'scratch/react', 'plugin:import/errors'],
    env: {
        browser: true,
        node: true,
    },
    globals: {
        process: true
    },
    rules: {
        'import/no-mutable-exports': 'error',
        'import/no-commonjs': 'error',
        'import/no-amd': 'error',
        'import/no-nodejs-modules': 'error',
        'react/jsx-no-literals': 'error',
        'no-confusing-arrow': ['error', {
            'allowParens': true
        }],
        'no-console': 1,
        'no-unused-vars': 1,
        'no-prototype-builtins': 1,
        'comma-dangle': [1, 'never'],
        'import/no-commonjs': 0,
    },
    settings: {
        react: {
            version: '16.2' // Prevent 16.3 lifecycle method errors
        },
        'import/resolver': {
            webpack: {
                config: path.resolve(__dirname, '../webpack.config.js')
            }
        }
    }
};
