const screen = document.getElementById('canvas');
const visualizer = document.getElementById('console');

const screenCtx = screen.getContext('2d');
const visualizerCtx = visualizer.getContext('2d');

let bestCar;
const road = new Road(screen);

/*const traffic = new Array(3).fill({}).map((_, i) => {
  const lane = i % 3;
  const yy = lane % 2 !== 0 ? -150 : -250;
  return new Car('DUMMY', road.getLaneCenter(lane), yy, 30, 50, 2, 'blue')
});*/

const traffic = [
  new Car('DUMMY', road.getLaneCenter(0), -150, 30, 50, 2, 'blue'),
  new Car('DUMMY', road.getLaneCenter(1), -300, 30, 50, 2, 'blue'),
  new Car('DUMMY', road.getLaneCenter(2), -150, 30, 50, 2, 'blue'),

  new Car('DUMMY', road.getLaneCenter(0), -650, 30, 50, 2, 'blue'),
  new Car('DUMMY', road.getLaneCenter(1), -500, 30, 50, 2, 'blue'),
  new Car('DUMMY', road.getLaneCenter(2), -650, 30, 50, 2, 'blue'),
];

const carList = new Array(10).fill({}).map((_, i) => {
  const xx = road.getLaneCenter(1);
  const car = new Car('AI', xx, 0, 30, 50);
  car.brain.loadRNA();
  if (i > 0) car.brain.mutate(0.3);
  return car;
});

function saveBest() {
  if (!bestCar) return;
  bestCar.brain.saveRNA();
  window.alert('Brain saved');
}

function clearSaves() {
  RNA.removeRNA();
  window.alert('Saves cleared');
}

function animate() {
  bestCar = carList.sort((a, b) => a.centerY - b.centerY)[0];

  for (const dummyCar of traffic) dummyCar.update();
  for (const car of carList) {
    const shapeList = traffic.map((dummyCar) => dummyCar.collisionShape);
    car.showSensor = false;
    car.update(...road.borderList, ...shapeList);
  }

  bestCar.showSensor = true;
  screen.height = window.innerHeight;
  visualizer.height = window.innerHeight;

  screenCtx.save();
  screenCtx.translate(0, -bestCar.centerY + screen.height * 0.7);

  road.draw(screenCtx);

  for (const dummyCar of traffic) dummyCar.draw(screenCtx);
  for (const car of carList) car.draw(screenCtx);

  screenCtx.restore();
  Visualizer.drawNetwork(visualizerCtx, bestCar.brain);
  requestAnimationFrame(animate);
}

animate();