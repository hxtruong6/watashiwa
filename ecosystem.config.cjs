module.exports = {
	apps: [
		{
			name: 'watashiwa',

			script: 'node_modules/next/dist/bin/next',
			args: 'start',

			// Cluster mode
			instances: 1, // 'max' is Use all available cores
			exec_mode: 'cluster',

			// Watch mode (disabled in production)
			watch: false,

			// Memory management
			max_memory_restart: '2G',
			node_args: '--max-old-space-size=2048',

			// Environment variables
			env: {
				NODE_ENV: 'development',
				PORT: 3050,
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 3051,
			},

			// Logging
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			error_file: './logs/error.log',
			out_file: './logs/out.log',
			merge_logs: true,

			// Reliability & Lifecycle
			autorestart: true,
			exp_backoff_restart_delay: 1000, // Progressive restart delay if crashing
			max_restarts: 10,
			kill_timeout: 3000,
			wait_ready: true,
			listen_timeout: 10000,
		},
		{
			name: 'cron-reminders',
			script: 'scripts/trigger-reminders.js',
			instances: 1,
			exec_mode: 'fork',
			autorestart: false,
			cron_restart: '0 20 * * *', // Runs at 20:00 every day
			watch: false,
			env: {
				NODE_ENV: 'production',
				API_URL: 'http://localhost:3051', // Production port
				// CRON_SECRET should be loaded from .env or injected
			},
		},
		{
			name: 'inngest',
			script: 'scripts/start-inngest.sh',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			env: {
				NODE_ENV: 'production',
			},
			env_production: {
				NODE_ENV: 'production',
			},
			// Logging
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			error_file: './logs/inngest-error.log',
			out_file: './logs/inngest-out.log',
			merge_logs: true,
		},
	],

	// Deployment Configuration
	deploy: {
		vps_prod: {
			user: 'xuantruong', // Check: Is this the correct user?
			host: '34.143.229.101', // REPLACE THIS
			ref: 'origin/main',
			repo: 'git@github.com:hxtruong6/watashiwa.git', // REPLACE THIS with actual repo URL
			path: '/mnt/data1/watashiwa/', // Standard path, real path: /mnt/data1/watashiwa/source
			// Post-deploy hook:
			// 1. Install deps
			// 2. Generate Prisma client
			// 3. Migrate DB
			// 4. Build app
			// 5. Restart PM2
			'post-deploy':
				'pnpm install --prod=false && pnpm db:generate && pnpm db:migrate && pnpm build && pm2 startOrRestart ecosystem.config.cjs --env production && pm2 save',
			env: {
				NODE_ENV: 'production',
			},
		},
	},
};
