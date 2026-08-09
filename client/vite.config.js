export default {
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/health': 'http://127.0.0.1:4000',
      '/tasks': 'http://127.0.0.1:4000',
      '/system': 'http://127.0.0.1:4000',
    },
  },
};
