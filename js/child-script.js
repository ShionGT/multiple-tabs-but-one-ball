/***********************
 * CANVAS
 ***********************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

var ball = null;

/***********************
 * ACROSS TABS COMMUNICATION
 ***********************/
import AcrossTabs from "across-tabs";

let myTabId = null;
let isActiveTab = false;

const child = new AcrossTabs.Child({
  onReady: () => {
    // Get this tab's ID after handshake
    const tabInfo = child.getTabInfo();
    myTabId = tabInfo.id;
  },

  onParentCommunication: (message) => {
    if (message.type === "ACTIVE_TAB_CHANGED") {
      isActiveTab = message.activeTabId === myTabId;
      updateBallVisibility();
    }
  },
});

// === Detect when this tab becomes active ===
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && myTabId) {
    // Tell parent that THIS tab is now active
    child.sendMessageToParent({
      type: "TAB_ACTIVE",
      tabId: myTabId,
    });
  } else {
    // Tab became hidden
    isActiveTab = false;
    updateBallVisibility();
  }
});

// Optional: Also detect when tab gets focus
window.addEventListener("focus", () => {
  if (myTabId) {
    child.sendMessageToParent({
      type: "TAB_ACTIVE",
      tabId: myTabId,
    });
  }
});

// === Your rendering logic ===
function updateBallVisibility() {
  ball = AcrossTabs.getSharedData("ball");
  if (!ball) {
    // If no ball data exists, create a new ball
    ball = new Ball(
      window.screenX + window.innerWidth / 2,
      window.screenY + window.innerHeight / 2,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      20,
    );
    AcrossTabs.setSharedData("ball", ball);
  }
  if (isActiveTab) {
    // Show / Start rendering the 2D ball
    ball.setVisibility(true);
  } else {
    // Hide / Pause the 2D ball
    ball.setVisibility(false);
  }
}
