'use client';

import React from 'react';

// Global Error must define its own html and body tags
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Something isn&apos;t quite right | WatashiWa</title>
				<style
					dangerouslySetInnerHTML={{
						__html: `
					:root {
						/* Zen Light Mode */
						--bg-color: #F9F7F2; /* colorBgBase */
						--card-bg: #FFFFFF;
						--text-primary: #1E3A5F; /* colorPrimary */
						--text-secondary: #666666;
						--accent-color: #FAAD14; /* colorWarning */
						--button-primary-bg: #1E3A5F;
						--button-primary-text: #FFFFFF;
						--button-secondary-bg: transparent;
						--button-secondary-text: #1E3A5F;
						--border-radius: 12px;
						--font-stack: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
					}
					
					@media (prefers-color-scheme: dark) {
						:root {
							/* Zen Dark Mode */
							--bg-color: #151F32;
							--card-bg: #1E2838;
							--text-primary: #FFFFFF;
							--text-secondary: rgba(255, 255, 255, 0.65);
							--accent-color: #FFB300;
							--button-primary-bg: #4A90D9;
							--button-primary-text: #FFFFFF;
							--button-secondary-bg: transparent;
							--button-secondary-text: #4A90D9;
						}
					}

					body {
						margin: 0;
						font-family: var(--font-stack);
						background-color: var(--bg-color);
						color: var(--text-primary);
						height: 100vh;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						line-height: 1.6;
					}

					.zen-container {
						background: var(--card-bg);
						padding: 40px;
						border-radius: var(--border-radius);
						box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
						text-align: center;
						max-width: 480px;
						width: 90%;
						transition: all 0.3s ease;
					}

					.zen-icon {
						font-size: 64px;
						margin-bottom: 24px;
						display: inline-block;
						animation: float 6s ease-in-out infinite;
					}

					h1 {
						margin: 0 0 12px;
						font-size: 24px;
						font-weight: 700;
						letter-spacing: -0.02em;
					}

					p {
						margin: 0 0 32px;
						color: var(--text-secondary);
						font-size: 16px;
					}

					.btn-group {
						display: flex;
						gap: 12px;
						justify-content: center;
						flex-direction: column;
					}

					@media (min-width: 480px) {
						.btn-group {
							flex-direction: row;
						}
					}

					button {
						padding: 12px 24px;
						font-size: 16px;
						font-weight: 600;
						border-radius: 8px;
						cursor: pointer;
						transition: all 0.2s ease;
						border: none;
					}

					.btn-primary {
						background: var(--button-primary-bg);
						color: var(--button-primary-text);
					}

					.btn-primary:active {
						transform: scale(0.98);
						opacity: 0.9;
					}

					.btn-secondary {
						background: var(--button-secondary-bg);
						color: var(--button-secondary-text);
						border: 1px solid currentColor;
					}

					.btn-secondary:active {
						transform: scale(0.98);
						background: rgba(0,0,0,0.05);
					}

					details {
						margin-top: 32px;
						text-align: left;
						font-size: 12px;
						color: var(--text-secondary);
						border-top: 1px solid rgba(0,0,0,0.1);
						padding-top: 16px;
					}

					summary {
						cursor: pointer;
						margin-bottom: 8px;
						font-weight: 500;
						opacity: 0.7;
					}

					code {
						display: block;
						background: rgba(0,0,0,0.05);
						padding: 8px;
						border-radius: 4px;
						overflow-x: auto;
						font-family: monospace;
					}

					@keyframes float {
						0% { transform: translateY(0px); }
						50% { transform: translateY(-10px); }
						100% { transform: translateY(0px); }
					}
				`,
					}}
				/>
			</head>
			<body>
				<div className="zen-container">
					<div className="zen-icon">🍵</div>
					<h1>Something isn&apos;t quite right</h1>
					<p>
						Usually, a quick refresh fixes this little hiccup.
						<br />
						<span style={{ fontSize: '0.9em', opacity: 0.8 }}>
							(Một chút gián đoạn nhỏ, hãy thử tải lại nhé)
						</span>
					</p>

					<div className="btn-group">
						<button className="btn-secondary" onClick={() => (window.location.href = '/')}>
							Return Home
						</button>
						<button
							className="btn-primary"
							onClick={() => {
								const btn = document.getElementById('retry-btn');
								if (btn) btn.innerText = 'Reloading...';
								reset();
							}}
							id="retry-btn"
						>
							Try Again
						</button>
					</div>

					<details>
						<summary>Show Technical Details</summary>
						<code>{error.message || 'Unknown Error'}</code>
						<div style={{ marginTop: 8, fontSize: '11px' }}>Digest: {error.digest || 'N/A'}</div>
					</details>
				</div>
			</body>
		</html>
	);
}
