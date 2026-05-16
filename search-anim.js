const container = document.getElementById('search-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

camera.position.z = 18;

// Stars
const starsGeo = new THREE.BufferGeometry();
const starsCount = 3000;
const pos = new Float32Array(starsCount * 3);
const colors = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 140;
    pos[i+1] = (Math.random() - 0.5) * 100;
    pos[i+2] = (Math.random() - 0.5) * 60 - 10;
    const c = new THREE.Color().setHSL(0.75 + Math.random() * 0.15, 0.8, 0.3 + Math.random() * 0.4);
    colors[i] = c.r; colors[i+1] = c.g; colors[i+2] = c.b;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
starsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({
    size: 0.07, vertexColors: true, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(stars);

// Ring
const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.06, 12, 48),
    new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.15 })
);
ring.position.set(7, 2, -6);
ring.rotation.x = Math.PI / 3;
scene.add(ring);

// Small icosahedron
const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.12 })
);
ico.position.set(-6, -3, -7);
scene.add(ico);

// Small floating cubes
const cubes = [];
for (let i = 0; i < 25; i++) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.05, 0.05),
        new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.5 })
    );
    cube.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10 - 2);
    cube.material.color.setHSL(0.75 + Math.random() * 0.15, 0.8, 0.5);
    cube.userData = { speed: 0.2 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2 };
    scene.add(cube);
    cubes.push(cube);
}

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0003;
    stars.rotation.y += 0.00015;
    ring.rotation.z += 0.002;
    ring.rotation.x += 0.001;
    ico.rotation.x += 0.003;
    ico.rotation.y += 0.004;
    cubes.forEach(c => {
        c.position.y += Math.sin(time * c.userData.speed + c.userData.offset) * 0.002;
        c.rotation.x += 0.008;
        c.rotation.y += 0.01;
    });
    const px = mouseX * 0.5, py = mouseY * 0.4;
    ring.position.x = 7 + px * 0.5;
    ring.position.y = 2 + py * 0.4;
    ico.position.x = -6 + px * 0.4;
    ico.position.y = -3 + py * 0.4;
    renderer.render(scene, camera);
}
animate();