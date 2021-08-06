import * as THREE from "three";
import { Game } from "./Game";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA9BCD0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
camera.updateProjectionMatrix();
document.body.appendChild(renderer.domElement);

// Resize canvas on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

function render() {
  renderer.render(scene, camera);
}

import data from './BlockData.json';
import { Block } from "./Block";
Block.loadBlockDataFromJSON(data);

const game = new Game({ x: 7, y: 12, z: 7 }, scene);

function addLight(x: number, y: number, z: number) {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(x, y, z);
  scene.add(light);
}
addLight(-1,  2,  4);
addLight( 1, -1, -2);

const animate = () => {
  requestAnimationFrame(animate);
  // updatePos();
  game.render();
  render();
};

camera.position.set(-5.165, 19.47, 10.905);
camera.rotation.set(-0.843, -0.5, -0.5);

let mouseIsDown = false;

document.onmouseup = e => mouseIsDown = false;
document.onmousedown = e => mouseIsDown = true;

(() => {
  let lastMousePos = [-1, -1];
  document.onmousemove = (e) => {
    if (lastMousePos[0] == -1 || !mouseIsDown || Math.abs(lastMousePos[0] - e.offsetX) > 300 || Math.abs(lastMousePos[1] - e.offsetY) > 300) {
      lastMousePos[0] = e.offsetX;
      lastMousePos[1] = e.offsetY;
      return;
    }

    const deltaX = e.offsetX - lastMousePos[0];
    const deltaY = e.offsetY - lastMousePos[1];

    camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), deltaX * 3.14 / 180 / 10);
    camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), deltaY * 3.14 / 180 / 10);

    lastMousePos[0] = e.offsetX;
    lastMousePos[1] = e.offsetY;
  }
})()

animate();
