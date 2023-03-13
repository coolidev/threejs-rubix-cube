import * as THREE from "three";
import { createCube } from "./cube";

const OrbitControls = require("three-orbit-controls")(THREE);

createScene(setup(document.body)).animate();

function setup(target) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  target.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(200, 100, 50);
  camera.rotation.set(0, 25, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.2;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;

  window.addEventListener("resize", onWindowResize, false);

  const entities = [controls];

  return {
    animate,
    camera,
    controls,
    render,
    renderer,
    scene,
    entities
  };

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    entities.forEach((entity) => entity.update());
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }
}

function createScene(world) {
  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  world.scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-1, -1, -1);
  world.scene.add(light);

  light = new THREE.AmbientLight(0x222222);
  world.scene.add(light);

  const perimeter = createPerimeter();
  world.scene.add(perimeter);

  const cube = createCube(world.camera);
  world.scene.add(cube.three);

  world.entities.push(cube);

  document.addEventListener(
    "keyup",
    (event) => {
      if (event.ctrlKey && event.key === "x") cube.scramble();

      if (event.key === "w") cube.up();
      if (event.key === "W") cube.upPrime();
      if (event.key === "s") cube.down();
      if (event.key === "S") cube.downPrime();
      if (event.key === "d") cube.right();
      if (event.key === "D") cube.rightPrime();
      if (event.key === "a") cube.left();
      if (event.key === "A") cube.leftPrime();
      if (event.key === "q") cube.front();
      if (event.key === "Q") cube.frontPrime();
      if (event.key === "e") cube.back();
      if (event.key === "E") cube.backPrime();
      if (event.key === "z") cube.leftTrigger();
      if (event.key === "c") cube.rightTrigger();
    },
    false
  );

  return world;

  function createPerimeter() {
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    return line;
  }
}
