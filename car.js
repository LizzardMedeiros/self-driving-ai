class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 5;
    this.rayLength = 200;
    this.raySpread = Math.PI / 2;

    this.rays = [];
    this.readingList = [];
  }

  #castRays () {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i += 1) {
      const rayAngle = learp(
        this.raySpread / 2,
        -this.raySpread / 2,
        i / Math.max(this.rayCount - 1, 0.5),
      ) + this.car.angle;
      const cx = this.car.centerX - this.car.width / 2;

      const start = [cx, this.car.centerY];
      const end = [
        cx - Math.sin(rayAngle) * this.rayLength,
        this.car.centerY - Math.cos(rayAngle) * this.rayLength,
      ];

      this.rays.push([start, end, i]);
    }
  }

  #getReading (ray, borderList) {
    let touchList = [];
    for (const border of borderList) {
      const touch = getIntersection(ray, border.map((b) => [b.x, b.y]));
      touch && touchList.push(touch);
    }

    if (touchList.length === 0) return;
    const [minOffset] = touchList.sort((a, b) => a.offset - b.offset);
    return minOffset;
  }

  update (borderList) {
    this.#castRays();
    this.readingList = [];

    for (const ray of this.rays) {
      const reading = this.#getReading(ray, borderList);
      this.readingList.push(reading);
    }
  }

  draw (ctx) {
    for (const ray of this.rays) {
      const [start, end, index] = ray;
      const [startX, startY] = start;
      const [endX, endY] = end;
      const reading = this.readingList[index];

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'yellow';

      ctx.moveTo(startX, startY);

      if (reading) {
        ctx.lineTo(reading.x, reading.y);
        ctx.stroke();
        // End of the line detector and start of the ray outcast
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.moveTo(reading.x, reading.y);
      }

      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
}

class Controls {
  constructor (type) {
    this.forward = false;
    this.reverse = false;
    this.left = false;
    this.right = false;

    switch (type) {
      case 'PLAYER':
        this.#addKeyboardEventListeners();
        break;
      default:
        this.forward = true;
        break;
    }
  }

  #addKeyboardEventListeners () {
    const keyEvent = (ev) => {
      const action = ev.type === 'keydown';
      switch (ev.key) {
        case 'ArrowLeft':
          this.left = action;
          break;
        case 'ArrowRight':
          this.right = action;
          break;
        case 'ArrowUp':
          this.forward = action;
          break;
        case 'ArrowDown':
          this.reverse = action;
          break;
      }
    };

    document.onkeydown = keyEvent;
    document.onkeyup = keyEvent;
  }
}

class Car {
  constructor (controllType, x, y, width, height, maxSpeed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.centerX = x - width / 2;
    this.centerY = y - height / 2;

    this.speed = 0;
    this.maxSpeed = maxSpeed || 3;
    this.acceleration = 0.2;
    this.friction = 0.05;
    this.angle = 0;
    this.damaged = false;
    this.collisionShape = [];

    if (controllType === 'PLAYER') this.sensor = new Sensor(this);
    this.controls = new Controls(controllType);
  }

  #move () {
    if (this.damaged) return;

    if (this.controls.forward && this.speed < this.maxSpeed) {
      this.speed += this.acceleration;
    } 
    else if (this.controls.reverse && this.speed > -this.maxSpeed / 2) {
      this.speed -= this.acceleration / 2;
    }
    else {
      Math.abs(this.speed) > 0.5 ? (
        this.speed +=  this.friction * -this.speed
      ) : this.speed = 0;
    }

    if (Math.abs(this.speed) > 0) {
      if (this.controls.right) this.angle += this.speed > 0 ? -0.03 : 0.03;
      else if (this.controls.left) this.angle += this.speed > 0 ? 0.03 : -0.03;
    }

    this.centerX -= Math.sin(this.angle) * this.speed;
    this.centerY -= Math.cos(this.angle) * this.speed;
  }

  #createCollisionShape () {
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    const xx = this.centerX - this.width / 2;

    return [
      {
        x: xx - Math.sin(this.angle - alpha) * rad,
        y: this.centerY - Math.cos(this.angle - alpha) * rad,
      },
      {
        x: xx - Math.sin(this.angle + alpha) * rad,
        y: this.centerY - Math.cos(this.angle + alpha) * rad,
      },
      {
        x: xx - Math.sin(Math.PI + this.angle - alpha) * rad,
        y: this.centerY - Math.cos(Math.PI + this.angle - alpha) * rad,
      },
      {
        x: xx - Math.sin(Math.PI + this.angle + alpha) * rad,
        y: this.centerY - Math.cos(Math.PI + this.angle + alpha) * rad,
      },
    ];
  }

  #collideWith (polygonList) {
    for (const polygon of polygonList) {
      if (polysIntersect(this.collisionShape, polygon)) return true;
    }
    return false;
  }

  update (...obstacleList) {
    this.collisionShape = this.#createCollisionShape();

    for (const obstacle of obstacleList) {
      if (!this.sensor) continue;
      this.sensor.update(obstacle);
      this.damaged = this.#collideWith(obstacle);
    }

    this.#move();
  };

  draw (ctx) {
    const [firstPoint] = this.collisionShape;
    if (!firstPoint) return;

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const point of this.collisionShape) ctx.lineTo(point.x, point.y);

    ctx.fillStyle = this.damaged ? 'grey' : 'black';
    ctx.fill();
    this.sensor && this.sensor.draw(ctx);
  }
}
