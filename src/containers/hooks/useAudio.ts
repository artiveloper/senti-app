import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  AudioService,
  AudioState,
 } from 'services';

interface Audio {
  elapsedTime: number;
  isLoading: boolean;
  isActivated: boolean;
  isPlaying: boolean;
}

function useAudio(key: string) {
  const [audio, setAudio] = useState<Audio>({
    elapsedTime: 0,
    isLoading: false,
    isActivated: false,
    isPlaying: false,
  });

  const timer = useRef<NodeJS.Timeout>();

  const soundObserver = useCallback((state: AudioState) => {
    switch (state) {
      case AudioState.PLAY:
        setAudio(prev => ({
          ...prev,
          isLoading: false,
          isActivated: true,
          isPlaying: true,
        }));
        timer.current = setInterval(() => setAudio(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 500,
        })), 500);
        break;
      case AudioState.PAUSE:
        if (timer.current) {
          clearInterval(timer.current);
        }
        setAudio(prev => ({
          ...prev,
          isPlaying: false,
        }));
        break;
      case AudioState.STOP:
        if (timer.current) {
          clearInterval(timer.current);
        }
        setAudio(prev => ({
          ...prev,
          elapsedTime: 0,
          isPlaying: false,
        }));
        break;
      case AudioState.LOADING:
        setAudio(prev => ({
          ...prev,
          isLoading: true,
        }));
        break;
      case AudioState.ERROR:
        setTimeout(() => AudioService.play(key), 1000);
        break;
      case AudioState.NONE:
        if (timer.current) {
          clearInterval(timer.current);
        }
        setAudio({
          elapsedTime: 0,
          isLoading: false,
          isActivated: false,
          isPlaying: false,
        });
        break;
    }
  }, [key]);

  const play = useCallback(() => {
    AudioService.play(key);
  }, [key]);

  useEffect(() => {
    AudioService.addObserver(key, soundObserver);
    return AudioService.removeObserver(key, soundObserver);
  }, []);

  return {
    audio,
    play,
    pause: AudioService.pause,
    replay: AudioService.replay,
    release: AudioService.release,
  };
}

export default useAudio;
