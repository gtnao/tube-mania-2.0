import {
  isValidMessage,
  respondWithError,
  respondWithSuccess,
} from "../shared/messaging";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isValidMessage(message)) {
    console.error("Invalid message received:", message);
    respondWithError(sendResponse, "Invalid message format.");
    return;
  }
  switch (message.kind) {
    case "GET_BODY_LENGTH": {
      const bodyLength = document.body?.innerText.length ?? 0;
      respondWithSuccess(sendResponse, {
        bodyLength,
      });
    }
  }
});
