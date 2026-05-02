import axios from "axios";

export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

export const api = axios.create({
  baseURL: `${getBaseUrl()}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiUpload = axios.create({
  baseURL: `${getBaseUrl()}/api/v1`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
