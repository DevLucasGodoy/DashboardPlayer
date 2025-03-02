
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, typesAPI, contactsAPI } from "@/lib/api";
import { Users, Tag, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageTransition from "@/components/ui/PageTransition";

const DashboardCard = ({
  title,
  description,
  count,
  icon: Icon,
  loading,
  linkTo,
}) => (
  <Card className="overflow-hidden hover-scale">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {loading ? "..." : count}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <Button asChild variant="ghost" className="px-0 mt-2">
        <Link to={linkTo}>Ver detalhes &rarr;</Link>
      </Button>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const {
    data: users,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["activeUsers"],
    queryFn: usersAPI.getActive,
  });

  const {
    data: types,
    isLoading: typesLoading,
  } = useQuery({
    queryKey: ["activeTypes"],
    queryFn: typesAPI.getActive,
  });

  const {
    data: contacts,
    isLoading: contactsLoading,
  } = useQuery({
    queryKey: ["activeContacts"],
    queryFn: contactsAPI.getActive,
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do sistema de cadastro de jogadores
          </p>
        </div>

        <div className="glass-panel rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3">Bem-vindo ao sistema</h3>
          <p className="text-muted-foreground">
            Este sistema permite o gerenciamento completo de jogadores de futebol,
            incluindo usuários, tipos e contatos. Utilize o menu lateral para
            navegar entre as diferentes seções do sistema.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Usuários"
            description="Total de usuários ativos no sistema"
            count={users?.length || 0}
            icon={Users}
            loading={usersLoading}
            linkTo="/users"
          />
          <DashboardCard
            title="Tipos"
            description="Total de tipos cadastrados ativos"
            count={types?.length || 0}
            icon={Tag}
            loading={typesLoading}
            linkTo="/types"
          />
          <DashboardCard
            title="Contatos"
            description="Total de contatos ativos no sistema"
            count={contacts?.length || 0}
            icon={Phone}
            loading={contactsLoading}
            linkTo="/contacts"
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
