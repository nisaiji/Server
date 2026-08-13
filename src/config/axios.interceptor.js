import axios from "axios";
import logger from "../logger/index.js";

export function setupAxiosInterceptors() {
  axios.interceptors.request.use((request) => {
    logger.debug("Axios request", {
      method: request.method,
      url: request.url,
      data: request.data
    });
    return request;
  });

  axios.interceptors.response.use(
    (response) => {
      logger.debug("Axios response", {
        status: response.status,
        url: response.config?.url
      });
      return response;
    },
    (error) => {
      logger.error(
        "Axios request error",
        {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data
        },
        error
      );
      return Promise.reject(error);
    }
  );
}
