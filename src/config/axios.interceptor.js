import axios from "axios";

export function setupAxiosInterceptors() {
  axios.interceptors.request.use((request) => {
    console.info("Axios request", {
      method: request.method,
      url: request.url,
      headers: request.headers,
      data: request.data
    });
    return request;
  });

  axios.interceptors.response.use(
    (response) => {
      console.info("Axios response", {
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error("Axios error", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
}
