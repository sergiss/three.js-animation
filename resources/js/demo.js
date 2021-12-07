import * as THREE from "../libs/three.module.js";
import Animation from "../../animation.js";

var camera, scene, renderer;
var animation, mesh;
var clock;

function init() {

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x2d89ef, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 1;
  
  scene = new THREE.Scene();

  var light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  const texture = new THREE.TextureLoader().load(
    "resources/images/spritesheet_grant.png"
  );

  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  const material = new THREE.MeshPhongMaterial({
    map: texture,
    alphaTest: 0.7,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.BufferGeometry();

  const positions = [ -0.5, 0.5, 0, 
                       0.5, 0.5, 0, 
                      -0.5,-0.5, 0, 
                       0.5,-0.5, 0];

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2));

  geometry.setIndex([0, 2, 1, 2, 3, 1]);
  geometry.computeVertexNormals();

  mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  animation = new Animation(mesh.geometry, 12, 6)
    .create("run", 0, 25, 0.025)
    .create("jump", 30, 63, 0.020)
    .play("run");


  clock = new THREE.Clock();
  window.addEventListener("resize", onWindowResize, false);
  document.body.addEventListener('click', ()=> {
      animation.play("jump", ()=> {
        animation.play("run");
      });
  }, true);

}

let time = 0;

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  time += delta;

  mesh.rotation.y = Math.sin(time) * 0.75;

  animation.update(delta);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("DOMContentLoaded", function (e) {
  init();
  animate();
});