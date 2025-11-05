import { useEffect } from "react";
import { Bluetooth, BluetoothOff, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ActivityLog } from "@/components/ActivityLog";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useAlarm } from "@/hooks/useAlarm";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { isConnected, currentState, logs, isScanning, connect, disconnect } = useBluetooth();
  const { isPlaying, triggerAlarm, stopAlarm, requestPermissions } = useAlarm();
  const { toast } = useToast();

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    if (currentState === 'MOTION') {
      triggerAlarm();
      toast({
        title: "Motion Detected!",
        description: "Security alert triggered",
        variant: "destructive",
      });
    }
  }, [currentState, triggerAlarm, toast]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold">ESP32 Security Monitor</h1>
          <p className="text-muted-foreground">Real-time motion detection system</p>
        </div>

        {/* Status Display */}
        <StatusIndicator state={currentState} />

        {/* Connection Controls */}
        <div className="flex gap-4">
          {!isConnected ? (
            <Button
              onClick={connect}
              disabled={isScanning}
              className="flex-1 gap-2"
              size="lg"
            >
              <Bluetooth className="h-5 w-5" />
              {isScanning ? "Scanning..." : "Connect to ESP32"}
            </Button>
          ) : (
            <Button
              onClick={disconnect}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
            >
              <BluetoothOff className="h-5 w-5" />
              Disconnect
            </Button>
          )}

          {isPlaying && (
            <Button
              onClick={stopAlarm}
              variant="destructive"
              className="flex-1 gap-2"
              size="lg"
            >
              <BellOff className="h-5 w-5" />
              Stop Alarm
            </Button>
          )}
        </div>

        {/* Connection Status */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <span className={`text-sm ${isConnected ? 'text-status-active' : 'text-muted-foreground'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Activity Log */}
        <ActivityLog logs={logs} />
      </div>
    </div>
  );
};

export default Index;
