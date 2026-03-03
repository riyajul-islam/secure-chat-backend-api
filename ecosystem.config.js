module.exports = {
  apps: [{
    name: 'backend-api',
    script: 'dist/main.js',
    instances: 'max', // Cluster mode
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/err.log',
    out_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/out.log',
    log_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/combined.log',
    time: true,
  }]
};
