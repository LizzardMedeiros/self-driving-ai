function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function lerp (a, b, t) {
  return a + (b-a) * t;
}

function getIntersection(line1, line2) {
  const [coord1, coord2] = line1;
  const [coord3, coord4] = line2;

  const { x: x1, y: y1 } = coord1;
  const { x: x2, y: y2 } = coord2;
  const { x: x3, y: y3 } = coord3;
  const { x: x4, y: y4 } = coord4;

  const tTop = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const uTop = (y3 - y1) * (x1 - x2) - (x3 - x1) * (y1 - y2);
  const bottom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  if (bottom !== 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;

    if (t >= 0 && t <= 1 && u >=0 && u <= 1) {
        return {
          x: lerp(x1, x2, t),
          y: lerp(y1, y2, t),
          offset: t,
        }
    }
  }

  return null;
}

function listToCoords (pointList) {
  return pointList.reduce((acc, cur, i, arr) => {
    const next = (arr[i+1]) ? arr[i+1] : arr[0];
    return [...acc, [{ x: cur.x, y: cur.y }, { x: next.x, y: next.y }]];
  }, []);
}

function polysIntersect(polygon1, polygon2) {
  for (const line1 of polygon1) {
    for (const line2 of polygon2) if (getIntersection(line1, line2)) return true;
  }
  return false;
}
