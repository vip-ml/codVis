// --- Three.js Visualization Setup ---
function setupThreeJS() {
    const container = document.getElementById('d3-3d-chart');
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    // Points geometry
    let pointsGeometry = new THREE.BufferGeometry();
    let pointsMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
    let pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointCloud);

    // Selection sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const selectionSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(selectionSphere);
    
    // Axes Helper
    const axesHelper = new THREE.AxesHelper( 4 );
    scene.add( axesHelper );

    camera.position.z = 7;
    camera.position.y = 2;
    camera.lookAt(0,0,0);

    // Handle mouse controls for rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    const onMouseDown = (e) => { isDragging = true; };
    const onMouseUp = (e) => { isDragging = false; };
    const onMouseMove = (e) => {
        if (!isDragging) return;
        const deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
        };

        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                (deltaMove.y * Math.PI / 180),
                (deltaMove.x * Math.PI / 180),
                0,
                'XYZ'
            ));
        
        pointCloud.quaternion.multiplyQuaternions(deltaRotationQuaternion, pointCloud.quaternion);
        selectionSphere.quaternion.multiplyQuaternions(deltaRotationQuaternion, selectionSphere.quaternion);
        axesHelper.quaternion.multiplyQuaternions(deltaRotationQuaternion, axesHelper.quaternion);

        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    };
    
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);

    // Resize handler
    const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
    
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();

    return (radius) => {
        const positions = [];
        const colors = [];
        const colorInside = new THREE.Color(0x3b82f6);
        const colorOutside = new THREE.Color(0x9ca3af);

        data.forEach(p => {
            positions.push(p[0], p[1], p[2]);
            const distSq = p[0]*p[0] + p[1]*p[1] + p[2]*p[2];
            if (distSq <= radius * radius) {
                colors.push(colorInside.r, colorInside.g, colorInside.b);
            } else {
                colors.push(colorOutside.r, colorOutside.g, colorOutside.b);
            }
        });

        pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        pointsGeometry.attributes.position.needsUpdate = true;
        pointsGeometry.attributes.color.needsUpdate = true;
        
        selectionSphere.scale.set(radius, radius, radius);
    };
}
