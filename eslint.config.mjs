import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	eslintPluginPrettierRecommended,
	{
		rules: {
			'prettier/prettier': ['error', { useTabs: true }],
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'src/generated/**',
		'next-env.d.ts',
		'scripts/trigger-reminders.js',
	]),
]);

export default eslintConfig;
