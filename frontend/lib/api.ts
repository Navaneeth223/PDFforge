import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiUpload = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
