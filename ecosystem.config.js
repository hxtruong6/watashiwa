module.exports = {
	apps: [
		{
			name: 'watashiwa',
			// Using 'npm start' is the most compatible way for Next.js
			// It handles its own environment loading (.env.production)
			script: 'npm',
			args: 'start',

			// Cluster mode
			instances: 'max', // Use all available cores
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
	],

	// Deployment Configuration
	// Run with: pm2 deploy production setup
	// Run with: pm2 deploy production
	deploy: {
		vps_prod: {
			user: 'xuantruong', // Check: Is this the correct user?
			host: '192.168.1.100', // REPLACE THIS
			ref: 'origin/main',
			repo: 'git@github.com:hxtruong6/watashiwa.git', // REPLACE THIS with actual repo URL
			path: '/var/www/watashiwa', // Standard path, can be changed
			// Post-deploy hook:
			// 1. Install deps
			// 2. Generate Prisma client
			// 3. Migrate DB
			// 4. Build app
			// 5. Restart PM2
			'post-deploy':
				'pnpm install && pnpm db:generate && pnpm db:migrate && pnpm build && pm2 startOrRestart ecosystem.config.js production && pm2 save',
			env: {
				NODE_ENV: 'production',
			},
		},
	},
};
