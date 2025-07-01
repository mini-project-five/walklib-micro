import User from "@/types/user";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userApi = {
    login: async (user: User) => {
        try {
            const response = await apiClient.post("/users/login", user);
            return response.data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    },
    signup: async (user: User) => {
        try {
            const response = await apiClient.post("/users/signup", user);
            return response.data;
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        }
    }
};
