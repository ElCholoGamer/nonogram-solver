/** @type {import('next').NextConfig} */
const nextConfig = {
	assetPrefix: process.env.NODE_ENV === 'production' ? '/nonogram-solver/' : '',
	reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: true,
	},
};

module.exports = nextConfig;
