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
}`;var G=1920*1080*4,B=class{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=te();uniformCache={};textureUnitMap=new Map;constructor(t,o,r,c,l=0,d=0,u=2,g=G,h=[]){if(t instanceof HTMLElement)this.parentElement=t;else throw new Error("Paper Shaders: parent element must be an HTMLElement");if(!document.querySelector("style[data-paper-shader]")){let w=document.createElement("style");w.innerHTML=ee,w.setAttribute("data-paper-shader",""),document.head.prepend(w)}let p=document.createElement("canvas");this.canvasElement=p,this.parentElement.prepend(p),this.fragmentShader=o,this.providedUniforms=r,this.mipmaps=h,this.currentFrame=d,this.minPixelRatio=u,this.maxPixelCount=g;let v=p.getContext("webgl2",c);if(!v)throw new Error("Paper Shaders: WebGL is not supported in this browser");this.gl=v,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setSpeed(l),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,document.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let t=J(this.gl,O,this.fragmentShader);t&&(this.program=t)};setupPositionAttribute=()=>{let t=this.gl.getAttribLocation(this.program,"a_position"),o=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,o);let r=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(r),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let t={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([o,r])=>{if(t[o]=this.gl.getUniformLocation(this.program,o),r instanceof HTMLImageElement){let c=`${o}AspectRatio`;t[c]=this.gl.getUniformLocation(this.program,c)}}),this.uniformLocations=t};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([t])=>{if(t?.borderBoxSize[0]){let o=t.devicePixelContentBoxSize?.[0];o!==void 0&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=o.inlineSize,this.parentDevicePixelHeight=o.blockSize),this.parentWidth=t.borderBoxSize[0].inlineSize,this.parentHeight=t.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let t=0,o=0,r=Math.max(1,window.devicePixelRatio),c=visualViewport?.scale??1;if(this.devicePixelsSupported){let p=Math.max(1,this.minPixelRatio/r);t=this.parentDevicePixelWidth*p*c,o=this.parentDevicePixelHeight*p*c}else{let p=Math.max(r,this.minPixelRatio)*c;if(this.isSafari){let v=ie();p*=Math.max(1,v)}t=Math.round(this.parentWidth)*p,o=Math.round(this.parentHeight)*p}let l=Math.sqrt(this.maxPixelCount)/Math.sqrt(t*o),d=Math.min(1,l),u=Math.round(t*d),g=Math.round(o*d),h=u/Math.round(this.parentWidth);(this.canvasElement.width!==u||this.canvasElement.height!==g||this.renderScale!==h)&&(this.renderScale=h,this.canvasElement.width=u,this.canvasElement.height=g,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=t=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn("Tried to render before program or gl was initialized");return}let o=t-this.lastRenderTime;this.lastRenderTime=t,this.currentSpeed!==0&&(this.currentFrame+=o*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*.001),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed!==0?this.requestRender():this.rafId=null};requestRender=()=>{this.rafId!==null&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(t,o)=>{if(!o.complete||o.naturalWidth===0)throw new Error(`Paper Shaders: image for uniform ${t} must be fully loaded`);let r=this.textures.get(t);r&&this.gl.deleteTexture(r),this.textureUnitMap.has(t)||this.textureUnitMap.set(t,this.textureUnitMap.size);let c=this.textureUnitMap.get(t);this.gl.activeTexture(this.gl.TEXTURE0+c);let l=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,l),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,o),this.mipmaps.includes(t)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let d=this.gl.getError();if(d!==this.gl.NO_ERROR||l===null){console.error("Paper Shaders: WebGL error when uploading texture:",d);return}this.textures.set(t,l);let u=this.uniformLocations[t];if(u){this.gl.uniform1i(u,c);let g=`${t}AspectRatio`,h=this.uniformLocations[g];if(h){let p=o.naturalWidth/o.naturalHeight;this.gl.uniform1f(h,p)}}};areUniformValuesEqual=(t,o)=>t===o?!0:Array.isArray(t)&&Array.isArray(o)&&t.length===o.length?t.every((r,c)=>this.areUniformValuesEqual(r,o[c])):!1;setUniformValues=t=>{this.gl.useProgram(this.program),Object.entries(t).forEach(([o,r])=>{let c=r;if(r instanceof HTMLImageElement&&(c=`${r.src.slice(0,200)}|${r.naturalWidth}x${r.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[o],c))return;this.uniformCache[o]=c;let l=this.uniformLocations[o];if(!l){console.warn(`Uniform location for ${o} not found`);return}if(r instanceof HTMLImageElement)this.setTextureUniform(o,r);else if(Array.isArray(r)){let d=null,u=null;if(r[0]!==void 0&&Array.isArray(r[0])){let g=r[0].length;if(r.every(h=>h.length===g))d=r.flat(),u=g;else{console.warn(`All child arrays must be the same length for ${o}`);return}}else d=r,u=d.length;switch(u){case 2:this.gl.uniform2fv(l,d);break;case 3:this.gl.uniform3fv(l,d);break;case 4:this.gl.uniform4fv(l,d);break;case 9:this.gl.uniformMatrix3fv(l,!1,d);break;case 16:this.gl.uniformMatrix4fv(l,!1,d);break;default:console.warn(`Unsupported uniform array length: ${u}`)}}else typeof r=="number"?this.gl.uniform1f(l,r):typeof r=="boolean"?this.gl.uniform1i(l,r?1:0):console.warn(`Unsupported uniform type for ${o}: ${typeof r}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=t=>{this.currentFrame=t,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(t=1)=>{this.speed=t,this.setCurrentSpeed(document.hidden?0:t)};setCurrentSpeed=t=>{this.currentSpeed=t,this.rafId===null&&t!==0&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),this.rafId!==null&&t===0&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(t=G)=>{this.maxPixelCount=t,this.handleResize()};setMinPixelRatio=(t=2)=>{this.minPixelRatio=t,this.handleResize()};setUniforms=t=>{this.setUniformValues(t),this.providedUniforms={...this.providedUniforms,...t},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.setCurrentSpeed(document.hidden?0:this.speed)};dispose=()=>{this.hasBeenDisposed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(t=>{this.gl.deleteTexture(t)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),document.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}};function k(a,t,o){let r=a.createShader(t);return r?(a.shaderSource(r,o),a.compileShader(r),a.getShaderParameter(r,a.COMPILE_STATUS)?r:(console.error("An error occurred compiling the shaders: "+a.getShaderInfoLog(r)),a.deleteShader(r),null)):null}function J(a,t,o){let r=a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT),c=r?r.precision:null;c&&c<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),o=o.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let l=k(a,a.VERTEX_SHADER,t),d=k(a,a.FRAGMENT_SHADER,o);if(!l||!d)return null;let u=a.createProgram();return u?(a.attachShader(u,l),a.attachShader(u,d),a.linkProgram(u),a.getProgramParameter(u,a.LINK_STATUS)?(a.detachShader(u,l),a.detachShader(u,d),a.deleteShader(l),a.deleteShader(d),u):(console.error("Unable to initialize the shader program: "+a.getProgramInfoLog(u)),a.deleteProgram(u),a.deleteShader(l),a.deleteShader(d),null)):null}var ee=`@layer paper-shaders {
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
}`;function te(){let a=navigator.userAgent.toLowerCase();return a.includes("safari")&&!a.includes("chrome")&&!a.includes("android")}function ie(){let a=visualViewport?.scale??1,t=visualViewport?.width??window.innerWidth,o=window.innerWidth-document.documentElement.clientWidth,r=a*t+o,c=outerWidth/r,l=Math.round(100*c);return l%5===0?l/100:l===33?1/3:l===67?2/3:l===133?4/3:c}var W=`
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
`;(()=>{"use strict";let a=Array.from(document.querySelectorAll("[data-liquid-surface]"));if(!a.length)return;let t=window.matchMedia("(prefers-reduced-motion: reduce)"),o=window.matchMedia("(hover: hover) and (pointer: fine)"),r=navigator.connection?.saveData===!0,c=Number(navigator.hardwareConcurrency||0),l=Number(navigator.deviceMemory||0),d=c>0&&c<=4,u=l>0&&l<=4,g=d&&u||l>0&&l<=2,h=new Map,p=[],v=!1,w={selector:{idle:.64,hover:1.1,large:!1,maxPixels:7e4,uniforms:{u_repetition:4,u_softness:.5,u_angle:45,u_scale:8,u_shape:0}},hero:{idle:.52,hover:.72,large:!0,maxPixels:19e4,uniforms:{u_repetition:2.8,u_softness:.56,u_angle:58,u_scale:6.8,u_shape:0}},horizon:{idle:.28,hover:.46,large:!0,maxPixels:13e4,uniforms:{u_repetition:4.8,u_softness:.5,u_angle:7,u_scale:9.2,u_shape:0}},ambient:{idle:.24,hover:.42,large:!0,maxPixels:15e4,uniforms:{u_repetition:3,u_softness:.56,u_angle:62,u_scale:7,u_shape:0}},stage:{idle:.27,hover:.48,large:!0,maxPixels:145e3,uniforms:{u_repetition:3.5,u_softness:.53,u_angle:34,u_scale:7.4,u_shape:0}},process:{idle:.3,hover:.52,large:!0,maxPixels:145e3,uniforms:{u_repetition:3.2,u_softness:.52,u_angle:24,u_scale:7.6,u_shape:0}},proof:{idle:.3,hover:.5,large:!0,maxPixels:165e3,uniforms:{u_repetition:4.6,u_softness:.48,u_angle:72,u_scale:9,u_shape:0}},transition:{idle:0,hover:0,large:!0,maxPixels:2e5,uniforms:{u_repetition:2.4,u_softness:.58,u_angle:12,u_scale:6.6,u_shape:0}}},x=e=>w[e.dataset.liquidProfile]||w.selector,_=new Map(a.map(e=>[e,{intersecting:!1,ratio:0,engaged:!1,priority:!1,requested:x(e).idle,timer:0,flipAnimation:null}])),V=t.matches?"reduced-motion":r?"save-data":g?"low-power":"",y=(()=>{if(V)return!1;try{let i=document.createElement("canvas").getContext("webgl2",{alpha:!0,antialias:!1,powerPreference:"low-power"});return i?.getExtension("WEBGL_lose_context")?.loseContext(),!!i}catch{return!1}})();document.documentElement.classList.add(y?"liquid-webgl-eligible":"liquid-static-fallback"),y||(document.documentElement.dataset.liquidFallback=V||"webgl");let F=()=>document.documentElement.dataset.theme==="dark"?{u_colorBack:[.008,.02,.07,1],u_colorTint:[.34,.48,.96,.76]}:{u_colorBack:[.018,.055,.19,1],u_colorTint:[.125,.31,.81,.78]},H={u_repetition:4,u_softness:.5,u_shiftRed:.3,u_shiftBlue:.3,u_distortion:0,u_contour:0,u_angle:45,u_scale:8,u_shape:0,u_offsetX:.1,u_offsetY:-.1,u_isImage:!1},b=(e,i,s,n)=>{e.addEventListener(i,s,n),p.push(()=>e.removeEventListener(i,s,n))},X=(e,i)=>{let s=h.get(e);s&&(s.setSpeed(i),e.dataset.shaderSpeed=String(i))},S=()=>{let e=new Set(a.filter(i=>{let s=_.get(i);return x(i).large&&s.intersecting&&s.requested>0}).sort((i,s)=>{let n=_.get(i),m=_.get(s);return Number(m.priority)-Number(n.priority)||m.ratio-n.ratio}).slice(0,2));a.forEach(i=>{let s=_.get(i),n=x(i),m=document.hidden||!s.intersecting?0:s.requested;m>0&&n.large&&!e.has(i)&&(m=0),X(i,m)})},M=e=>{if(!y||h.has(e)||v)return h.get(e);let i=x(e);try{let s=new B(e,z,{...H,...F(),...i.uniforms},{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"low-power"},0,0,Math.min(window.devicePixelRatio||1,o.matches?1.25:1.05),i.maxPixels);return s.canvasElement.setAttribute("aria-hidden","true"),s.canvasElement.tabIndex=-1,h.set(e,s),e.dataset.shaderState="mounted",S(),s}catch{return e.dataset.shaderState="fallback",null}},A=(e,i=2.4,s=360)=>{let n=a.find(f=>f.dataset.liquidSurface===e);if(!n)return;let m=_.get(n);window.clearTimeout(m.timer),m.priority=!0,m.requested=i,m.intersecting&&M(n),S(),m.timer=window.setTimeout(()=>{m.priority=!1,m.requested=m.engaged?x(n).hover:x(n).idle,S()},s)},T=(e,i,s)=>{let n=_.get(e);n&&(n.engaged=s,n.requested=s?x(e).hover:x(e).idle,i.classList.toggle("liquid-engaged",s),S())},j=(e,i)=>{if(t.matches)return;let s=e.getBoundingClientRect(),n=document.createElement("span");n.className="liquid-ripple";let m=Number.isFinite(i.clientX)&&i.clientX>0;n.style.left=`${m?i.clientX-s.left:s.width/2}px`,n.style.top=`${m?i.clientY-s.top:s.height/2}px`,n.addEventListener("animationend",()=>n.remove(),{once:!0}),e.append(n)},R=(e,i=!0)=>{let s=e.querySelector('button[aria-selected="true"], button[aria-expanded="true"], button[aria-pressed="true"]'),n=e.querySelector("[data-liquid-surface]");if(!s||!n)return;let m=_.get(n),f=n.closest("[data-liquid-clip]")||n,U=f.getBoundingClientRect();m.flipAnimation?.cancel();let D=e.getBoundingClientRect(),P=s.getBoundingClientRect();f.style.left=`${P.left-D.left+e.scrollLeft-e.clientLeft}px`,f.style.top=`${P.top-D.top+e.scrollTop-e.clientTop}px`,f.style.width=`${P.width}px`,f.style.height=`${P.height}px`;let E=f.getBoundingClientRect();if(e.hasAttribute("data-liquid-strict")||!i||t.matches||U.width<2||E.width<2||!n.animate)return;let Y=U.left-E.left,Z=U.top-E.top,K=U.width/E.width,Q=U.height/E.height;m.flipAnimation=f.animate([{transform:`translate3d(${Y}px,${Z}px,0) scale(${K},${Q})`,transformOrigin:"0 0"},{transform:"translate3d(0,0,0) scale(1,1)",transformOrigin:"0 0"}],{duration:500,easing:"cubic-bezier(.16,1,.3,1)"})};document.querySelectorAll("[data-liquid-selector]").forEach(e=>{let i=e.querySelector("[data-liquid-surface]");if(!i)return;R(e,!1),document.fonts?.ready.then(()=>{v||R(e,!1)});let s=0,n=new ResizeObserver(()=>{window.clearTimeout(s),s=window.setTimeout(()=>R(e,!1),80)});n.observe(e),p.push(()=>{n.disconnect(),window.clearTimeout(s)});let m=new MutationObserver(()=>requestAnimationFrame(()=>R(e,!0)));e.querySelectorAll("button").forEach(f=>m.observe(f,{attributes:!0,attributeFilter:["aria-selected","aria-expanded","aria-pressed"]})),p.push(()=>m.disconnect()),b(e,"pointerenter",()=>T(i,e,!0)),b(e,"pointerleave",()=>T(i,e,!1)),b(e,"focusin",()=>T(i,e,!0)),b(e,"focusout",f=>{e.contains(f.relatedTarget)||T(i,e,!1)}),b(e,"click",f=>{f.target.closest("button")&&(A(i.dataset.liquidSurface,2.4,360),requestAnimationFrame(()=>{R(e,!0),j(i,f)}))})});let I=new IntersectionObserver(e=>{e.forEach(i=>{let s=i.target,n=_.get(s);n.intersecting=i.isIntersecting,n.ratio=i.intersectionRatio,i.isIntersecting&&s.dataset.liquidProfile!=="transition"&&M(s)}),S()},{threshold:[0,.05,.25,.5,.75],rootMargin:"120px 0px"}),C=()=>{v||a.forEach(e=>I.observe(e))};"requestIdleCallback"in window?window.requestIdleCallback(C,{timeout:900}):window.setTimeout(C,180),p.push(()=>I.disconnect()),b(document,"visibilitychange",S),b(document,"toptal:themechange",()=>{let e=F();h.forEach(i=>i.setUniforms(e))}),b(t,"change",e=>{e.matches&&(h.forEach(i=>i.setSpeed(0)),a.forEach(i=>{i.dataset.shaderSpeed="0"}),document.querySelectorAll(".liquid-ripple").forEach(i=>i.remove()))});let L=()=>{v||(v=!0,p.splice(0).forEach(e=>e()),_.forEach(e=>{window.clearTimeout(e.timer),e.flipAnimation?.cancel()}),h.forEach(e=>e.dispose()),h.clear())};b(window,"pagehide",L,{once:!0}),window.__toptalShaderControl={pulse:A,reconcile:S,dispose:L},window.__toptalShaderDiagnostics={package:"@paper-design/shaders@0.0.69",fragment:"liquidMetalFragmentShader",eligible:y,fallbackReason:V||(y?"":"webgl"),budget:{surfaces:a.length,maxLargeMoving:2,maxPixels:2e5,maxPixelRatio:o.matches?1.25:1.05},device:{hardwareConcurrency:c,deviceMemory:l,lowPower:g},get mounted(){return h.size},get disposed(){return v},get movingLarge(){return a.filter(e=>x(e).large&&Number(e.dataset.shaderSpeed||0)>0).length},get canvasPixels(){return Array.from(h.values()).reduce((e,i)=>e+i.canvasElement.width*i.canvasElement.height,0)},get surfaces(){return a.map(e=>({name:e.dataset.liquidSurface,profile:e.dataset.liquidProfile||"selector",state:e.dataset.shaderState||"static",speed:Number(e.dataset.shaderSpeed||0),authoredIdle:x(e).idle,large:x(e).large,visible:_.get(e)?.intersecting||!1,intersectionRatio:Number((_.get(e)?.ratio||0).toFixed(3))}))}}})();})();
