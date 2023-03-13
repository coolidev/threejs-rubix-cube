import * as THREE from "three";
import helvetikerRegular from "./helvetiker_regular.typeface.json";

const SIDE_FILTER = {
  UP: (node) => node.positionY() > 10,
  DOWN: (node) => node.positionY() < -10,
  LEFT: (node) => node.positionZ() > 10,
  RIGHT: (node) => node.positionZ() < -10,
  FRONT: (node) => node.positionX() > 10,
  BACK: (node) => node.positionX() < -10
};

const DIRECTION = {
  UP: [0, 1, 0],
  DOWN: [0, -1, 0],
  LEFT: [0, 0, 1],
  RIGHT: [0, 0, -1],
  FRONT: [1, 0, 0],
  BACK: [-1, 0, 0]
};

const UP = "UP";
const DOWN = "DOWN";
const LEFT = "LEFT";
const RIGHT = "RIGHT";
const FRONT = "FRONT";
const BACK = "BACK";

const WHITE = "WHITE";
const YELLOW = "YELLOW";
const ORANGE = "ORANGE";
const RED = "RED";
const GREEN = "GREEN";
const BLUE = "BLUE";

const FACE_COLORS = {
  UP: YELLOW,
  DOWN: WHITE,
  LEFT: GREEN,
  RIGHT: BLUE,
  FRONT: ORANGE,
  BACK: RED
};

const faces = [
  { direction: UP, color: YELLOW },
  { direction: DOWN, color: WHITE },
  { direction: LEFT, color: GREEN },
  { direction: RIGHT, color: BLUE },
  { direction: FRONT, color: RED },
  { direction: BACK, color: ORANGE }
];

const MATERIAL = {
  WHITE: new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true
  }),
  YELLOW: new THREE.MeshPhongMaterial({
    color: 0xffff00,
    flatShading: true
  }),
  ORANGE: new THREE.MeshPhongMaterial({
    color: 0xffa500,
    flatShading: true
  }),
  RED: new THREE.MeshPhongMaterial({
    color: 0xff0000,
    flatShading: true
  }),
  GREEN: new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    flatShading: true
  }),
  BLUE: new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    flatShading: true
  })
};

const backside = new THREE.MeshPhongMaterial({
  color: 0x333333,
  flatShading: true
});

const ROTATION = {
  UP: [0, 0, Math.PI / 2],
  DOWN: [0, 0, Math.PI / -2],
  LEFT: [0, Math.PI / -2, 0],
  RIGHT: [0, Math.PI / 2, 0],
  FRONT: [0, 0, 0],
  BACK: [0, Math.PI, 0]
};

export function createCube(camera) {
  const nodes = [];

  for (var x = -1; x <= 1; ++x) {
    for (var y = -1; y <= 1; ++y) {
      for (var z = -1; z <= 1; ++z) {
        if (x == 0 && y == 0 && z == 0) continue;

        const node = { position: [x, y, z], faces: [] };

        nodes.push(node);

        const facesToApply = faces.filter(({ direction }) => {
          const matchX = DIRECTION[direction][0] == x && x != 0;
          const matchY = DIRECTION[direction][1] == y && y != 0;
          const matchZ = DIRECTION[direction][2] == z && z != 0;

          return matchX || matchY || matchZ;
        });

        facesToApply.forEach(({ direction }) => {
          node.faces.push(direction);
        });
      }
    }
  }

  const root = new THREE.Object3D();
  const geometry = new THREE.Geometry();

  geometry.vertices.push(
    new THREE.Vector3(0, 10, 10),
    new THREE.Vector3(0, -10, 10),
    new THREE.Vector3(0, -10, -10),
    new THREE.Vector3(0, 10, -10)
  );

  geometry.faces.push(new THREE.Face3(0, 1, 2));
  geometry.faces.push(new THREE.Face3(2, 3, 0));

  geometry.computeBoundingSphere();

  const separation = 3;

  nodes.forEach((node) => {
    node.base = new THREE.Object3D();
    node.three = new THREE.Object3D();

    node.positionX = () =>
      node.three.localToWorld(new THREE.Vector3(0, 0, 0)).x;
    node.positionY = () =>
      node.three.localToWorld(new THREE.Vector3(0, 0, 0)).y;
    node.positionZ = () =>
      node.three.localToWorld(new THREE.Vector3(0, 0, 0)).z;

    node.rotate = (vector, rotation) => {
      node.base.rotateOnAxis(new THREE.Vector3(...vector), rotation);
    };
    node.base.add(node.three);
    root.add(node.base);

    const position = node.position;
    node.three.position.x = position[0] * (20 + separation);
    node.three.position.y = position[1] * (20 + separation);
    node.three.position.z = position[2] * (20 + separation);

    node.faces.forEach((direction) => {
      const three = new THREE.Object3D();
      node.three.add(three);

      const front = new THREE.Mesh(geometry, MATERIAL[FACE_COLORS[direction]]);
      const back = new THREE.Mesh(geometry, backside);

      back.rotation.y = Math.PI;

      front.position.x = 10 + separation / 2;
      back.position.x = 10 + separation / 2;

      const face = new THREE.Object3D();

      face.add(front);
      face.add(back);

      face.rotation.x = ROTATION[direction][0];
      face.rotation.y = ROTATION[direction][1];
      face.rotation.z = ROTATION[direction][2];

      three.add(face);
    });
  });

  const frontText = new THREE.Object3D();
  (() => {
    root.add(frontText);
    const font = new THREE.Font(helvetikerRegular);
    const size = 16;
    const height = 1;
    var geometry = new THREE.TextGeometry(FRONT, { font, size, height });
    var mesh = new THREE.Mesh(geometry, MATERIAL[RED]);
    mesh.rotation.set(0, Math.PI / 2, 0);
    geometry.computeBoundingBox();
    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    mesh.position.set(35, -55, width / 2);

    frontText.add(mesh);
  })();

  const animation = {
    moves: [],
    nodes: [],
    move: [],
    time: 0
  };

  return {
    up: () => move(UP, false),
    down: () => move(DOWN, false),
    left: () => move(LEFT, false),
    right: () => move(RIGHT, false),
    front: () => move(FRONT, false),
    back: () => move(BACK, false),
    upPrime: () => move(UP, true),
    downPrime: () => move(DOWN, true),
    leftPrime: () => move(LEFT, true),
    rightPrime: () => move(RIGHT, true),
    frontPrime: () => move(FRONT, true),
    backPrime: () => move(BACK, true),
    rightTrigger: () => {
      move(RIGHT, false);
      move(UP, false);
      move(RIGHT, true);
    },
    leftTrigger: () => {
      move(LEFT, true);
      move(UP, true);
      move(LEFT, false);
    },
    scramble,
    three: root,
    update
  };

  function move(direction, prime) {
    animation.moves.push([orientMove(direction), prime]);
  }

  function orientMove(move) {
    const frontFace = calculateFrontFace();
    switch (move) {
      case FRONT: {
        switch (frontFace) {
          case FRONT:
            return FRONT;
            break;
          case BACK:
            return BACK;
            break;
          case RIGHT:
            return RIGHT;
            break;
          case LEFT:
            return LEFT;
            break;
        }
        break;
      }
      case BACK: {
        switch (frontFace) {
          case FRONT:
            return BACK;
            break;
          case BACK:
            return FRONT;
            break;
          case RIGHT:
            return LEFT;
            break;
          case LEFT:
            return RIGHT;
            break;
        }
        break;
      }
      case RIGHT: {
        switch (frontFace) {
          case FRONT:
            return RIGHT;
            break;
          case BACK:
            return LEFT;
            break;
          case RIGHT:
            return BACK;
            break;
          case LEFT:
            return FRONT;
            break;
        }
        break;
      }
      case LEFT: {
        switch (frontFace) {
          case FRONT:
            return LEFT;
            break;
          case BACK:
            return RIGHT;
            break;
          case RIGHT:
            return FRONT;
            break;
          case LEFT:
            return BACK;
            break;
        }
        break;
      }
    }
    return move;
  }

  function calculateFrontFace() {
    const position = new THREE.Vector3();
    position.copy(camera.position);
    position.y = 0;
    position.normalize();
    const angle = (Math.atan2(position.x, position.z) / Math.PI) * 180;

    if (angle > 45 && angle < 135) {
      return FRONT;
    } else if (angle > 135 || angle < -135) {
      return RIGHT;
    } else if (angle > -135 && angle < -45) {
      return BACK;
    } else if (angle > -45 && angle < 45) {
      return LEFT;
    }
  }

  function scramble() {
    const moves = [UP, DOWN, LEFT, RIGHT, FRONT, BACK];

    for (var i = 0; i <= 100; ++i) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      const prime = Math.random() < 0.5;
      animation.moves.push([move, prime]);
    }
  }

  function update() {
    const frontFace = calculateFrontFace();

    if (frontFace == FRONT) {
      frontText.rotation.set(0, 0, 0);
    } else if (frontFace == RIGHT) {
      frontText.rotation.set(0, Math.PI * 0.5, 0);
    } else if (frontFace == BACK) {
      frontText.rotation.set(0, Math.PI, 0);
    } else if (frontFace == LEFT) {
      frontText.rotation.set(0, Math.PI * 1.5, 0);
    }

    if (
      animation.move.length == 0 &&
      animation.moves.length != 0 &&
      animation.time == 0
    ) {
      animation.move = animation.moves.shift();
    }

    if (animation.move.length != 0) {
      const move = animation.move;
      rotate(move[0], move[1], animation.time);
      animation.time += 1;
      if (animation.time >= 10) {
        animation.time = 0;
        animation.move.length = 0;
      }
    }
  }

  function rotate(direction, prime = false, time = 1) {
    const rotation = (prime ? Math.PI / 2 : Math.PI / -2) * 0.1;
    nodes.filter(SIDE_FILTER[direction]).forEach((node) => {
      node.base.rotateOnWorldAxis(
        new THREE.Vector3(...DIRECTION[direction]),
        rotation
      );
    });
  }
}
