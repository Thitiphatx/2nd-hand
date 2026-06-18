import axios from "axios";
import type { IUser } from "../../pages/auth/interface";
import { notification } from "../Notification";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
})

apiClient.interceptors.request.use(
    (request) => {
        const localUser = localStorage.getItem('user')
        if (localUser) {
            const user = JSON.parse(localUser) as IUser
            request.headers['Authorization'] = `Bearer ${user.token}`
        }
        return request
    }
)

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {

        let errorTitle = "Error";
        let errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";

        if (error.message === "Network Error") {
            errorTitle = "Cannot connect to the server";
            errorMessage = "The server appears to be down or unavailable. Please try again shortly"
        }

        if (notification) {
            notification.error({
                message: errorTitle,
                description: errorMessage
            });
        }

        if (error.response?.status === 403) {
            localStorage.removeItem('user'); // clear expired token user data
            window.location.href = '/login'; // redirect to login page
        }

        return Promise.reject(error)
    },
)

export default apiClient