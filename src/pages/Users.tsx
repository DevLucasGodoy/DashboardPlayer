import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlusCircle, RefreshCw, Ban, Check } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import PageTransition from "@/components/ui/PageTransition";

interface UserData {
  username: string;
  email: string;
  password: string;
}

const UsersPage: React.FC = () => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    senha: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: activeUsers,
    isLoading: activeUsersLoading,
    refetch: refetchActiveUsers,
  } = useQuery({
    queryKey: ["activeUsers"],
    queryFn: usersAPI.getActive,
  });

  const {
    data: inactiveUsers,
    isLoading: inactiveUsersLoading,
    refetch: refetchInactiveUsers,
  } = useQuery({
    queryKey: ["inactiveUsers"],
    queryFn: usersAPI.getInactive,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: usersAPI.toggleStatus,
    onSuccess: () => {
      toast.success("Status do usuário alterado com sucesso");
      refetchActiveUsers();
      refetchInactiveUsers();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      toast.success("Usuário criado com sucesso");
      setNewUser({ username: "", email: "", senha: "" });
      setIsDialogOpen(false);
      refetchActiveUsers();
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    const userData: UserData = {
      username: newUser.username,
      email: newUser.email,
      password: newUser.senha,
    };
    
    await createUserMutation.mutate(userData);
  };

  const handleToggleStatus = async (userId: string) => {
    await toggleStatusMutation.mutate(userId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const UserTable = ({ data, isLoading, isActive }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum usuário {isActive ? "ativo" : "inativo"} encontrado
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Nome</th>
                <th className="py-3 px-4 text-left">email</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4">{user.nome}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <StatusBadge isActive={isActive} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      onClick={() => handleToggleStatus(user.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      {isActive ? (
                        <Ban className="h-4 w-4 text-destructive" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="animated-button">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para adicionar um novo usuário ao sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Nome completo"
                      value={newUser.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      placeholder="Digite a senha"
                      value={newUser.senha}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Usuários Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Usuários Inativos</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Usuários Ativos</CardTitle>
                <CardDescription>
                  Lista de todos os usuários ativos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserTable
                  data={activeUsers}
                  isLoading={activeUsersLoading}
                  isActive={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inactive" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Usuários Inativos</CardTitle>
                <CardDescription>
                  Lista de todos os usuários inativos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserTable
                  data={inactiveUsers}
                  isLoading={inactiveUsersLoading}
                  isActive={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default UsersPage;