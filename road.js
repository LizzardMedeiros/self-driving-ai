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

    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };

    this.borderList = [
      [topLeft, bottomLeft], 
      [topRight, bottomRight],
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
      const x = learp(this.left, this.right, i / this.laneCount);

      ctx.setLineDash([20, 20]);

      ctx.beginPath();
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    this.borderList.forEach((border) => {
      const [coord1, coord2] = border;
      ctx.beginPath();
      ctx.moveTo(coord1.x, coord1.y);
      ctx.lineTo(coord2.x, coord2.y);
      ctx.stroke();
    });
  }
}