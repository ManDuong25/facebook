import axios from 'axios';
import { getItemWithExpiration } from './localStorage';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    // timeout: 5000, // Đặt timeout tùy ý
});

api.interceptors.request.use(
    async (config) => {
        // lấy accessToken strong localStorage
        // const accessToken =
        //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg1ZTg5MjI5LTdkNzctNDIxYi05NjUzLTRkODZlYzMyYTdkMSIsInVzZXJuYW1lIjoiZGV2dGh1YW4iLCJlbWFpbCI6ImRldnRodWFuMjRAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudCIsImlhdCI6MTc0MDQxNDU4NywiZXhwIjoxNzc3NDEzNTc3fQ.z7iHolWcBGKQSxzBmo2Pqjt9LqQYDtqIgo6OZzJDUPI';
        const accessToken = getItemWithExpiration('accessToken') || null;

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
    async (config) => {
        // lấy accessToken strong localStorage
        const accessToken = getItemWithExpiration('accessToken') || null;
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);
export default api;
