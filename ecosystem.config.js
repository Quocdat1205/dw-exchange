module.exports = {
  apps: [
    {
      name: "Dw exchange",
      script: "yarn start",
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
