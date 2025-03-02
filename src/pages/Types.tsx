import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { typesAPI } from "@/lib/api";
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

const TypesPage: React.FC = () => {
  const [newType, setNewType] = useState({
    name: "",
    descricao: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: activeTypes,
    isLoading: activeTypesLoading,
    refetch: refetchActiveTypes,
  } = useQuery({
    queryKey: ["activeTypes"],
    queryFn: typesAPI.getActive,
  });

  const {
    data: inactiveTypes,
    isLoading: inactiveTypesLoading,
    refetch: refetchInactiveTypes,
  } = useQuery({
    queryKey: ["inactiveTypes"],
    queryFn: typesAPI.getInactive,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: typesAPI.toggleStatus,
    onSuccess: () => {
      toast.success("Status do tipo alterado com sucesso");
      refetchActiveTypes();
      refetchInactiveTypes();
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: typesAPI.create,
    onSuccess: () => {
      toast.success("Tipo criado com sucesso");
      setNewType({ name: "", descricao: "" });
      setIsDialogOpen(false);
      refetchActiveTypes();
    },
  });

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.name || !newType.descricao) {
      toast.error("Preencha todos os campos");
      return;
    }
    await createTypeMutation.mutate(newType);
  };

  const handleToggleStatus = async (typeId: string) => {
    await toggleStatusMutation.mutate(typeId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewType({
      ...newType,
      [e.target.name]: e.target.value,
    });
  };

  const TypeTable = ({ data, isLoading, isActive }) => {
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
          Nenhum tipo {isActive ? "ativo" : "inativo"} encontrado
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
                <th className="py-3 px-4 text-left">Descrição</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((type) => (
                <tr key={type.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{type.id}</td>
                  <td className="py-3 px-4">{type.name}</td>
                  <td className="py-3 px-4">{type.descricao}</td>
                  <td className="py-3 px-4">
                    <StatusBadge isActive={isActive} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      onClick={() => handleToggleStatus(type.id)}
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
            <h2 className="text-3xl font-bold tracking-tight">Tipos</h2>
            <p className="text-muted-foreground">
              Gerencie os tipos de jogadores do sistema
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="animated-button">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Tipo</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para adicionar um novo tipo ao sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateType}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nome do tipo"
                      value={newType.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      name="descricao"
                      placeholder="Descrição do tipo"
                      value={newType.descricao}
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
                  <Button type="submit" disabled={createTypeMutation.isPending}>
                    {createTypeMutation.isPending ? "Criando..." : "Criar Tipo"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Tipos Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Tipos Inativos</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Tipos Ativos</CardTitle>
                <CardDescription>
                  Lista de todos os tipos ativos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TypeTable
                  data={activeTypes}
                  isLoading={activeTypesLoading}
                  isActive={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inactive" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Tipos Inativos</CardTitle>
                <CardDescription>
                  Lista de todos os tipos inativos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TypeTable
                  data={inactiveTypes}
                  isLoading={inactiveTypesLoading}
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

export default TypesPage;