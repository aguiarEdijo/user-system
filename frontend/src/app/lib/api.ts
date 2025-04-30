import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3001",
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);