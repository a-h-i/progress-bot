module.exports = {
    'env': {
        'browser': false,
        'es2021': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module'
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'brace-style': [
            'error',
            '1tbs'
        ],
        'no-unused-vars': [
            2,
            {
                'args': 'all',
                'argsIgnorePattern': '^_',
                'vars': 'all'
            }
        ],
        'object-curly-spacing': [
            'error',
            'always'
        ],
        'array-bracket-spacing': [
            'error',
            'always'
        ],
        'comma-spacing': [
            'error',
            {
                'before': false,
                'after': true
            }
        ], 'keyword-spacing' : [
            'error',
            {
                'before': true,
                'after': true
            }
        ],
        'no-prototype-builtins' : [
            'off'
        ]
    }
};
