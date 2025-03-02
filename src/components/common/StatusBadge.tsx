import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive, className }) => {
  return (
    <span
      className={cn(
        "status-badge",
        isActive ? "status-badge-active" : "status-badge-inactive",
        className
      )}
    >
      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
};

export default StatusBadge;
