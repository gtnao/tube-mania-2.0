export const MessageKind = {
  // TODO: Please replace this with your actual message actions
  GET_BODY_LENGTH: "GET_BODY_LENGTH",
} as const;

export type MessageKindType = (typeof MessageKind)[keyof typeof MessageKind];

export interface MessagePayloads {
  [MessageKind.GET_BODY_LENGTH]: {};
}

export interface MessageResponses {
  [MessageKind.GET_BODY_LENGTH]: {
    bodyLength: number;
  };
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
    console.error("No active tab found");
    return { success: false, error: "No active tab found" };
  }
  const message: Message<T> = {
    kind,
    payload,
  };
  const response: MessageResponse<T> = await chrome.tabs.sendMessage(
    tabId,
    message,
  );
  return response;
}

export async function getActiveTabId(): Promise<number | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab?.id ?? null;
}

export function isValidMessage(obj: any): obj is Message {
  return (
    obj &&
    typeof obj === "object" &&
    "kind" in obj &&
    "payload" in obj &&
    Object.values(MessageKind).includes(obj.kind)
  );
}

export function respondWithSuccess<T extends MessageKindType>(
  sendResponse: (response: MessageResponse<T>) => void,
  data: MessageResponses[T],
): void {
  sendResponse({
    success: true,
    data,
  });
}

export function respondWithError<T extends MessageKindType>(
  sendResponse: (response: MessageResponse<T>) => void,
  error: string,
): void {
  sendResponse({
    success: false,
    error,
  });
}
