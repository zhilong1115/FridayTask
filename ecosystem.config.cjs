module.exports = {
  apps: [{
    name: 'friday-tasks',
    script: 'server/index.js',
    env: {
      FRIDAY_ADMIN_PASSWORD: 'ilovefriday'
    },
    kill_timeout: 5000,
    wait_ready: false,
    max_restarts: 10,
    min_uptime: 5000,
    restart_delay: 2000,
  }]
};
