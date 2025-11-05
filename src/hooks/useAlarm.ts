import { useState, useCallback, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useAlarm = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/alarm.mp3');
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
    }
  }, []);

  const triggerAlarm = useCallback(async () => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);

      // Vibrate
      await Haptics.vibrate({ duration: 1000 });

      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'ESP32 Security Alert',
          body: 'Motion Detected!',
          id: 1,
          schedule: { at: new Date(Date.now() + 100) }
        }]
      });

      // Play alarm sound
      initializeAudio();
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.error('Failed to play audio:', err);
          setIsPlaying(false);
        });
      }
    } catch (error) {
      console.error('Alarm error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, initializeAudio]);

  const stopAlarm = useCallback(async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);

      // Cancel any pending notifications
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    } catch (error) {
      console.error('Stop alarm error:', error);
    }
  }, []);

  return {
    isPlaying,
    triggerAlarm,
    stopAlarm,
    requestPermissions
  };
};
