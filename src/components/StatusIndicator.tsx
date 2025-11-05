import { Shield, Settings, AlertTriangle } from "lucide-react";
import { SystemState } from "@/hooks/useBluetooth";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  state: SystemState;
}

export const StatusIndicator = ({ state }: StatusIndicatorProps) => {
  const getStateConfig = () => {
    switch (state) {
      case 'NORMAL':
        return {
          icon: Shield,
          text: 'System Normal',
          color: 'text-status-active',
          bgColor: 'bg-status-active/10',
          borderColor: 'border-status-active',
        };
      case 'MAINT':
        return {
          icon: Settings,
          text: 'Maintenance Mode',
          color: 'text-status-service',
          bgColor: 'bg-status-service/10',
          borderColor: 'border-status-service',
        };
      case 'ALARM':
        return {
          icon: AlertTriangle,
          text: 'ALARM - Motion Detected!',
          color: 'text-status-motion',
          bgColor: 'bg-status-motion/10',
          borderColor: 'border-status-motion',
        };
      default:
        return {
          icon: Shield,
          text: 'Status Unknown',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-muted',
        };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-2xl border-2 p-8 transition-all duration-300",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex flex-col items-center gap-4">
        <Icon className={cn("h-16 w-16", config.color)} />
        <h2 className={cn("text-3xl font-bold", config.color)}>
          {config.text}
        </h2>
      </div>
    </div>
  );
};
