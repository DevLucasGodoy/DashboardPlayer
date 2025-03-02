import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const LoginForm: React.FC = () => {
  const [username, setusername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Username:", username);
      console.log("Password:", password);
  
      if (!username || !password) {
        console.error("Username and password are required.");
        return;
      }
  
      const response = await login(username, password);
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg glass-panel">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Cadastro de Jogadores</CardTitle>
          <CardDescription className="text-center">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome do Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="seu@username.com"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full animated-button" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          <p>Sistema de Cadastro de Jogadores de Futebol</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginForm;
