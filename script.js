const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const road = new Road(canvas);

const xx = road.getLaneCenter(1);
const player = new Car('PLAYER', xx, 0, 30, 50);
/*const traffic = new Array(0).fill({}).map(() => {
  return new Car('DUMMY', road.getLaneCenter(0), -150, 30, 50, 2)
});*/

function animate() {
  //for (const car of traffic) car.update(road.borderList);
  player.update(road.borderList);

  canvas.height = window.innerHeight;

  ctx.save();
  ctx.translate(0, -player.centerY + canvas.height * 0.7);

  road.draw(ctx);
  player.draw(ctx);
  //for (const car of traffic) car.draw(ctx);

  ctx.restore();
  requestAnimationFrame(animate);
}

animate();