module.exports = {
  apps: [
    {
      name: 'shiksha-api',
      script: './index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'prod',
        PORT: 4000
      }
    }
  ]
};
