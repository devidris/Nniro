/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
    // experimental: {
    //   appDir: true,
    // },
    webpack: (config) => {
      config.externals = [...config.externals, { canvas: "canvas" }];
      return config;
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'fakeimg.pl',
          port: '',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
        },
        {
          protocol: 'https',
          hostname: 'pixel-bucket-21312312.s3.eu-north-1.amazonaws.com',
          port: '',
        },
      ],
    },
}

module.exports = nextConfig
