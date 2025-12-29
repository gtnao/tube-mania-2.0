import {
  isValidMessage,
  respondWithError,
  respondWithSuccess,
  MessageKind,
  type MessageResponse,
  type EQBandIndex,
} from "../shared/messaging";
import { AudioController } from "./audio/AudioController";

const audioController = new AudioController();

chrome.runtime.onMessage.addListener(
  (message: unknown, _sender: chrome.runtime.MessageSender, sendResponse: (response: MessageResponse) => void) => {
    if (!isValidMessage(message)) {
      respondWithError(sendResponse, "Invalid message format");
      return true;
    }

    handleMessage(message.kind, message.payload, sendResponse);
    return true;
  },
);

async function handleMessage(
  kind: string,
  payload: Record<string, unknown>,
  sendResponse: (response: MessageResponse) => void,
): Promise<void> {
  switch (kind) {
    case MessageKind.INIT: {
      const success = await audioController.initialize();
      if (success) {
        respondWithSuccess(sendResponse, audioController.getState());
      } else {
        respondWithError(sendResponse, "Failed to initialize audio controller. Make sure a video is playing.");
      }
      break;
    }

    case MessageKind.PLAY: {
      const success = audioController.play();
      respondWithSuccess(sendResponse, { success });
      break;
    }

    case MessageKind.PAUSE: {
      const success = audioController.pause();
      respondWithSuccess(sendResponse, { success });
      break;
    }

    case MessageKind.BACK: {
      const currentTime = audioController.back(payload.seconds as number);
      respondWithSuccess(sendResponse, { currentTime });
      break;
    }

    case MessageKind.CHANGE_TIME: {
      const currentTime = audioController.setCurrentTime(payload.time as number);
      respondWithSuccess(sendResponse, { currentTime });
      break;
    }

    case MessageKind.CHANGE_VOLUME: {
      const volume = audioController.setVolume(payload.volume as number);
      respondWithSuccess(sendResponse, { volume });
      break;
    }

    case MessageKind.CHANGE_SPEED: {
      const speed = audioController.setSpeed(payload.speed as number);
      respondWithSuccess(sendResponse, { speed });
      break;
    }

    case MessageKind.CHANGE_PITCH: {
      const pitch = audioController.setPitch(payload.pitch as number);
      respondWithSuccess(sendResponse, { pitch });
      break;
    }

    case MessageKind.CHANGE_EQ: {
      const bandIndex = payload.bandIndex as EQBandIndex;
      const gain = payload.gain as number;
      const resultGain = audioController.setEqBand(bandIndex, gain);
      respondWithSuccess(sendResponse, { bandIndex, gain: resultGain });
      break;
    }

    case MessageKind.RESET_EQ: {
      const eqGains = audioController.resetEq();
      respondWithSuccess(sendResponse, { eqGains });
      break;
    }

    case MessageKind.ENABLE_LOOP: {
      const enabled = audioController.setLoopEnabled(payload.enabled as boolean);
      respondWithSuccess(sendResponse, { enabled });
      break;
    }

    case MessageKind.SET_LOOP_START: {
      const time = audioController.setLoopStart(payload.time as number);
      respondWithSuccess(sendResponse, { time });
      break;
    }

    case MessageKind.SET_LOOP_END: {
      const time = audioController.setLoopEnd(payload.time as number);
      respondWithSuccess(sendResponse, { time });
      break;
    }

    case MessageKind.TIME_UPDATE: {
      const timeUpdate = audioController.getTimeUpdate();
      respondWithSuccess(sendResponse, timeUpdate);
      break;
    }

    default: {
      respondWithError(sendResponse, "Unknown message kind");
    }
  }
}
