(()=>{var O=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;var G=1920*1080*4,B=class{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=te();uniformCache={};textureUnitMap=new Map;constructor(t,r,i,c,n=0,d=0,u=2,f=G,g=[]){if(t instanceof HTMLElement)this.parentElement=t;else throw new Error("Paper Shaders: parent element must be an HTMLElement");if(!document.querySelector("style[data-paper-shader]")){let x=document.createElement("style");x.innerHTML=ee,x.setAttribute("data-paper-shader",""),document.head.prepend(x)}let m=document.createElement("canvas");this.canvasElement=m,this.parentElement.prepend(m),this.fragmentShader=r,this.providedUniforms=i,this.mipmaps=g,this.currentFrame=d,this.minPixelRatio=u,this.maxPixelCount=f;let v=m.getContext("webgl2",c);if(!v)throw new Error("Paper Shaders: WebGL is not supported in this browser");this.gl=v,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setSpeed(n),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,document.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let t=J(this.gl,O,this.fragmentShader);t&&(this.program=t)};setupPositionAttribute=()=>{let t=this.gl.getAttribLocation(this.program,"a_position"),r=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,r);let i=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(i),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let t={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([r,i])=>{if(t[r]=this.gl.getUniformLocation(this.program,r),i instanceof HTMLImageElement){let c=`${r}AspectRatio`;t[c]=this.gl.getUniformLocation(this.program,c)}}),this.uniformLocations=t};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([t])=>{if(t?.borderBoxSize[0]){let r=t.devicePixelContentBoxSize?.[0];r!==void 0&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=r.inlineSize,this.parentDevicePixelHeight=r.blockSize),this.parentWidth=t.borderBoxSize[0].inlineSize,this.parentHeight=t.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let t=0,r=0,i=Math.max(1,window.devicePixelRatio),c=visualViewport?.scale??1;if(this.devicePixelsSupported){let m=Math.max(1,this.minPixelRatio/i);t=this.parentDevicePixelWidth*m*c,r=this.parentDevicePixelHeight*m*c}else{let m=Math.max(i,this.minPixelRatio)*c;if(this.isSafari){let v=ie();m*=Math.max(1,v)}t=Math.round(this.parentWidth)*m,r=Math.round(this.parentHeight)*m}let n=Math.sqrt(this.maxPixelCount)/Math.sqrt(t*r),d=Math.min(1,n),u=Math.round(t*d),f=Math.round(r*d),g=u/Math.round(this.parentWidth);(this.canvasElement.width!==u||this.canvasElement.height!==f||this.renderScale!==g)&&(this.renderScale=g,this.canvasElement.width=u,this.canvasElement.height=f,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=t=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn("Tried to render before program or gl was initialized");return}let r=t-this.lastRenderTime;this.lastRenderTime=t,this.currentSpeed!==0&&(this.currentFrame+=r*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*.001),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed!==0?this.requestRender():this.rafId=null};requestRender=()=>{this.rafId!==null&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(t,r)=>{if(!r.complete||r.naturalWidth===0)throw new Error(`Paper Shaders: image for uniform ${t} must be fully loaded`);let i=this.textures.get(t);i&&this.gl.deleteTexture(i),this.textureUnitMap.has(t)||this.textureUnitMap.set(t,this.textureUnitMap.size);let c=this.textureUnitMap.get(t);this.gl.activeTexture(this.gl.TEXTURE0+c);let n=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,n),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,r),this.mipmaps.includes(t)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let d=this.gl.getError();if(d!==this.gl.NO_ERROR||n===null){console.error("Paper Shaders: WebGL error when uploading texture:",d);return}this.textures.set(t,n);let u=this.uniformLocations[t];if(u){this.gl.uniform1i(u,c);let f=`${t}AspectRatio`,g=this.uniformLocations[f];if(g){let m=r.naturalWidth/r.naturalHeight;this.gl.uniform1f(g,m)}}};areUniformValuesEqual=(t,r)=>t===r?!0:Array.isArray(t)&&Array.isArray(r)&&t.length===r.length?t.every((i,c)=>this.areUniformValuesEqual(i,r[c])):!1;setUniformValues=t=>{this.gl.useProgram(this.program),Object.entries(t).forEach(([r,i])=>{let c=i;if(i instanceof HTMLImageElement&&(c=`${i.src.slice(0,200)}|${i.naturalWidth}x${i.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[r],c))return;this.uniformCache[r]=c;let n=this.uniformLocations[r];if(!n){console.warn(`Uniform location for ${r} not found`);return}if(i instanceof HTMLImageElement)this.setTextureUniform(r,i);else if(Array.isArray(i)){let d=null,u=null;if(i[0]!==void 0&&Array.isArray(i[0])){let f=i[0].length;if(i.every(g=>g.length===f))d=i.flat(),u=f;else{console.warn(`All child arrays must be the same length for ${r}`);return}}else d=i,u=d.length;switch(u){case 2:this.gl.uniform2fv(n,d);break;case 3:this.gl.uniform3fv(n,d);break;case 4:this.gl.uniform4fv(n,d);break;case 9:this.gl.uniformMatrix3fv(n,!1,d);break;case 16:this.gl.uniformMatrix4fv(n,!1,d);break;default:console.warn(`Unsupported uniform array length: ${u}`)}}else typeof i=="number"?this.gl.uniform1f(n,i):typeof i=="boolean"?this.gl.uniform1i(n,i?1:0):console.warn(`Unsupported uniform type for ${r}: ${typeof i}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=t=>{this.currentFrame=t,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(t=1)=>{this.speed=t,this.setCurrentSpeed(document.hidden?0:t)};setCurrentSpeed=t=>{this.currentSpeed=t,this.rafId===null&&t!==0&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),this.rafId!==null&&t===0&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(t=G)=>{this.maxPixelCount=t,this.handleResize()};setMinPixelRatio=(t=2)=>{this.minPixelRatio=t,this.handleResize()};setUniforms=t=>{this.setUniformValues(t),this.providedUniforms={...this.providedUniforms,...t},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.setCurrentSpeed(document.hidden?0:this.speed)};dispose=()=>{this.hasBeenDisposed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(t=>{this.gl.deleteTexture(t)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),document.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}};function k(o,t,r){let i=o.createShader(t);return i?(o.shaderSource(i,r),o.compileShader(i),o.getShaderParameter(i,o.COMPILE_STATUS)?i:(console.error("An error occurred compiling the shaders: "+o.getShaderInfoLog(i)),o.deleteShader(i),null)):null}function J(o,t,r){let i=o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.MEDIUM_FLOAT),c=i?i.precision:null;c&&c<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),r=r.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let n=k(o,o.VERTEX_SHADER,t),d=k(o,o.FRAGMENT_SHADER,r);if(!n||!d)return null;let u=o.createProgram();return u?(o.attachShader(u,n),o.attachShader(u,d),o.linkProgram(u),o.getProgramParameter(u,o.LINK_STATUS)?(o.detachShader(u,n),o.detachShader(u,d),o.deleteShader(n),o.deleteShader(d),u):(console.error("Unable to initialize the shader program: "+o.getProgramInfoLog(u)),o.deleteProgram(u),o.deleteShader(n),o.deleteShader(d),null)):null}var ee=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function te(){let o=navigator.userAgent.toLowerCase();return o.includes("safari")&&!o.includes("chrome")&&!o.includes("android")}function ie(){let o=visualViewport?.scale??1,t=visualViewport?.width??window.innerWidth,r=window.innerWidth-document.documentElement.clientWidth,i=o*t+r,c=outerWidth/i,n=Math.round(100*c);return n%5===0?n/100:n===33?1/3:n===67?2/3:n===133?4/3:c}var W=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,q=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;var $=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,N=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;var z=`#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${W}
${q}
${N}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = 250. / v_responsiveBoxGivenSize;
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${$}

  fragColor = vec4(color, opacity);
}
`;(()=>{"use strict";let o=Array.from(document.querySelectorAll("[data-liquid-surface]"));if(!o.length)return;let t=window.matchMedia("(prefers-reduced-motion: reduce)"),r=window.matchMedia("(hover: hover) and (pointer: fine)"),i=navigator.connection?.saveData===!0,c=Number(navigator.hardwareConcurrency||0),n=Number(navigator.deviceMemory||0),d=c>0&&c<=4,u=n>0&&n<=4,f=d&&u||n>0&&n<=2,g=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),m=new Map,v=[],x=!1,F={selector:{idle:0,hover:.85,large:!1,maxPixels:8e4,uniforms:{u_repetition:4,u_softness:.5,u_angle:45,u_scale:8,u_shape:0}},seam:{idle:0,hover:0,large:!1,maxPixels:36e3,uniforms:{u_repetition:3,u_softness:.56,u_angle:62,u_scale:7,u_shape:0}},ambient:{idle:0,hover:0,large:!0,maxPixels:12e4,uniforms:{u_repetition:3,u_softness:.56,u_angle:62,u_scale:7,u_shape:0}},process:{idle:0,hover:0,large:!1,maxPixels:7e4,uniforms:{u_repetition:3.2,u_softness:.52,u_angle:24,u_scale:7.6,u_shape:0}},proof:{idle:0,hover:0,large:!0,maxPixels:15e4,uniforms:{u_repetition:4.6,u_softness:.48,u_angle:72,u_scale:9,u_shape:0}},transition:{idle:0,hover:0,large:!0,maxPixels:2e5,uniforms:{u_repetition:2.4,u_softness:.58,u_angle:12,u_scale:6.6,u_shape:0}}},_=e=>F[e.dataset.liquidProfile]||F.selector,b=new Map(o.map(e=>[e,{intersecting:!1,engaged:!1,requested:_(e).idle,timer:0,flipAnimation:null}])),V=t.matches?"reduced-motion":i?"save-data":f?"low-power":g?"safari":r.matches?"":"coarse-pointer",R=(()=>{if(V)return!1;try{let a=document.createElement("canvas").getContext("webgl2",{alpha:!0,antialias:!1,powerPreference:"low-power"});return a?.getExtension("WEBGL_lose_context")?.loseContext(),!!a}catch{return!1}})();document.documentElement.classList.add(R?"liquid-webgl-eligible":"liquid-static-fallback"),R||(document.documentElement.dataset.liquidFallback=V||"webgl");let H={u_colorBack:[.018,.055,.19,1],u_colorTint:[.125,.31,.81,.78],u_repetition:4,u_softness:.5,u_shiftRed:.3,u_shiftBlue:.3,u_distortion:0,u_contour:0,u_angle:45,u_scale:8,u_shape:1,u_offsetX:.1,u_offsetY:-.1,u_isImage:!1},S=(e,a,s,l)=>{e.addEventListener(a,s,l),v.push(()=>e.removeEventListener(a,s,l))},X=(e,a)=>{let s=m.get(e);s&&(s.setSpeed(a),e.dataset.shaderSpeed=String(a))},y=()=>{let e=0;o.forEach(a=>{let s=b.get(a),l=_(a),p=document.hidden||!s.intersecting?0:s.requested;p>0&&l.large&&(e+=1,e>1&&(p=0)),X(a,p)})},M=e=>{if(!R||m.has(e)||x)return m.get(e);let a=_(e);try{let s=new B(e,z,{...H,...a.uniforms},{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"low-power"},0,0,Math.min(window.devicePixelRatio||1,1.25),a.maxPixels);return s.canvasElement.setAttribute("aria-hidden","true"),s.canvasElement.tabIndex=-1,m.set(e,s),e.dataset.shaderState="mounted",y(),s}catch{return e.dataset.shaderState="fallback",null}},A=(e,a=2.4,s=360)=>{let l=o.find(h=>h.dataset.liquidSurface===e);if(!l)return;let p=b.get(l);_(l).large&&o.forEach(h=>{if(h===l||!_(h).large)return;let w=b.get(h);window.clearTimeout(w.timer),w.requested=0}),window.clearTimeout(p.timer),p.requested=a,p.intersecting&&M(l),y(),p.timer=window.setTimeout(()=>{p.requested=p.engaged?_(l).hover:_(l).idle,y()},s)},T=(e,a,s)=>{let l=b.get(e);l&&(l.engaged=s,l.requested=s?_(e).hover:_(e).idle,a.classList.toggle("liquid-engaged",s),y())},j=(e,a)=>{if(t.matches)return;let s=e.getBoundingClientRect(),l=document.createElement("span");l.className="liquid-ripple";let p=Number.isFinite(a.clientX)&&a.clientX>0;l.style.left=`${p?a.clientX-s.left:s.width/2}px`,l.style.top=`${p?a.clientY-s.top:s.height/2}px`,l.addEventListener("animationend",()=>l.remove(),{once:!0}),e.append(l)},E=(e,a=!0)=>{let s=e.querySelector('button[aria-selected="true"], button[aria-expanded="true"]'),l=e.querySelector("[data-liquid-surface]");if(!s||!l)return;let p=b.get(l),h=l.closest("[data-liquid-clip]")||l,w=h.getBoundingClientRect();p.flipAnimation?.cancel();let D=e.getBoundingClientRect(),P=s.getBoundingClientRect();h.style.left=`${P.left-D.left+e.scrollLeft-e.clientLeft}px`,h.style.top=`${P.top-D.top+e.scrollTop-e.clientTop}px`,h.style.width=`${P.width}px`,h.style.height=`${P.height}px`;let U=h.getBoundingClientRect();if(e.hasAttribute("data-liquid-strict")||!a||t.matches||w.width<2||U.width<2||!l.animate)return;let Y=w.left-U.left,Z=w.top-U.top,K=w.width/U.width,Q=w.height/U.height;p.flipAnimation=h.animate([{transform:`translate3d(${Y}px,${Z}px,0) scale(${K},${Q})`,transformOrigin:"0 0"},{transform:"translate3d(0,0,0) scale(1,1)",transformOrigin:"0 0"}],{duration:500,easing:"cubic-bezier(.16,1,.3,1)"})};document.querySelectorAll("[data-liquid-selector]").forEach(e=>{let a=e.querySelector("[data-liquid-surface]");if(!a)return;E(e,!1),document.fonts?.ready.then(()=>{x||E(e,!1)});let s=0,l=new ResizeObserver(()=>{window.clearTimeout(s),s=window.setTimeout(()=>E(e,!1),80)});l.observe(e),v.push(()=>{l.disconnect(),window.clearTimeout(s)});let p=new MutationObserver(()=>requestAnimationFrame(()=>E(e,!0)));e.querySelectorAll("button").forEach(h=>p.observe(h,{attributes:!0,attributeFilter:["aria-selected","aria-expanded"]})),v.push(()=>p.disconnect()),S(e,"pointerenter",()=>T(a,e,!0)),S(e,"pointerleave",()=>T(a,e,!1)),S(e,"focusin",()=>T(a,e,!0)),S(e,"focusout",h=>{e.contains(h.relatedTarget)||T(a,e,!1)}),S(e,"click",h=>{h.target.closest("button")&&(A(a.dataset.liquidSurface,2.4,360),requestAnimationFrame(()=>{E(e,!0),j(a,h)}))})});let I=new IntersectionObserver(e=>{e.forEach(a=>{let s=a.target,l=b.get(s);l.intersecting=a.isIntersecting,a.isIntersecting&&s.dataset.liquidProfile!=="transition"&&M(s)}),y()},{threshold:.05,rootMargin:"72px 0px"}),C=()=>{x||o.forEach(e=>I.observe(e))};"requestIdleCallback"in window?window.requestIdleCallback(C,{timeout:900}):window.setTimeout(C,180),v.push(()=>I.disconnect()),S(document,"visibilitychange",y),S(t,"change",e=>{e.matches&&(m.forEach(a=>a.setSpeed(0)),o.forEach(a=>{a.dataset.shaderSpeed="0"}),document.querySelectorAll(".liquid-ripple").forEach(a=>a.remove()))});let L=()=>{x||(x=!0,v.splice(0).forEach(e=>e()),b.forEach(e=>{window.clearTimeout(e.timer),e.flipAnimation?.cancel()}),m.forEach(e=>e.dispose()),m.clear())};S(window,"pagehide",L,{once:!0}),window.__toptalShaderControl={pulse:A,reconcile:y,dispose:L},window.__toptalShaderDiagnostics={package:"@paper-design/shaders@0.0.69",fragment:"liquidMetalFragmentShader",eligible:R,fallbackReason:V||(R?"":"webgl"),budget:{surfaces:o.length,maxLargeMoving:1,maxPixels:2e5,maxPixelRatio:1.25},device:{hardwareConcurrency:c,deviceMemory:n,lowPower:f},get mounted(){return m.size},get disposed(){return x},get movingLarge(){return o.filter(e=>_(e).large&&Number(e.dataset.shaderSpeed||0)>0).length},get canvasPixels(){return Array.from(m.values()).reduce((e,a)=>e+a.canvasElement.width*a.canvasElement.height,0)},get surfaces(){return o.map(e=>({name:e.dataset.liquidSurface,profile:e.dataset.liquidProfile||"selector",state:e.dataset.shaderState||"static",speed:Number(e.dataset.shaderSpeed||0),intersecting:b.get(e)?.intersecting||!1}))}}})();})();
