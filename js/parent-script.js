/**********************************************************
 * Multi-Window Bouncing Ball (Parent Tab)
 **********************************************************/

/***********************
 * TAB DATA
 ***********************/
const tabs = {};
let currentActiveTabId = null;
let ball = null;
let TAB_ID = "parent-" + Math.random().toString(36).slice(2, 11);

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

  return { left, right, top, bottom };
}

/***********************
 * INITIALIZE BALL IMMEDIATELY (parent always owns the ball)
 ***********************/
// Ensure canvas is initialized
initCanvas();
ball = new Ball(
  window.screenX + window.innerWidth / 2,
  window.screenY + window.innerHeight / 2,
  (Math.random() - 0.5) * 12,
  (Math.random() - 0.5) * 12,
  20
);

/***********************
 * ACROSS TABS SETUP
 ***********************/
// AcrossTabs is loaded as a global via UMD bundle
const AcrossTabsParent = AcrossTabs.default ? AcrossTabs.default.Parent : AcrossTabs.Parent;
const parent = new AcrossTabsParent({
  onReady: () => {
    console.log("Parent ready, tabId:", TAB_ID);
  },
  onChildCommunication: (message, tabInfo) => {
    if (message.type === "TAB_ACTIVE") {
      currentActiveTabId = message.tabId;
      parent.broadCastAll({
        type: "ACTIVE_TAB_CHANGED",
        activeTabId: currentActiveTabId,
      });
    }
    if (message.type === "window") {
      // Store window info from child
      tabs[message.tab.id] = message.tab;
    }
  },
});

createTabButton = document.getElementById("createTabButton");
createTabButton.addEventListener("click", () => {
  parent.openNewTab({ url: "pages/child.html" });
});

/***********************
 * GAME LOOP
 ***********************/
function loop() {
  if (!ball) {
    requestAnimationFrame(loop);
    return;
  }

  tabs[TAB_ID] = getMyTab();

  ball.update(getWorldBounds());
  ball.checkVisibility();
  ball.draw();

  // Broadcast ball state to other tabs
  parent.communicate({
    type: "ball",
    ball: { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, radius: ball.radius },
  });

  requestAnimationFrame(loop);
}

broadcastWindowInfo();
loop();