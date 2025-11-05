import { useState, useCallback, useEffect } from 'react';
import { BleClient, numbersToDataView, numberToUUID } from '@capacitor-community/bluetooth-le';

const TARGET_NAME = 'ESP32-Security-TX';
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';

export type SystemState = 'ACTIVE' | 'SERVICE' | 'MOTION' | 'UNKNOWN';

export interface LogEntry {
  timestamp: Date;
  message: string;
  state?: SystemState;
}

export const useBluetooth = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceAddress, setDeviceAddress] = useState<string>('');
  const [currentState, setCurrentState] = useState<SystemState>('UNKNOWN');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const addLog = useCallback((message: string, state?: SystemState) => {
    setLogs(prev => [{
      timestamp: new Date(),
      message,
      state
    }, ...prev].slice(0, 50)); // Keep last 50 entries
  }, []);

  const handleNotification = useCallback((value: DataView) => {
    const decoder = new TextDecoder();
    const stateText = decoder.decode(value);
    
    if (stateText === 'ACTIVE' || stateText === 'SERVICE' || stateText === 'MOTION') {
      setCurrentState(stateText as SystemState);
      addLog(`State changed to ${stateText}`, stateText as SystemState);
    }
  }, [addLog]);

  const connect = useCallback(async () => {
    try {
      await BleClient.initialize();
      setIsScanning(true);
      addLog('Scanning for ESP32 transmitter...');

      const device = await BleClient.requestDevice({
        namePrefix: TARGET_NAME,
        optionalServices: [SERVICE_UUID]
      });

      if (device) {
        setDeviceAddress(device.deviceId);
        addLog(`Found device: ${device.name}`);
        
        await BleClient.connect(device.deviceId, () => {
          setIsConnected(false);
          addLog('Device disconnected');
          // Auto-reconnect after 5 seconds
          setTimeout(() => {
            if (deviceAddress) {
              reconnect();
            }
          }, 5000);
        });

        setIsConnected(true);
        addLog('Connected successfully');

        await BleClient.startNotifications(
          device.deviceId,
          SERVICE_UUID,
          CHAR_UUID,
          handleNotification
        );

        addLog('Listening for notifications');
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Connection error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : 'Failed to connect'}`);
      setIsScanning(false);
    }
  }, [addLog, handleNotification, deviceAddress]);

  const reconnect = useCallback(async () => {
    if (!deviceAddress) {
      await connect();
      return;
    }

    try {
      addLog('Attempting to reconnect...');
      await BleClient.connect(deviceAddress, () => {
        setIsConnected(false);
        addLog('Device disconnected');
      });

      setIsConnected(true);
      addLog('Reconnected successfully');

      await BleClient.startNotifications(
        deviceAddress,
        SERVICE_UUID,
        CHAR_UUID,
        handleNotification
      );
    } catch (error) {
      console.error('Reconnection error:', error);
      addLog(`Reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Try full connection scan instead
      setTimeout(() => connect(), 5000);
    }
  }, [deviceAddress, connect, addLog, handleNotification]);

  const disconnect = useCallback(async () => {
    if (deviceAddress) {
      try {
        await BleClient.disconnect(deviceAddress);
        setIsConnected(false);
        setDeviceAddress('');
        addLog('Disconnected by user');
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }, [deviceAddress, addLog]);

  return {
    isConnected,
    currentState,
    logs,
    isScanning,
    connect,
    disconnect,
    reconnect
  };
};
