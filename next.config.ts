import withPWA from 'next-pwa';

const config = {
  reactStrictMode: true,
  env: {
    API_KEY: process.env.API_KEY,
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(config);
