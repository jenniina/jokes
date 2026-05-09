// eslint.config.mjs
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

// Type-aware TS-profiilit vain src/**:lle
const typeAwareSrc = [
  ...tseslint.configs.recommendedTypeChecked.map(c => ({
    ...c,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ...c.languageOptions,
      parserOptions: {
        ...(c.languageOptions?.parserOptions ?? {}),
        project: ['./tsconfig.json'],
      },
    },
  })),
  ...tseslint.configs.stylisticTypeChecked.map(c => ({
    ...c,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ...c.languageOptions,
      parserOptions: {
        ...(c.languageOptions?.parserOptions ?? {}),
        project: ['./tsconfig.json'],
      },
    },
  })),
]

export default [
  // Yleiset ignoret; poistetaan lintistä myös vite.config.ts ja temp.ts
  { ignores: ['dist', 'build', 'node_modules', 'vite.config.ts', 'temp.ts'] },

  // Perus TypeScript -säännöt (EI type-aware) kaikkialle
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Prettier-yhteensopivuus
  prettier,

  // Type-aware profiilit VAIN src/**:lle
  ...typeAwareSrc,

  // React + Hooks + a11y (ei tiedostorajausta; toimii TS/JS)
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // '@typescript-eslint/no-explicit-any': 'off',
      // 'react-hooks/exhaustive-deps': 'off',
      // '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      // '@typescript-eslint/no-unsafe-argument': 'off',
      // '@typescript-eslint/no-unsafe-assignment': 'off',
      // '@typescript-eslint/no-unsafe-call': 'off',
      // '@typescript-eslint/no-unsafe-member-access': 'off',
      // '@typescript-eslint/no-unsafe-return': 'off',
      // '@typescript-eslint/prefer-regexp-exec': 'off',
      // '@typescript-eslint/restrict-template-expressions': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-dupe-enum-members': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      semi: 'off',
      '@typescript-eslint/semi': 'off',
      quotes: 'off',
      '@typescript-eslint/quotes': 'off',
      indent: 'off',
      '@typescript-eslint/indent': 'off',
      'comma-dangle': 'off',
      'max-len': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
]

// import tseslint from 'typescript-eslint'
// import reactPlugin from 'eslint-plugin-react'
// import reactHooks from 'eslint-plugin-react-hooks'
// import jsxA11y from 'eslint-plugin-jsx-a11y'
// import prettier from 'eslint-config-prettier'

// export default [
//   { ignores: ['dist', 'build', 'node_modules', 'temp.txt'] },

//   ...tseslint.configs.recommended,
//   ...tseslint.configs.stylistic,

//   {
//     plugins: {
//       react: reactPlugin,
//       'react-hooks': reactHooks,
//       'jsx-a11y': jsxA11y,
//     },
//     rules: {
//       ...reactPlugin.configs.recommended.rules,
//       ...reactHooks.configs.recommended.rules,
//       ...jsxA11y.configs.recommended.rules,
//     },
//     settings: {
//       react: { version: 'detect' },
//     },
//   },

//   prettier,

//   {
//     files: ['src/**/*.{ts,tsx}'],
//     ...tseslint.configs.recommendedTypeChecked,
//     ...tseslint.configs.stylisticTypeChecked,
//     languageOptions: {
//       parserOptions: {
//         project: ['./tsconfig.json'],
//       },
//     },
//     rules: {
//       '@typescript-eslint/no-explicit-any': 'warn',
//       'react-hooks/exhaustive-deps': 'off',
//       'react/react-in-jsx-scope': 'off',
//       semi: 'off',
//       quotes: 'off',
//       indent: 'off',
//       'comma-dangle': 'off',
//       'max-len': 'off',
//       //ignore duplicate enum members
//       '@typescript-eslint/no-dupe-enum-members': 'off',
//       '@typescript-eslint/no-duplicate-enum-values': 'off',
//       '@typescript-eslint/no-unnecessary-type-assertion': 'off',
//       '@typescript-eslint/no-unsafe-argument': 'off',
//       '@typescript-eslint/no-unsafe-assignment': 'off',
//       '@typescript-eslint/no-unsafe-call': 'off',
//       '@typescript-eslint/no-unsafe-member-access': 'off',
//       '@typescript-eslint/no-unsafe-return': 'off',
//       '@typescript-eslint/prefer-regexp-exec': 'off',
//       '@typescript-eslint/restrict-template-expressions': 'off',
//     },
//   },
// ]
