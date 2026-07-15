// Ball class - used by both parent and child tabs
let canvas = null;
let ctx = null;

function initCanvas() {
  console.log('initCanvas called');
  canvas = document.getElementById("gameCanvas");
  console.log('canvas found:', !!canvas);
  ctx = canvas ? canvas.getContext("2d") : null;
  console.log('ctx found:', !!ctx);
  
  if (!canvas) return;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

// Initialize canvas when DOM is ready
console.log('readyState:', document.readyState);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCanvas);
} else {
  // DOM already ready, but scripts may still be executing
  // Use setTimeout to ensure we run after full load
  setTimeout(initCanvas, 0);
}

class Ball {
  constructor(x, y, vx, vy, radius) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.isVisible = true;
  }

  /***********************
   * UPDATE - physics (called only by parent)
   ***********************/
  update(bounds) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x - this.radius <= bounds.left) {
      this.x = bounds.left + this.radius;
      this.vx *= -1;
    }

    if (this.x + this.radius >= bounds.right) {
      this.x = bounds.right - this.radius;
      this.vx *= -1;
    }

    if (this.y - this.radius <= bounds.top) {
      this.y = bounds.top + this.radius;
      this.vy *= -1;
    }

    if (this.y + this.radius >= bounds.bottom) {
      this.y = bounds.bottom - this.radius;
      this.vy *= -1;
    }
  }

  /***********************
   * DRAW - render to canvas
   ***********************/
  draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert global coordinates to local canvas coordinates
    const localX = this.x - window.screenX;
    const localY = this.y - window.screenY;

    ctx.beginPath();
    ctx.arc(localX, localY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  /***********************
   * CHECK VISIBILITY
   ***********************/
  checkVisibility() {
    const left = window.screenX;
    const right = left + window.innerWidth;
    const top = window.screenY;
    const bottom = top + window.innerHeight;

    this.isVisible = (
      this.x + this.radius >= left &&
      this.x - this.radius <= right &&
      this.y + this.radius >= top &&
      this.y - this.radius <= bottom
    );
  }

  /***********************
   * SET BALL DATA (for child tabs receiving updates)
   ***********************/
  setFromData(data) {
    this.x = data.x;
    this.y = data.y;
    this.vx = data.vx;
    this.vy = data.vy;
    this.radius = data.radius;
  }
}