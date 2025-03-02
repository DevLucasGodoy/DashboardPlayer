import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = "https://entrevista-front-end.onrender.com";
// const API_BASE_URL = process.env.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Um erro ocorreu. Tente novamente.";
    toast.error(message);
    
    if (error.response?.status === 401 && window.location.pathname !== "/") {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
    
    return Promise.reject(error);
  }
);

interface UserData {
  username: string;
  password: string;
}

interface TypeData {
  name: string;
  description?: string;
}

interface ContactData {
  name: string;
  username: string;
  phone?: string;
}

export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);
    formData.append('client_id', '01'); 
    formData.append('client_secret', 'string');
    
    const response = await api.post("/token/", formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem("auth_token", response.data.access_token);
    }
    
    return response.data;
  },
};

export const usersAPI = {
  create: async (userData: UserData) => {
    const response = await api.post("/usuario/", userData);
    return response.data;
  },
  getActive: async () => {
    const response = await api.get("/usuarios/ativos/");
    return response.data;
  },
  getInactive: async () => {
    const response = await api.get("/usuarios/inativos/");
    return response.data;
  },
  toggleStatus: async (userId: string) => {
    const response = await api.put(`/usuario/${userId}/status/`);
    return response.data;
  },
};

export const typesAPI = {
  create: async (typeData: TypeData) => {
    const response = await api.post("/tipo/", typeData);
    return response.data;
  },
  getActive: async () => {
    const response = await api.get("/tipos/ativos/");
    return response.data;
  },
  getInactive: async () => {
    const response = await api.get("/tipos/inativos/");
    return response.data;
  },
  toggleStatus: async (typeId: string) => {
    const response = await api.put(`/tipo/${typeId}/status/`);
    return response.data;
  },
};

export const contactsAPI = {
  create: async (contactData: ContactData) => {
    const response = await api.post("/contato/", contactData);
    return response.data;
  },
  getActive: async () => {
    const response = await api.get("/contatos/ativos/");
    return response.data;
  },
  getInactive: async () => {
    const response = await api.get("/contatos/inativos/");
    return response.data;
  },
  toggleStatus: async (contactId: string) => {
    const response = await api.put(`/contato/${contactId}/status/`);
    return response.data;
  },
};

export default api;