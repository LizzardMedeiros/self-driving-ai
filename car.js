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
      const rayAngle = lerp(
        this.raySpread / 2,
        -this.raySpread / 2,
        i / Math.max(this.rayCount - 1, 0.5),
      ) + this.car.angle;
      const cx = this.car.centerX - this.car.width / 2;

      const start = { x: cx, y: this.car.centerY };
      const end = {
        x: cx - Math.sin(rayAngle) * this.rayLength,
        y: this.car.centerY - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end, i]);
    }
  }

  #getReading (ray, borderList) {
    let touchList = [];

    for (const border of borderList) {
      if (!border) continue;
      const touch = getIntersection(ray, border);
      // console.log(touch)
      touch && touchList.push(touch);
    }

    if (touchList.length === 0) return null;
    const [minOffset] = touchList.sort((a, b) => a.offset - b.offset);
    return minOffset;
  }

  update (...borderList) {
    this.#castRays();
    this.readingList = [];
    for (let i=0; i < this.rays.length; i++) {
      for (const border of borderList) {
        const reading = this.#getReading(this.rays[i], border);
        if (!this.readingList[i]) this.readingList[i] = reading;
      }
    }
  }

  draw (ctx) {
    for (const ray of this.rays) {
      const [start, end, index] = ray;
      const { x: startX, y: startY } = start;
      const { x: endX, y: endY } = end;
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
    this.keyList = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'];
    this.ai = null;

    switch (type) {
      case 'PLAYER':
        this.#addKeyboardEventListeners();
        break;
      case 'AI':
        // some code
        break;
      default:
        this.forward = true;
        break;
    }
  }

  #move (key, action) {
    switch (key) {
      case 'ArrowUp':
        this.forward = action;
        break;
      case 'ArrowLeft':
        this.left = action;
        break;
      case 'ArrowRight':
        this.right = action;
        break;
      case 'ArrowDown':
        this.reverse = action;
        break;
    }
  }

  refreshAi () {
    if (!Array.isArray(this.ai)) return;
    for (const i in this.ai) {
      const action = this.ai[i] === 1;
      this.#move(this.keyList[i], action);
    }

  }

  #addKeyboardEventListeners () {
    const keyEvent = (ev) => {
      const action = ev.type === 'keydown';
      this.#move(ev.key, action);
    };

    document.onkeydown = keyEvent;
    document.onkeyup = keyEvent;
  }
}

class Car {
  constructor (controllType, x, y, width, height, maxSpeed, color) {
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
    this.color = color || 'black';
    this.showSensor = false;

    this.controls = new Controls(controllType);

    if (controllType === 'AI') {
      this.sensor = new Sensor(this);
      // inputs, middle, outputs
      this.brain = new RNA([this.sensor.rayCount, 6, this.controls.keyList.length]);
    }
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

    return listToCoords([
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
    ]);
  }

  #collideWith (...polygonList) {
    for (const polygon of polygonList) {
      const testCollision = polysIntersect(this.collisionShape, polygon);
      if (testCollision) return true;
    }
    return false;
  }

  update (...obstacleList) {
    if (this.damaged) return;
    if (this.sensor) {
      this.sensor.update(...obstacleList);
      const offsetList = this.sensor.readingList.map((r) => {
        if (!r) return 0;
        return 1 - r.offset;
      });
      
      const outputList = RNA.feedForward(offsetList, this.brain);
      this.controls.ai = outputList;
      this.controls.refreshAi();
    }

    this.damaged = this.#collideWith(...obstacleList);
    this.collisionShape = this.#createCollisionShape();
    this.#move();
  };

  draw (ctx) {
    const [firstRect, ...otherRects] = this.collisionShape;
    if (!firstRect) return;

    const [p1, p2] = firstRect;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    ctx.beginPath();
    for (const rect of otherRects) {
      const [p1, p2] = rect;
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }

    ctx.fillStyle = this.damaged ? 'grey' : this.color;
    ctx.fill();
    if (this.sensor && this.showSensor) this.sensor.draw(ctx);
  }
}
