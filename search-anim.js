const container = document.getElementById('search-canvas');
if (!container) { document.write('ERROR: #search-canvas not found'); }
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);
camera.position.z = 20;

// --- 5000 stars ---
const starsGeo = new THREE.BufferGeometry();
const starsCount = 5000;
const pos = new Float32Array(starsCount * 3);
const colors = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 180;
    pos[i+1] = (Math.random() - 0.5) * 120;
    pos[i+2] = (Math.random() - 0.5) * 80 - 10;
    const c = new THREE.Color().setHSL(0.75 + Math.random() * 0.15, 0.8, 0.3 + Math.random() * 0.4);
    colors[i] = c.r; colors[i+1] = c.g; colors[i+2] = c.b;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
starsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({
    size: 0.08, vertexColors: true, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(stars);

// --- Big wireframe ring ---
const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3, 0.08, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.25 })
);
ring.position.set(10, 1, -8);
ring.rotation.x = Math.PI / 3;
ring.rotation.z = 0.5;
scene.add(ring);

// --- Inner ring ---
const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.05, 12, 48),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.2 })
);
ring2.position.set(10, 1, -8);
ring2.rotation.x = Math.PI / 2;
ring2.rotation.z = 0.8;
scene.add(ring2);

// --- Icosahedron (top left) ---
const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.6, 1),
    new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.2 })
);
ico.position.set(-9, 5, -9);
scene.add(ico);

// --- Inner icosahedron ---
const ico2 = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 0),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.15 })
);
ico2.position.set(-9, 5, -9);
scene.add(ico2);

// --- Octahedron (bottom left) ---
const oct = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.2),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.15 })
);
oct.position.set(-8, -5.5, -10);
scene.add(oct);

// --- Dodecahedron (bottom right) ---
const dod = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.8),
    new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.15 })
);
dod.position.set(8, -5.5, -10);
scene.add(dod);

// --- 50 floating cubes ---
const smallCubes = [];
for (let i = 0; i < 50; i++) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.06, 0.06),
        new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.6 })
    );
    cube.position.set(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 14 - 2
    );
    cube.material.color.setHSL(0.75 + Math.random() * 0.15, 0.8, 0.5);
    cube.userData = { speed: 0.2 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2 };
    scene.add(cube);
    smallCubes.push(cube);
}

// Mouse parallax
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

// Animation
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0003;
    stars.rotation.y += 0.0002;
    ring.rotation.z += 0.003;
    ring2.rotation.x += 0.002;
    ring2.rotation.z += 0.003;
    ico.rotation.x += 0.002;
    ico.rotation.y += 0.004;
    ico2.rotation.x += 0.003;
    ico2.rotation.y += 0.005;
    oct.rotation.x += 0.003;
    oct.rotation.z += 0.002;
    dod.rotation.y += 0.003;
    dod.rotation.x += 0.002;
    smallCubes.forEach(c => {
        c.position.y += Math.sin(time * c.userData.speed + c.userData.offset) * 0.003;
        c.rotation.x += 0.01;
        c.rotation.y += 0.015;
    });
    const px = mouseX * 0.8;
    const py = mouseY * 0.6;
    ico.position.x = -9 + px * 0.8;
    ico.position.y = 5 + py * 0.8;
    ico2.position.x = -9 + px * 0.8;
    ico2.position.y = 5 + py * 0.8;
    ring.position.x = 10 + px * 0.7;
    ring.position.y = 1 + py * 0.5;
    ring2.position.x = 10 + px * 0.7;
    ring2.position.y = 1 + py * 0.5;
    oct.position.x = -8 + px * 0.5;
    oct.position.y = -5.5 + py * 0.5;
    dod.position.x = 8 + px * 0.5;
    dod.position.y = -5.5 + py * 0.5;
    renderer.render(scene, camera);
}
animate();