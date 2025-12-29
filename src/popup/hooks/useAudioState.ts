import { useState, useEffect, useCallback, useRef } from "react";
import { sendMessageToActiveTab, MessageKind, type AudioState, type EQBandIndex } from "../../shared/messaging";

const DEFAULT_STATE: AudioState = {
  currentTime: 0,
  duration: 0,
  volume: 1,
  speed: 1,
  pitch: 0,
  eqGains: new Array(10).fill(0),
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 0,
  isPlaying: false,
  isReady: false,
};

export function useAudioState() {
  const [state, setState] = useState<AudioState>(DEFAULT_STATE);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<number | null>(null);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await sendMessageToActiveTab(MessageKind.INIT, {});
    if (response.success) {
      setState(response.data);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  }, []);

  const play = useCallback(async () => {
    const response = await sendMessageToActiveTab(MessageKind.PLAY, {});
    if (response.success) {
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(async () => {
    const response = await sendMessageToActiveTab(MessageKind.PAUSE, {});
    if (response.success) {
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const back = useCallback(async (seconds: number) => {
    const response = await sendMessageToActiveTab(MessageKind.BACK, { seconds });
    if (response.success) {
      setState((prev) => ({ ...prev, currentTime: response.data.currentTime }));
    }
  }, []);

  const setCurrentTime = useCallback(async (time: number) => {
    const response = await sendMessageToActiveTab(MessageKind.CHANGE_TIME, { time });
    if (response.success) {
      setState((prev) => ({ ...prev, currentTime: response.data.currentTime }));
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    const response = await sendMessageToActiveTab(MessageKind.CHANGE_VOLUME, { volume });
    if (response.success) {
      setState((prev) => ({ ...prev, volume: response.data.volume }));
    }
  }, []);

  const setSpeed = useCallback(async (speed: number) => {
    const response = await sendMessageToActiveTab(MessageKind.CHANGE_SPEED, { speed });
    if (response.success) {
      setState((prev) => ({ ...prev, speed: response.data.speed }));
    }
  }, []);

  const setPitch = useCallback(async (pitch: number) => {
    const response = await sendMessageToActiveTab(MessageKind.CHANGE_PITCH, { pitch });
    if (response.success) {
      setState((prev) => ({ ...prev, pitch: response.data.pitch }));
    }
  }, []);

  const setEqBand = useCallback(async (bandIndex: EQBandIndex, gain: number) => {
    const response = await sendMessageToActiveTab(MessageKind.CHANGE_EQ, { bandIndex, gain });
    if (response.success) {
      setState((prev) => {
        const newEqGains = [...prev.eqGains];
        newEqGains[response.data.bandIndex] = response.data.gain;
        return { ...prev, eqGains: newEqGains };
      });
    }
  }, []);

  const resetEq = useCallback(async () => {
    const response = await sendMessageToActiveTab(MessageKind.RESET_EQ, {});
    if (response.success) {
      setState((prev) => ({ ...prev, eqGains: response.data.eqGains }));
    }
  }, []);

  const setLoopEnabled = useCallback(async (enabled: boolean) => {
    const response = await sendMessageToActiveTab(MessageKind.ENABLE_LOOP, { enabled });
    if (response.success) {
      setState((prev) => ({ ...prev, loopEnabled: response.data.enabled }));
    }
  }, []);

  const setLoopStart = useCallback(async (time: number) => {
    const response = await sendMessageToActiveTab(MessageKind.SET_LOOP_START, { time });
    if (response.success) {
      setState((prev) => ({ ...prev, loopStart: response.data.time }));
    }
  }, []);

  const setLoopEnd = useCallback(async (time: number) => {
    const response = await sendMessageToActiveTab(MessageKind.SET_LOOP_END, { time });
    if (response.success) {
      setState((prev) => ({ ...prev, loopEnd: response.data.time }));
    }
  }, []);

  const pollTimeUpdate = useCallback(async () => {
    const response = await sendMessageToActiveTab(MessageKind.TIME_UPDATE, {});
    if (response.success) {
      setState((prev) => ({
        ...prev,
        currentTime: response.data.currentTime,
        duration: response.data.duration,
        isPlaying: response.data.isPlaying,
      }));
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (state.isReady) {
      pollingRef.current = window.setInterval(pollTimeUpdate, 500);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [state.isReady, pollTimeUpdate]);

  return {
    state,
    error,
    isLoading,
    initialize,
    play,
    pause,
    back,
    setCurrentTime,
    setVolume,
    setSpeed,
    setPitch,
    setEqBand,
    resetEq,
    setLoopEnabled,
    setLoopStart,
    setLoopEnd,
  };
}
