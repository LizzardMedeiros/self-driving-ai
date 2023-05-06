function learp (a, b, t) {
  return a + (b-a) * t;
}

function getIntersection(line1, line2) {
  const [coord1, coord2] = line1;
  const [coord3, coord4] = line2;

  const [x1, y1] = coord1;
  const [x2, y2] = coord2;
  const [x3, y3] = coord3;
  const [x4, y4] = coord4;

  const tTop = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const uTop = (y3 - y1) * (x1 - x2) - (x3 - x1) * (x1 - y2);
  const bottom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  if (bottom !== 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;

    if (t >= 0 && t <= 1 && u >=0 && u <= 1) return {
      x: learp(x1, x2, t),
      y: learp(y1, y2, t),
      offset: t,
    }
  }

  return null;
}

function polysIntersect(polygon1, polygon2) {
  const r = (acc, cur, i, arr) => {
    const ind = arr[i+1] ? i : 0;
    return [...acc, [[cur.x, cur.y], [arr[ind+1].x, arr[ind+1].y]]];
  };

  polygon1 = polygon1.reduce(r, []);
  polygon2 = polygon2.reduce(r, []);

  for (const line1 of polygon1) {
    for (const line2 of polygon2) if (getIntersection(line1, line2)) return true;
  }

  return false;
}
