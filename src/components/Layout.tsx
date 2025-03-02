import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Tag, 
  Phone, 
  LogOut, 
  Home,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const Layout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "Usuários", path: "/users", icon: Users },
    { label: "Tipos", path: "/types", icon: Tag },
    { label: "Contatos", path: "/contacts", icon: Phone },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        {isSidebarOpen ? <X size={10} /> : <Menu size={30} />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed lg:static inset-y-0 left-0 glass-panel border-r",
              "flex flex-col"
            )}
          >
            <div className="p-4">
              <h1 className="text-xl font-bold">Cadastro de Jogadores</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gerenciamento</p>
            </div>
            
            <Separator />
            
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                        "transition-colors hover:bg-secondary",
                        isActive 
                          ? "bg-secondary text-primary font-medium" 
                          : "text-foreground/70"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 lg:pl-10">
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out",
            isSidebarOpen ? "lg:ml-0" : "ml-0"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="py-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Layout;
