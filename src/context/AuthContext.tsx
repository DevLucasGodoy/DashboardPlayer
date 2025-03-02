import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../lib/api";
import { toast } from "sonner";

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      if (!username || !password) {
        throw new Error("Username e senha são obrigatórios.");
      }
      const response = await authAPI.login(username, password);
      setIsAuthenticated(true);
      navigate("/dashboard");
      toast.success("Login realizado com sucesso!");
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Falha no login. Verifique suas credenciais.");
      throw error;
    }
  };  

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    navigate("/");
    toast.info("Você foi desconectado");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};