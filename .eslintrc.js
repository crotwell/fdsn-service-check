module.exports = {
    "extends": "eslint:recommended",
    "plugins": [
        "standard",
        "promise"
    ],
    "env": {
      "es6": true,
      "browser": true
    },
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module",
    },
    "rules": {
      "semi": ["error", "always"],
      "no-unused-vars": "off",
      "no-console": "off"
    }
};
