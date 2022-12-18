/** @type {import('next').NextConfig} */
const nextConfig = {
	assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
	reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: true,
	},
};

module.exports = nextConfig;
