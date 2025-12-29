// Message types for communication between popup and content script

export const MessageKind = {
  INIT: "INIT",
  PLAY: "PLAY",
  PAUSE: "PAUSE",
  BACK: "BACK",
  CHANGE_TIME: "CHANGE_TIME",
  CHANGE_VOLUME: "CHANGE_VOLUME",
  CHANGE_SPEED: "CHANGE_SPEED",
  CHANGE_PITCH: "CHANGE_PITCH",
  CHANGE_EQ: "CHANGE_EQ",
  RESET_EQ: "RESET_EQ",
  ENABLE_LOOP: "ENABLE_LOOP",
  SET_LOOP_START: "SET_LOOP_START",
  SET_LOOP_END: "SET_LOOP_END",
  TIME_UPDATE: "TIME_UPDATE",
} as const;

export type MessageKindType = (typeof MessageKind)[keyof typeof MessageKind];

// EQ frequency bands
export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;
export type EQBandIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Audio state interface
export interface AudioState {
  currentTime: number;
  duration: number;
  volume: number;
  speed: number;
  pitch: number;
  eqGains: number[];
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  isPlaying: boolean;
  isReady: boolean;
}

// Payload types for each message
export interface MessagePayloads {
  [MessageKind.INIT]: Record<string, never>;
  [MessageKind.PLAY]: Record<string, never>;
  [MessageKind.PAUSE]: Record<string, never>;
  [MessageKind.BACK]: { seconds: number };
  [MessageKind.CHANGE_TIME]: { time: number };
  [MessageKind.CHANGE_VOLUME]: { volume: number };
  [MessageKind.CHANGE_SPEED]: { speed: number };
  [MessageKind.CHANGE_PITCH]: { pitch: number };
  [MessageKind.CHANGE_EQ]: { bandIndex: EQBandIndex; gain: number };
  [MessageKind.RESET_EQ]: Record<string, never>;
  [MessageKind.ENABLE_LOOP]: { enabled: boolean };
  [MessageKind.SET_LOOP_START]: { time: number };
  [MessageKind.SET_LOOP_END]: { time: number };
  [MessageKind.TIME_UPDATE]: Record<string, never>;
}

// Response types for each message
export interface MessageResponses {
  [MessageKind.INIT]: AudioState;
  [MessageKind.PLAY]: { success: boolean };
  [MessageKind.PAUSE]: { success: boolean };
  [MessageKind.BACK]: { currentTime: number };
  [MessageKind.CHANGE_TIME]: { currentTime: number };
  [MessageKind.CHANGE_VOLUME]: { volume: number };
  [MessageKind.CHANGE_SPEED]: { speed: number };
  [MessageKind.CHANGE_PITCH]: { pitch: number };
  [MessageKind.CHANGE_EQ]: { bandIndex: EQBandIndex; gain: number };
  [MessageKind.RESET_EQ]: { eqGains: number[] };
  [MessageKind.ENABLE_LOOP]: { enabled: boolean };
  [MessageKind.SET_LOOP_START]: { time: number };
  [MessageKind.SET_LOOP_END]: { time: number };
  [MessageKind.TIME_UPDATE]: { currentTime: number; duration: number; isPlaying: boolean };
}

export interface Message<T extends MessageKindType = MessageKindType> {
  kind: T;
  payload: MessagePayloads[T];
}

export type MessageResponse<T extends MessageKindType = MessageKindType> =
  | {
      success: true;
      data: MessageResponses[T];
    }
  | {
      success: false;
      error: string;
    };

export async function sendMessageToActiveTab<T extends MessageKindType>(
  kind: T,
  payload: MessagePayloads[T],
): Promise<MessageResponse<T>> {
  const tabId = await getActiveTabId();
  if (tabId === null) {
    return { success: false, error: "No active tab found" };
  }
  const message: Message<T> = { kind, payload };
  try {
    const response: MessageResponse<T> = await chrome.tabs.sendMessage(tabId, message);
    return response;
  } catch {
    return { success: false, error: "Failed to send message to content script" };
  }
}

export async function getActiveTabId(): Promise<number | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab?.id ?? null;
}

export function isValidMessage(obj: unknown): obj is Message {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "kind" in obj &&
    "payload" in obj &&
    Object.values(MessageKind).includes((obj as { kind: string }).kind as MessageKindType)
  );
}

export function respondWithSuccess<T extends MessageKindType>(
  sendResponse: (response: MessageResponse<T>) => void,
  data: MessageResponses[T],
): void {
  sendResponse({ success: true, data });
}

export function respondWithError<T extends MessageKindType>(
  sendResponse: (response: MessageResponse<T>) => void,
  error: string,
): void {
  sendResponse({ success: false, error });
}
