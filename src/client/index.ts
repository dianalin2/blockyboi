import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerHeight / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
document.body.appendChild(renderer.domElement);

// Resize canvas on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
});

function render() {
    renderer.render(scene, camera);
}

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);

camera.position.z = 5;

scene.add(cube);
let currRot = 0;
const animate = () => {
    requestAnimationFrame(animate);
    currRot += 0.01;
    cube.rotation.x = currRot;
    cube.rotation.y = currRot * 2;
    cube.rotation.z = currRot / 2;
    render();
};

animate();