/**********************************************************
 * Multi-Window Bouncing Ball (Child Tab)
 **********************************************************/

/***********************
 * TAB DATA
 ***********************/
const tabs = {};
let myTabId = null;
let isActiveTab = false;
let ball = null;

function getMyTab() {
  return {
    id: myTabId,
    x: window.screenX,
    y: window.screenY,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function isBallVisible() {
  if (!ball) return false;
  const left = window.screenX;
  const right = left + window.innerWidth;
  const top = window.screenY;
  const bottom = top + window.innerHeight;

  return (
    ball.x + ball.radius >= left &&
    ball.x - ball.radius <= right &&
    ball.y + ball.radius >= top &&
    ball.y - ball.radius <= bottom
  );
}

function getWorldBounds() {
  const allTabs = Object.values(tabs);

  if (allTabs.length === 0) {
    const me = getMyTab();
    return {
      left: me.x,
      right: me.x + me.width,
      top: me.y,
      bottom: me.y + me.height,
    };
  }

  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;

  for (const tab of allTabs) {
    left = Math.min(left, tab.x);
    right = Math.max(right, tab.x + tab.width);
    top = Math.min(top, tab.y);
    bottom = Math.max(bottom, tab.y + tab.height);
  }

  return { left, right, top, bottom };
}

/***********************
 * ACROSS TABS COMMUNICATION
 ***********************/
const AcrossTabsChild = AcrossTabs.default ? AcrossTabs.default.Child : AcrossTabs.Child;
const child = new AcrossTabsChild({
  onReady: () => {
    myTabId = child.getTabInfo().id;
    console.log("Child ready, tabId:", myTabId);
    // Initialize canvas when child is ready
    initCanvas();
  },

  onParentCommunication: (message) => {
    if (!message) return;

    if (message.type === "ACTIVE_TAB_CHANGED") {
      isActiveTab = message.activeTabId === myTabId;
    }

    if (message.type === "ball") {
      if (!ball) {
        ball = new Ball(
          window.screenX + window.innerWidth / 2,
          window.screenY + window.innerHeight / 2,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          20
        );
      }
      ball.setFromData(message.ball);
    }

    if (message.type === "window") {
      tabs[message.tab.id] = message.tab;
    }
  },
});

// === Detect when this tab becomes active ===
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && myTabId) {
    child.sendMessageToParent({
      type: "TAB_ACTIVE",
      tabId: myTabId,
    });
    broadcastWindowInfo();
  }
});

// Optional: Also detect when tab gets focus
window.addEventListener("focus", () => {
  if (myTabId) {
    child.sendMessageToParent({
      type: "TAB_ACTIVE",
      tabId: myTabId,
    });
    broadcastWindowInfo();
  }
});

// Broadcast window position to parent
function broadcastWindowInfo() {
  if (!myTabId) return;
  const info = getMyTab();
  child.sendMessageToParent({
    type: "window",
    tab: info,
  });
}

// Broadcast window position periodically for accurate boundary detection
setInterval(broadcastWindowInfo, 500);
window.addEventListener("resize", broadcastWindowInfo);

/***********************
 * GAME LOOP (for child)
 ***********************/
function loop() {
  if (ball && isBallVisible()) {
    ball.draw();
  }
  requestAnimationFrame(loop);
}

loop();