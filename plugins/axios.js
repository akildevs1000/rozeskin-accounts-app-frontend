export default ({ $axios, store }, inject) => {
  // $axios.setBaseURL('https://backend.rozeskin.com/api/');

  $axios.onRequest(async (config) => {
    let user = store.state.auth.user;

    if (user) {
      config.params = {
        ...config.params,
      };
    }

    return config;
  });
};
