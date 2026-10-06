import {
  Droplets,
  ShieldCheck,
  Disc,
  CircleDot,
  Zap,
  Wrench,
  Cog,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import type { ServiceType } from "@/lib/types";

interface IconConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

const CONFIG: Record<ServiceType, IconConfig> = {
  oil_change: {
    icon: Droplets,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  insurance: {
    icon: ShieldCheck,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  tires: {
    icon: CircleDot,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  brakes: {
    icon: Disc,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  battery: {
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  part_replacement: {
    icon: Cog,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  repair: {
    icon: Wrench,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  other: {
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
};

export default function ServiceTypeIcon({
  type,
  size = "md",
}: {
  type: ServiceType;
  size?: "sm" | "md" | "lg";
}) {
  const conf = CONFIG[type] || CONFIG.other;
  const Icon = conf.icon;

  const sizeClasses = {
    sm: "h-7 w-7 rounded-lg text-xs",
    md: "h-9 w-9 rounded-xl text-sm",
    lg: "h-11 w-11 rounded-2xl text-base",
  }[size];

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center border ${conf.bg} ${conf.color} ${conf.border} ${sizeClasses} shrink-0`}
    >
      <Icon size={iconSizes} strokeWidth={2.2} />
    </div>
  );
}

