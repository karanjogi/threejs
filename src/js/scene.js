// Canvas
const canvas = document.querySelector('canvas.scene');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("grey")


// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.lookAt(0, 0, 0,)
light.position.set(0,2,20);

// scene.add(light);

// Sizes
const sizes = {
    width: window.innerWidth * 0.6,
    height: window.innerHeight * 0.6
};

window.addEventListener('resize', () =>
{
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});


// Camera setup
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(15, 5, 10);
camera.lookAt(0,0,0);
camera.add(light)
scene.add(camera);



//  Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
// sets up the background color
renderer.setClearColor(0x000000);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls( camera, renderer.domElement );
// controls.enableDamping = true;
controls.dampingFactor = 0.5; 
controls.rotateSpeed = 0.5; 


// controls.minPolarAngle = Math.PI/2;
// controls.maxPolarAngle = Math.PI/2;
controls.update();

// Animate
const animate = () =>
{
    // requestAnimationFrame( animate );
    controls.update();
    renderer.render(scene, camera);
//     console.log(controls.getAzimuthalAngle())
// console.log(controls.getPolarAngle())
    // Call animate for each frame
    window.requestAnimationFrame(animate);
};
// 0.015074140275815561
//  3.141591653589793
animate();
