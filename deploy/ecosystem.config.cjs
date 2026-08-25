module.exports = {
  apps: [
    {
      name: 'swybuy-api',
      cwd: '/var/www/swybuy/api',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'swybuy-web',
      cwd: '/var/www/swybuy/web',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4000',
      },
    },
  ],
};
