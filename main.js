import './style.css';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import vertexShader from './shaders/vertex.glsl';
import { Text } from 'troika-three-text'
import textVertexShader from './shaders/textVertex.glsl';
import gsap from 'gsap';



const blobs = [
  {
      name: 'Color Fusion',
      background: '#9D73F7',
      config: { "uPositionFrequency": 1, "uPositionStrength": 0.3, "uSmallWavePositionFrequency": 0.5, "uSmallWavePositionStrength": 0.7, "roughness": 1, "metalness": 0, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "cosmic-fusion" },
  },
  {
      name: 'Purple Mirror',
      background: '#5300B1',
      config: { "uPositionFrequency": 0.584, "uPositionStrength": 0.276, "uSmallWavePositionFrequency": 0.899, "uSmallWavePositionStrength": 1.266, "roughness": 0, "metalness": 1, "envMapIntensity": 2, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "purple-rain" },
  },
  {
      name: 'Alien Goo',
      background: '#45ACD8',
      config: { "uPositionFrequency": 1.022, "uPositionStrength": 0.99, "uSmallWavePositionFrequency": 0.378, "uSmallWavePositionStrength": 0.341, "roughness": 0.292, "metalness": 0.73, "envMapIntensity": 0.86, "clearcoat": 1, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "lucky-day" },
  },
  {
      name: 'Just Imagine',
      background: '#f5d478',
      config: { "uPositionFrequency": 4.69, "uPositionStrength": 0.3, "uSmallWavePositionFrequency": 0.5, "uSmallWavePositionStrength": 0.9, "roughness": 0.292, "metalness": 0.73, "envMapIntensity": 0.86, "clearcoat": 1, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "imaginarium" },
  },
  {
    name: 'Denmark',
    background: '#9D73F7',
    config: { "uPositionFrequency": 7.15, "uPositionStrength": 0.39, "uSmallWavePositionFrequency": 0.13, "uSmallWavePositionStrength": 0.7, "roughness": 1, "metalness": 1, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "hologram" },
},
  {
    name: 'Nordic Ice',
    background: '#c7eb44',
    config: { "uPositionFrequency": 4.5, "uPositionStrength": 0.1, "uSmallWavePositionFrequency": 1.2, "uSmallWavePositionStrength": 0.4, "roughness": 0.8, "metalness": 0.6, "envMapIntensity": 0.2, "clearcoat": 0.8, "clearcoatRoughness": 0.4, "transmission": 0.6, "flatShading": false, "wireframe": false, "map": "pink-floyd" },
},
]

let isAnimating = false;
let currentText = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#000');
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas'),
  antialias: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
  console.log('Loading file: ' + url + '. Total Files Loaded: ' + itemsLoaded + '/' + itemsTotal);
};

const loader = new RGBELoader(loadingManager);
loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });


const uniforms = {
  uTime: { value: 0 },
  uPositionFrequency: { value: blobs[currentText].config.uPositionFrequency },
  uPositionStrength: { value: blobs[currentText].config.uPositionStrength },
  uTimeFrequency: { value: 1 },
  uSmallWavePositionFrequency: { value: blobs[currentText].config.uSmallWavePositionFrequency },
  uSmallWavePositionStrength: { value: blobs[currentText].config.uSmallWavePositionStrength },
  uSmallWaveTimeFrequency: { value: 1 },
};

const material = new CustomShaderMaterial({
 baseMaterial: THREE.MeshPhysicalMaterial,
 vertexShader,
  map: new THREE.TextureLoader().load(`./gradients/${blobs[currentText].config.map}.png`),
  roughness: blobs[currentText].config.roughness,
  metalness: blobs[currentText].config.metalness,
  envMapIntensity: blobs[currentText].config.envMapIntensity,
  clearcoat: blobs[currentText].config.clearcoat,
  clearcoatRoughness: blobs[currentText].config.clearcoatRoughness,
  transmission: blobs[currentText].config.transmission,
  flatShading: blobs[currentText].config.flatShading,
  wireframe: blobs[currentText].config.wireframe,
  side: THREE.DoubleSide,
  uniforms,

});

const geometry = new THREE.IcosahedronGeometry(0.8, 70);
const mergedGeometry = mergeVertices(geometry);
mergedGeometry.computeTangents();

const cube = new THREE.Mesh(mergedGeometry, material);
scene.add(cube);

camera.position.z = 5;

const clock = new THREE.Clock();


const textMaterial = new THREE.ShaderMaterial({
  vertexShader : textVertexShader,
  fragmentShader : `void main() {
    gl_FragColor = vec4(1.0);
  }`,
  side: THREE.DoubleSide,
  uniforms: { 
    progress: { value: 0 },
    direction: { value: 1 },
   },
});


const texts = blobs.map((blob, index) => {
  const mytext = new Text()
    mytext.text = blob.name;
    mytext.fontSize = 1;
    mytext.font = `./aften_screen.woff`;
    mytext.anchorX = 'center';
    mytext.anchorY = 'middle';
    mytext.material = textMaterial;
    mytext.position.set(0, 0, 2);
    if(index !== 0) mytext.scale.set(0,0,0);
    mytext.letterSpacing = -0.08;
    mytext.glyphGeometryDetail = 20;
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    mytext.fontSize = window.innerWidth / 7000;
    }else{
      mytext.fontSize = window.innerWidth / 4000;
    }
    mytext.sync();
  scene.add(mytext);
  return mytext;
});


if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  window.addEventListener('touchmove', (e) => {
    if(isAnimating) return;
    isAnimating = true;
    let direction = Math.sign(e.touches[0].clientY - window.innerHeight / 2);
    let next = (currentText + direction + blobs.length) % blobs.length;

    texts[next].scale.set(1,1,1);
    texts[next].position.x = direction * 3.5;

    gsap.to(textMaterial.uniforms.progress, {
      value: 0.5,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        currentText = next;
        isAnimating = false;
        textMaterial.uniforms.progress.value = 0;
      }
    });
 
    gsap.to(texts[currentText].position, {
      x: -direction * 4,
      duration: 1,
      ease: 'power2.inOut',
    });
  
    gsap.to(texts[next].position, {
      x: 0,
      duration: 1,
      ease: 'power2.inOut',
    });

    gsap.to(cube.rotation,{
      y: cube.rotation.y + Math.PI * 4 * -direction ,
      duration: 1,
      ease: 'power2.inOut',
    })

    const bg = new THREE.Color(blobs[next].background);

    gsap.to(scene.background,{
      r: bg.r,
      g: bg.g,
      b: bg.b,
      duration: 1,
      ease: 'power2.inOut',
    })

    updateBlob(blobs[next].config);
  
  })
} else {
  window.addEventListener('mousewheel', (e) => {
    if(isAnimating) return;
    isAnimating = true;
    let direction = Math.sign(e.deltaY);
    let next = (currentText + direction + blobs.length) % blobs.length;

    texts[next].scale.set(1,1,1);
    texts[next].position.x = direction * 3.5;

    gsap.to(textMaterial.uniforms.progress, {
      value: 0.5,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        currentText = next;
        isAnimating = false;
        textMaterial.uniforms.progress.value = 0;
      }
    });
 
    gsap.to(texts[currentText].position, {
      x: -direction * 4,
      duration: 1,
      ease: 'power2.inOut',
    });
  
    gsap.to(texts[next].position, {
      x: 0,
      duration: 1,
      ease: 'power2.inOut',
    });

    gsap.to(cube.rotation,{
      y: cube.rotation.y + Math.PI * 4 * -direction ,
      duration: 1,
      ease: 'power2.inOut',
    })

    const bg = new THREE.Color(blobs[next].background);

    gsap.to(scene.background,{
      r: bg.r,
      g: bg.g,
      b: bg.b,
      duration: 1,
      ease: 'power2.inOut',
    })

    updateBlob(blobs[next].config);
  
  })
}

function updateBlob(config){
  if(config.map != undefined) {setTimeout(()=>{
    material.map = new THREE.TextureLoader().load(`./gradients/${config.map}.png`);
  },400);
}
  if(config.uPositionFrequency != undefined) gsap.to(material.uniforms.uPositionFrequency,{value: config.uPositionFrequency,duration:1,ease:'power2.inOut'})
  if(config.uPositionStrength != undefined) gsap.to(material.uniforms.uPositionStrength,{value: config.uPositionStrength,duration:1,ease:'power2.inOut'})
  if(config.uSmallWavePositionFrequency != undefined) gsap.to(material.uniforms.uSmallWavePositionFrequency,{value: config.uSmallWavePositionFrequency,duration:1,ease:'power2.inOut'})
  if(config.uSmallWavePositionStrength != undefined) gsap.to(material.uniforms.uSmallWavePositionStrength,{value: config.uSmallWavePositionStrength,duration:1,ease:'power2.inOut'})
  if(config.roughness != undefined) gsap.to(material,{roughness: config.roughness,duration:1,ease:'power2.inOut'})
  if(config.metalness != undefined) gsap.to(material,{metalness: config.metalness,duration:1,ease:'power2.inOut'})
  if(config.envMapIntensity != undefined) gsap.to(material,{envMapIntensity: config.envMapIntensity,duration:1,ease:'power2.inOut'})
  if(config.clearcoat != undefined) gsap.to(material,{clearcoat: config.clearcoat,duration:1,ease:'power2.inOut'})
  if(config.clearcoatRoughness != undefined) gsap.to(material,{clearcoatRoughness: config.clearcoatRoughness,duration:1,ease:'power2.inOut'})
  if(config.transmission != undefined) gsap.to(material,{transmission: config.transmission,duration:1,ease:'power2.inOut'})
  if(config.flatShading != undefined) gsap.to(material,{flatShading: config.flatShading,duration:1,ease:'power2.inOut'})
  if(config.wireframe != undefined) gsap.to(material,{wireframe: config.wireframe,duration:1,ease:'power2.inOut'})

}

loadingManager.onLoad = () => {
  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }

  const bg = new THREE.Color(blobs[currentText].background);
  gsap.to(scene.background, {
    r: bg.r,
    g: bg.g,
    b: bg.b,
    duration: 1,
    ease: 'power2.inOut',
  });
  
  animate();
}
