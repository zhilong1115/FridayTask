module.exports = {
  apps: [{
    name: 'friday-tasks',
    script: 'server/index.js',
    env: {
      FRIDAY_ADMIN_PASSWORD: 'ilovefriday'
    }
  }]
};
