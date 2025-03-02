import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactData {
  name: string;
  username: string;
  tipo_id: string;
  telefone: string;
  idade: number;
}

const ContactsPage: React.FC = () => {
  const [newContact, setNewContact] = useState({
    nome: "",
    tipo_id: "",
    telefone: "",
    idade: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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
      setNewContact({ nome: "", tipo_id: "", telefone: "", idade: "" });
      setIsDialogOpen(false);
      refetchActiveContacts();
    },
  });

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.nome || !newContact.tipo_id || !newContact.telefone || !newContact.idade) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    const contactData: ContactData = {
      name: newContact.nome,
      username: newContact.nome.toLowerCase().replace(/\s+/g, '.'), 
      tipo_id: newContact.tipo_id,
      telefone: newContact.telefone,
      idade: parseInt(newContact.idade),
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
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Nome</th>
                <th className="py-3 px-4 text-left">Tipo</th>
                <th className="py-3 px-4 text-left">Telefone</th>
                <th className="py-3 px-4 text-left">Idade</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{contact.id}</td>
                  <td className="py-3 px-4">{contact.nome}</td>
                  <td className="py-3 px-4">{contact.tipo?.nome || '-'}</td>
                  <td className="py-3 px-4">{contact.telefone}</td>
                  <td className="py-3 px-4">{contact.idade}</td>
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
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      name="nome"
                      placeholder="Nome do jogador"
                      value={newContact.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_id">Tipo</Label>
                    <Select
                      value={newContact.tipo_id}
                      onValueChange={(value) => 
                        setNewContact({ ...newContact, tipo_id: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {typesLoading ? (
                          <SelectItem value="" disabled>
                            Carregando tipos...
                          </SelectItem>
                        ) : (
                          types?.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={newContact.telefone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade</Label>
                    <Input
                      id="idade"
                      name="idade"
                      type="number"
                      placeholder="Idade do jogador"
                      value={newContact.idade}
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