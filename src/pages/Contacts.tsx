import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { contactsAPI, typesAPI } from "@/lib/api";
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

interface ContactData {
  idtipo: string;
  idusuario: string;
  nome: string;
  valor: string;
}

const ContactsPage: React.FC = () => {
  const [newContact, setNewContact] = useState({
    idtipo: "",
    idusuario: "",
    nome: "",
    valor: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: activeContacts,
    isLoading: activeContactsLoading,
    refetch: refetchActiveContacts,
  } = useQuery({
    queryKey: ["activeContacts"],
    queryFn: contactsAPI.getActive,
  });

  const {
    data: inactiveContacts,
    isLoading: inactiveContactsLoading,
    refetch: refetchInactiveContacts,
  } = useQuery({
    queryKey: ["inactiveContacts"],
    queryFn: contactsAPI.getInactive,
  });

  const { data: types, isLoading: typesLoading } = useQuery({
    queryKey: ["activeTypes"],
    queryFn: typesAPI.getActive,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: contactsAPI.toggleStatus,
    onSuccess: () => {
      toast.success("Status do contato alterado com sucesso");
      refetchActiveContacts();
      refetchInactiveContacts();
    },
  });

  const createContactMutation = useMutation({
    mutationFn: contactsAPI.create,
    onSuccess: () => {
      toast.success("Contato criado com sucesso");
      setNewContact({ idtipo: "", idusuario: "", nome: "", valor: "" });
      setIsDialogOpen(false);
      refetchActiveContacts();
    },
  });

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.idtipo || !newContact.idusuario || !newContact.nome || !newContact.valor) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    const contactData: ContactData = {
      idtipo : newContact.idtipo,
      idusuario: newContact.idusuario, 
      nome: newContact.nome,
      valor: newContact.valor,
    };
    
    await createContactMutation.mutate(contactData);
  };

  const handleToggleStatus = async (contactId: string) => {
    await toggleStatusMutation.mutate(contactId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContact({
      ...newContact,
      [e.target.name]: e.target.value,
    });
  };

  const ContactTable = ({ data, isLoading, isActive }) => {
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
          Nenhum contato {isActive ? "ativo" : "inativo"} encontrado
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">ID do Tipo</th>
                <th className="py-3 px-4 text-left">ID do Usuário</th>
                <th className="py-3 px-4 text-left">Nome</th>
                <th className="py-3 px-4 text-left">Telefone</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{contact.idtipo}</td>
                  <td className="py-3 px-4">{contact.idusuario}</td>
                  <td className="py-3 px-4">{contact.nome}</td>
                  <td className="py-3 px-4">{contact.valor}</td>
                  <td className="py-3 px-4">
                    <StatusBadge isActive={isActive} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      onClick={() => handleToggleStatus(contact.id)}
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
            <h2 className="text-3xl font-bold tracking-tight">Contatos</h2>
            <p className="text-muted-foreground">
              Gerencie os contatos dos jogadores no sistema
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="animated-button">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Contato</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para adicionar um novo contato ao sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateContact}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">ID do Tipo</Label>
                    <Input
                      id="idtipo"
                      name="idtipo"
                      placeholder="ID do Tipo"
                      value={newContact.idtipo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idusuario">ID do Usuário</Label>
                    <Input
                      id="idusuario"
                      name="idusuario"
                      placeholder="ID do Usuário"
                      value={newContact.idusuario}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      name="nome"
                      placeholder="Nome"
                      value={newContact.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Telefone</Label>
                    <Input
                      id="valor"
                      name="valor"
                      placeholder="Telefone"
                      value={newContact.valor}
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
                  <Button type="submit" disabled={createContactMutation.isPending}>
                    {createContactMutation.isPending ? "Criando..." : "Criar Contato"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Contatos Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Contatos Inativos</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contatos Ativos</CardTitle>
                <CardDescription>
                  Lista de todos os contatos ativos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactTable
                  data={activeContacts}
                  isLoading={activeContactsLoading}
                  isActive={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inactive" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contatos Inativos</CardTitle>
                <CardDescription>
                  Lista de todos os contatos inativos no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactTable
                  data={inactiveContacts}
                  isLoading={inactiveContactsLoading}
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

export default ContactsPage;