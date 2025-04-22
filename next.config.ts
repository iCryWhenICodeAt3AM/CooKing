// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  reactStrictMode: true,
  env: {
    API_KEY: process.env.API_KEY,
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY,
  },
});