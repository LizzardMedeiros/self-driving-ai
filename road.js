class Road {
  constructor ({ width }, laneCount = 3) {
    const INF = 1E7;

    this.width = width * .9;
    this.location = width / 2;
    this.laneCount = laneCount;

    this.right = this.location - this.width / 2;
    this.left = this.location + this.width / 2;
    this.top = -INF;
    this.bottom = INF;

    this.borderList = [
      listToCoords([
        { x: this.right, y: this.top },
        { x: this.right, y: this.bottom },
      ]),
      listToCoords([
        { x: this.left, y: this.top },
        { x: this.left, y: this.bottom },
      ]),
    ]
    
  };

  getLaneCenter (laneIndex) {
    const laneWidth = this.width / this.laneCount;
    return laneWidth + (laneIndex * laneWidth);
  }

  draw (ctx) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';

    for (let i = 1; i <= this.laneCount - 1; i += 1) {
      const x = lerp(this.left, this.right, i / this.laneCount);

      ctx.setLineDash([20, 20]);

      ctx.beginPath();
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    ctx.beginPath();
    for(const border of this.borderList) {
      for (const point of border) {
        const [p1, p2] = point;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
    }
    ctx.stroke();
  }
}