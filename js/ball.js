// set up ball
class Ball {
  constructor(x, y, vx, vy, radius) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
  }

  /***********************
   * UPDATE
   ***********************/
  update() {
    this.x += this.vx;
    this.y += this.vy;

    const bounds = getWorldBounds();

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

    if (parent.communicate) {
      parent.communicate({
        type: "ball",
        ball: this,
      });
    }
  }

  /***********************
   * DRAW
   ***********************/
  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isBallVisible()) {
      return;
    }

    const localX = ball.x - window.screenX;
    const localY = ball.y - window.screenY;

    ctx.beginPath();
    ctx.arc(localX, localY, ball.radius, 0, Math.PI * 2);

    ctx.fillStyle = "red";
    ctx.fill();
  }

  setVisibility(isVisible) {
    if (isVisible) {
      // Show / Start rendering the 2D ball
      isBallVisible = true;
    } else {
      // Hide / Pause the 2D ball
      isBallVisible = false;
    }
  }
}
