module.exports = {
  apps: [{
    name: 'backend-api-dev',
    script: 'node_modules/.bin/nest',
    args: 'start --watch',  // --watch = অটো-রিলোড
    watch: ['src'],          // src ফোল্ডার watch করবে
    ignore_watch: ['node_modules', 'dist', 'logs'],
    watch_delay: 1000,
    env: {
      NODE_ENV: 'development',
      TZ: 'Asia/Dhaka'
    },
    error_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/dev-err.log',
    out_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/dev-out.log',
    time: true,
    max_memory_restart: '1G',
  }]
}
