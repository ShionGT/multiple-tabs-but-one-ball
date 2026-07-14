/**********************************************************
 * Multi-Window Bouncing Ball (Global Coordinates)
 * Requires:
 *   <canvas id="gameCanvas"></canvas>
 *   AcrossTabs library loaded.
 **********************************************************/

/***********************
 * ACROSS TABS SETUP
 ***********************/
// ES Modules (Vite, Webpack, etc.)
import AcrossTabs from "across-tabs";

// CommonJS
const AcrossTabs = require("across-tabs");

const parent = new AcrossTabs.Parent({
  onChildCommunication: (message, tabInfo) => {
    if (message.type === "TAB_ACTIVE") {
      currentActiveTabId = message.tabId;

      // Tell all tabs who the current active tab is
      parent.broadCastAll({
        type: "ACTIVE_TAB_CHANGED",
        activeTabId: currentActiveTabId,
      });
    }
  },
});

createTabButton = document.getElementById("createTabButton");

createTabButton.addEventListener("click", () => {
  parent.openNewTab({ url: "pages/child.html" });
}


/***********************
 * TAB DATA
 ***********************/
const tabs = {};

function getMyTab() {
  return {
    id: TAB_ID,
    x: window.screenX,
    y: window.screenY,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function broadcastWindowInfo() {
  const info = getMyTab();

  tabs[TAB_ID] = info;

  if (parent.communicate) {
    parent.communicate({
      type: "window",
      tab: info,
    });
  }
}

setInterval(broadcastWindowInfo, 100);

window.addEventListener("resize", broadcastWindowInfo);
window.addEventListener("move", broadcastWindowInfo);

/***********************
 * ACROSS TABS CALLBACKS
 ***********************/
function onReady() {}

function onInitialize() {}

function onParentDisconnect() {}

function onParentCommunication(data) {
  if (!data) return;

  if (data.type === "window") {
    tabs[data.tab.id] = data.tab;
  }

  if (data.type === "ball") {
    ball = data.ball;
  }
}

/***********************
 * BALL (GLOBAL COORDINATES)
 ***********************/
ball = new Ball(
  window.screenX + window.innerWidth / 2,
  window.screenY + window.innerHeight / 2,
  (Math.random() - 0.5) * 12,
  (Math.random() - 0.5) * 12,
  20,
);

/***********************
 * WORLD BOUNDARY
 ***********************/
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

  return {
    left,
    right,
    top,
    bottom,
  };
}

/***********************
 * CHECK IF INSIDE WINDOW
 ***********************/
function isBallVisible() {
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

/***********************
 * GAME LOOP
 ***********************/
function loop() {
  tabs[TAB_ID] = getMyTab();

  ball.update();
  ball.draw();

  requestAnimationFrame(loop);
}

broadcastWindowInfo();
loop();
