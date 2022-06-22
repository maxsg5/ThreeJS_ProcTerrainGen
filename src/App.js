/*
A basic Three.js app reuires 4 main things:
    * Scene - holds all objects, lights, camera etc
    * Objects - geometry
    * Camera - how we see the scene
    * Renderer - how everything is rendered
*/
import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

export default class App
{
    constructor()
    {
        this.stats = new Stats();
        this.gui = new dat.GUI();

        this.canvas = document.querySelector('.webgl');
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer(
            {
                canvas: this.canvas,
                antialias: true
            }
        );
    }
    initialize()
    {
        this.GRID_SIZE = 10;
        this.RESOLUTION = 128;
        this.COLOR_SCALE = 255;
        this.gui.add(this, 'GRID_SIZE', 1, 10).step(1).name('perlin size').onChange((value) => {
            this.GRID_SIZE = value;
            this.loadHeightmap();
            this.scene.remove(this.mesh);
            this.onStart();
        });
        this.scale = 1;
        this.triangles = 100;
        this.gui.add(this, 'scale', 1, 100).step(1).onChange((value) => {
            this.scale = value;
            this.scene.remove(this.mesh);
            this.onStart();
        });
        this.displacementScale = 0.1;
        this.gui.add(this, 'displacementScale', 0.1, 1).step(0.01).onChange((value) => {
            this.displacementScale = value;
            this.scene.remove(this.mesh);
            this.onStart();
        });
        this.gui.add(this, 'triangles', 10, 100).step(1).onChange((value) => {
            this.triangles = value;
            this.scene.remove(this.mesh);
            this.onStart();
        });
        this.wireframe = true;
        this.gui.add(this, 'wireframe').onChange((value) => {
            this.wireframe = value;
            this.scene.remove(this.mesh);
            this.onStart();
        });
        this.obj = { add:function(){
            perlin.seed();
            this.loadHeightmap();
            this.scene.remove(this.mesh);
            this.onStart();
        
        }};

        this.gui.add(this.obj,'add').name('new seed');

        //add a point light with a white color
        const light = new THREE.PointLight( 0x404040, 100, 100);
        light.position.set(0, 10, 10);
        this.scene.add(light);

        //setup our camera and move it back a bit
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene.add(this.camera);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.camera.translateZ(5.0);
        this.controls.update();
        
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        this.scene.add(this.camera);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor('black');
    }

    loadHeightmap()
    {
        //load canvas for drawing heightmap.
        let drawingCanvas = document.querySelector('.drawing')
        drawingCanvas.width = drawingCanvas.height = 512;
        let ctx = drawingCanvas.getContext('2d');

        //create heightmap using perlin noise
        //We need a two-dimensional grid. The size of this grid determines roughly how zoomed in our noise is going to be.
        let pixel_size = drawingCanvas.width / this.RESOLUTION;
        let num_pixels = this.GRID_SIZE / this.RESOLUTION;

        //loop through each pixel in the grid
        for (let y = 0; y < this.GRID_SIZE; y += num_pixels / this.GRID_SIZE){
            for (let x = 0; x < this.GRID_SIZE; x += num_pixels / this.GRID_SIZE){
                let v = parseInt(perlin.get(x, y) * this.COLOR_SCALE);
                ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
                ctx.fillRect(
                    x / this.GRID_SIZE * drawingCanvas.width,
                    y / this.GRID_SIZE * drawingCanvas.width,
                    pixel_size,
                    pixel_size
                );
            }
        }

        //create a texture from the canvas
        this.image = new Image();
        this.image.id = 'heightmap';
        this.image.src = drawingCanvas.toDataURL();

        //create a displacement map from the image
        this.disMap = new THREE.TextureLoader().load(
            this.image.src
        );
        this.disMap.wrapS = this.disMap.wrapT = THREE.RepeatWrapping;
        this.disMap.repeat.set(1, 1);
    }

    onStart()
    {  
        //create our plane
        this.geometry = new THREE.PlaneGeometry(this.scale, this.scale, this.triangles,this.triangles);
        const materialProps = {
            color: 'grey',
            wireframe: true,
            displacementMap: this.disMap,
            displacementScale: this.displacementScale
        };
        const material = new THREE.MeshToonMaterial(materialProps);
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.translateX(-0.5);
        this.scene.add(this.mesh);

        //this needs to come at the end of onStart
        this.clock = new THREE.Clock();
    }

    onUpdate()
    {
        //needs to come at the beginning of onUpdate
        this.stats.begin();
        this.dt = this.clock.getDelta();
    }

    onRender()
    {
        this.renderer.render(this.scene, this.camera);

        //needs to come at the end of onRender
        this.stats.end();
    }
}