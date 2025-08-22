
function LightRays(props) {
  const {
      raysOrigin = "top-center",
      raysColor = "#ffffff",
      raysSpeed = 1,
      lightSpread = 1,
      rayLength = 2,
      pulsating = false,
      fadeDistance = 1.0,
      saturation = 1.0,
      followMouse = true,
      mouseInfluence = 0.8,
      noiseAmount = 0.0,
      distortion = 0.0
  } = props;

  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const mouseRef = React.useRef({ x: 0.5, y: 0.5 });

  const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
      ] : [1, 1, 1];
  };

  const getAnchorAndDir = (origin, w, h) => {
      const outside = 0.2;
      switch (origin) {
          case "top-left": return { anchor: [0, -outside * h], dir: [0, 1] };
          case "top-right": return { anchor: [w, -outside * h], dir: [0, 1] };
          case "left": return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
          case "right": return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
          case "bottom-left": return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
          case "bottom-center": return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
          case "bottom-right": return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
          default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
      }
  };

  React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
          console.error('WebGL not supported');
          return;
      }

      // Vertex shader
      const vertexSource = `
          attribute vec2 position;
          varying vec2 vUv;
          void main() {
              vUv = position * 0.5 + 0.5;
              gl_Position = vec4(position, 0.0, 1.0);
          }
      `;

      // Fragment shader
      const fragmentSource = `
          precision highp float;
          
          uniform float iTime;
          uniform vec2 iResolution;
          uniform vec2 rayPos;
          uniform vec2 rayDir;
          uniform vec3 raysColor;
          uniform float raysSpeed;
          uniform float lightSpread;
          uniform float rayLength;
          uniform float pulsating;
          uniform float fadeDistance;
          uniform float saturation;
          uniform vec2 mousePos;
          uniform float mouseInfluence;
          uniform float noiseAmount;
          uniform float distortion;
          
          varying vec2 vUv;
          
          float noise(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
          }
          
          float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                            float seedA, float seedB, float speed) {
              vec2 sourceToCoord = coord - raySource;
              vec2 dirNorm = normalize(sourceToCoord);
              float cosAngle = dot(dirNorm, rayRefDirection);
              
              float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
              float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
              
              float distance = length(sourceToCoord);
              float maxDistance = iResolution.x * rayLength;
              float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
              
              float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
              float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;
              
              float baseStrength = clamp(
                  (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
                  (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
                  0.0, 1.0
              );
              
              return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
          }
          
          void main() {
              vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
              
              vec2 finalRayDir = rayDir;
              if (mouseInfluence > 0.0) {
                  vec2 mouseScreenPos = mousePos * iResolution.xy;
                  vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
                  finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
              }
              
              vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
              vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
              
              gl_FragColor = rays1 * 0.5 + rays2 * 0.4;
              
              if (noiseAmount > 0.0) {
                  float n = noise(coord * 0.01 + iTime * 0.1);
                  gl_FragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
              }
              
              float brightness = 1.0 - (coord.y / iResolution.y);
              gl_FragColor.x *= 0.1 + brightness * 0.8;
              gl_FragColor.y *= 0.3 + brightness * 0.6;
              gl_FragColor.z *= 0.5 + brightness * 0.5;
              
              if (saturation != 1.0) {
                  float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                  gl_FragColor.rgb = mix(vec3(gray), gl_FragColor.rgb, saturation);
              }
              
              gl_FragColor.rgb *= raysColor;
          }
      `;

      // Create shaders
      const createShader = (source, type) => {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              console.error('Shader error:', gl.getShaderInfoLog(shader));
              gl.deleteShader(shader);
              return null;
          }
          return shader;
      };

      const vertexShader = createShader(vertexSource, gl.VERTEX_SHADER);
      const fragmentShader = createShader(fragmentSource, gl.FRAGMENT_SHADER);

      // Create program
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error('Program error:', gl.getProgramInfoLog(program));
          return;
      }

      // Create buffer
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -1, -1, 3, -1, -1, 3
      ]), gl.STATIC_DRAW);

      // Get locations
      const positionLocation = gl.getAttribLocation(program, 'position');
      const uniformLocations = {
          iTime: gl.getUniformLocation(program, 'iTime'),
          iResolution: gl.getUniformLocation(program, 'iResolution'),
          rayPos: gl.getUniformLocation(program, 'rayPos'),
          rayDir: gl.getUniformLocation(program, 'rayDir'),
          raysColor: gl.getUniformLocation(program, 'raysColor'),
          raysSpeed: gl.getUniformLocation(program, 'raysSpeed'),
          lightSpread: gl.getUniformLocation(program, 'lightSpread'),
          rayLength: gl.getUniformLocation(program, 'rayLength'),
          pulsating: gl.getUniformLocation(program, 'pulsating'),
          fadeDistance: gl.getUniformLocation(program, 'fadeDistance'),
          saturation: gl.getUniformLocation(program, 'saturation'),
          mousePos: gl.getUniformLocation(program, 'mousePos'),
          mouseInfluence: gl.getUniformLocation(program, 'mouseInfluence'),
          noiseAmount: gl.getUniformLocation(program, 'noiseAmount'),
          distortion: gl.getUniformLocation(program, 'distortion')
      };

      // Setup canvas
      const updateSize = () => {
          const rect = canvas.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio, 2);
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          gl.viewport(0, 0, canvas.width, canvas.height);
      };

      updateSize();
      window.addEventListener('resize', updateSize);

      // Mouse tracking
      const handleMouseMove = (e) => {
          if (!followMouse) return;
          const rect = canvas.getBoundingClientRect();
          mouseRef.current = {
              x: (e.clientX - rect.left) / rect.width,
              y: (e.clientY - rect.top) / rect.height
          };
      };

      canvas.addEventListener('mousemove', handleMouseMove);

      // Animation loop
      let startTime = Date.now();
      const render = () => {
          const time = (Date.now() - startTime) / 1000;
          
          gl.useProgram(program);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

          // Update uniforms
          const { anchor, dir } = getAnchorAndDir(raysOrigin, canvas.width, canvas.height);
          const color = hexToRgb(raysColor);

          gl.uniform1f(uniformLocations.iTime, time);
          gl.uniform2f(uniformLocations.iResolution, canvas.width, canvas.height);
          gl.uniform2f(uniformLocations.rayPos, anchor[0], anchor[1]);
          gl.uniform2f(uniformLocations.rayDir, dir[0], dir[1]);
          gl.uniform3f(uniformLocations.raysColor, color[0], color[1], color[2]);
          gl.uniform1f(uniformLocations.raysSpeed, raysSpeed);
          gl.uniform1f(uniformLocations.lightSpread, lightSpread);
          gl.uniform1f(uniformLocations.rayLength, rayLength);
          gl.uniform1f(uniformLocations.pulsating, pulsating ? 1.0 : 0.0);
          gl.uniform1f(uniformLocations.fadeDistance, fadeDistance);
          gl.uniform1f(uniformLocations.saturation, saturation);
          gl.uniform2f(uniformLocations.mousePos, mouseRef.current.x, mouseRef.current.y);
          gl.uniform1f(uniformLocations.mouseInfluence, mouseInfluence);
          gl.uniform1f(uniformLocations.noiseAmount, noiseAmount);
          gl.uniform1f(uniformLocations.distortion, distortion);

          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 3);

          animationRef.current = requestAnimationFrame(render);
      };

      render();

      // Cleanup
      return () => {
          if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
          }
          window.removeEventListener('resize', updateSize);
          canvas.removeEventListener('mousemove', handleMouseMove);
      };
  }, [raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, pulsating, fadeDistance, saturation, followMouse, mouseInfluence, noiseAmount, distortion]);

  return React.createElement('canvas', {
      ref: canvasRef,
      style: { width: '100%', height: '100%' }
  });
}

// Initialize components
const lightRays1Container = document.getElementById('lightRays1');

let lightRays1Props = {
  raysOrigin: "top-center",
  raysColor: "#ffffff",
  raysSpeed: 1.5,
  lightSpread: 0.8,
  rayLength: 1.2,
  followMouse: true,
  mouseInfluence: 0.8,
  noiseAmount: 0.1,
  distortion: 0.05
};

const renderLightRays1 = () => {
  ReactDOM.render(React.createElement(LightRays, lightRays1Props), lightRays1Container);
};

// Initial render
renderLightRays1();

// Controls
const controls = {
  origin: document.getElementById('origin'),
  color: document.getElementById('color'),
  speed: document.getElementById('speed'),
  spread: document.getElementById('spread'),
  length: document.getElementById('length'),
  pulsating: document.getElementById('pulsating'),
  followMouse: document.getElementById('followMouse'),
  speedValue: document.getElementById('speedValue'),
  spreadValue: document.getElementById('spreadValue'),
  lengthValue: document.getElementById('lengthValue')
};

// Event listeners
controls.origin.addEventListener('change', (e) => {
  lightRays1Props.raysOrigin = e.target.value;
  renderLightRays1();
});

controls.color.addEventListener('change', (e) => {
  lightRays1Props.raysColor = e.target.value;
  renderLightRays1();
});

controls.speed.addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  lightRays1Props.raysSpeed = value;
  controls.speedValue.textContent = value;
  renderLightRays1();
});

controls.spread.addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  lightRays1Props.lightSpread = value;
  controls.spreadValue.textContent = value;
  renderLightRays1();
});

controls.length.addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  lightRays1Props.rayLength = value;
  controls.lengthValue.textContent = value;
  renderLightRays1();
});

controls.pulsating.addEventListener('change', (e) => {
  lightRays1Props.pulsating = e.target.checked;
  renderLightRays1();
});

controls.followMouse.addEventListener('change', (e) => {
  lightRays1Props.followMouse = e.target.checked;
  renderLightRays1();
});
