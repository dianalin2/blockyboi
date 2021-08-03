import * as THREE from "three";
import { Game } from "./Game";
import { VoxelWorld } from "./VoxelWorld";

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

const game = new Game({ x: 16, y: 32, z: 16 });
const world = new VoxelWorld(game);
const geometry = new THREE.BufferGeometry();
const material = new THREE.MeshLambertMaterial({ color: 0x373F51 });
const mesh = new THREE.Mesh(geometry, material);

// const material = new THREE.LineBasicMaterial({ color: 0x373F51, linewidth: 2 });
// const mesh = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material);

scene.add(mesh);

const updateGame = () => {
  const { positions, normals, indices } = world.generateGeometryData();

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), 3)
  );
  geometry.setIndex(indices);
}

const updatePos = () => {
  for (const k of keysDown) {
    if (k.isDown) {
      switch (k.key) {
        case 'w':
          camera.translateOnAxis(new THREE.Vector3(0, 0, 1), -0.1);
          break;
        case 'a':
          camera.translateOnAxis(new THREE.Vector3(1, 0, 0), -0.1);
          break;
        case 's':
          camera.translateOnAxis(new THREE.Vector3(0, 0, 1), 0.1);
          break;
        case 'd':
          camera.translateOnAxis(new THREE.Vector3(1, 0, 0), 0.1);
          break;
        case 'q':
          camera.position.y += 0.1;
          break;
        case 'e':
          camera.position.y -= 0.1;
          break;
      }
    }
  }
}


function addLight(x: number, y: number, z: number) {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(x, y, z);
  scene.add(light);
}
addLight(-1,  2,  4);
addLight( 1, -1, -2);

let currRot = 0;
const animate = () => {
  requestAnimationFrame(animate);
  currRot += 0.01;
  updatePos();
  updateGame();
  render();
};

camera.position.z = 5;

const keysDown = [
  {
    key: 'w',
    isDown: false
  },
  {
    key: 'a',
    isDown: false
  },
  {
    key: 's',
    isDown: false
  },
  {
    key: 'd',
    isDown: false
  },
  {
    key: 'q',
    isDown: false
  },
  {
    key: 'e',
    isDown: false
  },

]

document.onkeydown = (e) => {
  const k = keysDown.filter(v => e.key == v.key)[0];
  if (k)
    k.isDown = true;
}

document.onkeyup = (e) => {
  const k = keysDown.filter(v => e.key == v.key)[0];
  if (k)
    k.isDown = false;
}

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