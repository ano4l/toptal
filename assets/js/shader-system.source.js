import { ShaderMount, liquidMetalFragmentShader } from '@paper-design/shaders';

(() => {
  'use strict';

  const surfaces = Array.from(document.querySelectorAll('[data-liquid-surface]'));
  if (!surfaces.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const saveData = navigator.connection?.saveData === true;
  const hardwareConcurrency = Number(navigator.hardwareConcurrency || 0);
  const deviceMemory = Number(navigator.deviceMemory || 0);
  const lowCoreCount = hardwareConcurrency > 0 && hardwareConcurrency <= 4;
  const lowMemory = deviceMemory > 0 && deviceMemory <= 4;
  const lowPower = (lowCoreCount && lowMemory) || (deviceMemory > 0 && deviceMemory <= 2);
  const mounts = new Map();
  const cleanups = [];
  let disposed = false;

  const profiles = {
    selector: { idle: 0.64, hover: 1.1, large: false, maxPixels: 70000, uniforms: { u_repetition: 4, u_softness: 0.5, u_angle: 45, u_scale: 8, u_shape: 0 } },
    hero: { idle: 0.52, hover: 0.72, large: true, maxPixels: 190000, uniforms: { u_repetition: 2.8, u_softness: 0.56, u_angle: 58, u_scale: 6.8, u_shape: 0 } },
    horizon: { idle: 0.28, hover: 0.46, large: true, maxPixels: 130000, uniforms: { u_repetition: 4.8, u_softness: 0.5, u_angle: 7, u_scale: 9.2, u_shape: 0 } },
    ambient: { idle: 0.24, hover: 0.42, large: true, maxPixels: 150000, uniforms: { u_repetition: 3, u_softness: 0.56, u_angle: 62, u_scale: 7, u_shape: 0 } },
    stage: { idle: 0.27, hover: 0.48, large: true, maxPixels: 145000, uniforms: { u_repetition: 3.5, u_softness: 0.53, u_angle: 34, u_scale: 7.4, u_shape: 0 } },
    process: { idle: 0.3, hover: 0.52, large: true, maxPixels: 145000, uniforms: { u_repetition: 3.2, u_softness: 0.52, u_angle: 24, u_scale: 7.6, u_shape: 0 } },
    proof: { idle: 0.3, hover: 0.5, large: true, maxPixels: 165000, uniforms: { u_repetition: 4.6, u_softness: 0.48, u_angle: 72, u_scale: 9, u_shape: 0 } },
    transition: { idle: 0, hover: 0, large: true, maxPixels: 200000, uniforms: { u_repetition: 2.4, u_softness: 0.58, u_angle: 12, u_scale: 6.6, u_shape: 0 } }
  };
  const profileFor = (surface) => profiles[surface.dataset.liquidProfile] || profiles.selector;
  const surfaceState = new Map(surfaces.map((surface) => [surface, {
    intersecting: false,
    ratio: 0,
    engaged: false,
    priority: false,
    requested: profileFor(surface).idle,
    timer: 0,
    flipAnimation: null
  }]));

  const fallbackReason = reduceMotion.matches ? 'reduced-motion' : saveData ? 'save-data' : lowPower ? 'low-power' : '';
  const canUseWebGL = () => {
    if (fallbackReason) return false;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'low-power' });
      context?.getExtension('WEBGL_lose_context')?.loseContext();
      return Boolean(context);
    } catch (error) {
      return false;
    }
  };
  const webglEligible = canUseWebGL();
  document.documentElement.classList.add(webglEligible ? 'liquid-webgl-eligible' : 'liquid-static-fallback');
  if (!webglEligible) document.documentElement.dataset.liquidFallback = fallbackReason || 'webgl';

  const themeUniforms = () => document.documentElement.dataset.theme === 'dark'
    ? { u_colorBack: [0.008, 0.02, 0.07, 1], u_colorTint: [0.34, 0.48, 0.96, 0.76] }
    : { u_colorBack: [0.018, 0.055, 0.19, 1], u_colorTint: [0.125, 0.31, 0.81, 0.78] };
  const baseUniforms = {
    u_repetition: 4,
    u_softness: 0.5,
    u_shiftRed: 0.3,
    u_shiftBlue: 0.3,
    u_distortion: 0,
    u_contour: 0,
    u_angle: 45,
    u_scale: 8,
    u_shape: 0,
    u_offsetX: 0.1,
    u_offsetY: -0.1,
    u_isImage: false
  };

  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const applySpeed = (surface, speed) => {
    const mount = mounts.get(surface);
    if (!mount) return;
    mount.setSpeed(speed);
    surface.dataset.shaderSpeed = String(speed);
  };

  const reconcileSpeeds = () => {
    const allowedLarge = new Set(surfaces
      .filter((surface) => {
        const state = surfaceState.get(surface);
        return profileFor(surface).large && state.intersecting && state.requested > 0;
      })
      .sort((a, b) => {
        const aState = surfaceState.get(a);
        const bState = surfaceState.get(b);
        return Number(bState.priority) - Number(aState.priority) || bState.ratio - aState.ratio;
      })
      .slice(0, 2));
    surfaces.forEach((surface) => {
      const state = surfaceState.get(surface);
      const profile = profileFor(surface);
      let speed = document.hidden || !state.intersecting ? 0 : state.requested;
      if (speed > 0 && profile.large && !allowedLarge.has(surface)) speed = 0;
      applySpeed(surface, speed);
    });
  };

  const mountSurface = (surface) => {
    if (!webglEligible || mounts.has(surface) || disposed) return mounts.get(surface);
    const profile = profileFor(surface);
    try {
      const mount = new ShaderMount(
        surface,
        liquidMetalFragmentShader,
        { ...baseUniforms, ...themeUniforms(), ...profile.uniforms },
        { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' },
        0,
        0,
        Math.min(window.devicePixelRatio || 1, finePointer.matches ? 1.25 : 1.05),
        profile.maxPixels
      );
      mount.canvasElement.setAttribute('aria-hidden', 'true');
      mount.canvasElement.tabIndex = -1;
      mounts.set(surface, mount);
      surface.dataset.shaderState = 'mounted';
      reconcileSpeeds();
      return mount;
    } catch (error) {
      surface.dataset.shaderState = 'fallback';
      return null;
    }
  };

  const pulse = (name, speed = 2.4, duration = 360) => {
    const surface = surfaces.find((item) => item.dataset.liquidSurface === name);
    if (!surface) return;
    const state = surfaceState.get(surface);
    window.clearTimeout(state.timer);
    state.priority = true;
    state.requested = speed;
    if (state.intersecting) mountSurface(surface);
    reconcileSpeeds();
    state.timer = window.setTimeout(() => {
      state.priority = false;
      state.requested = state.engaged ? profileFor(surface).hover : profileFor(surface).idle;
      reconcileSpeeds();
    }, duration);
  };

  const engageSurface = (surface, host, engaged) => {
    const state = surfaceState.get(surface);
    if (!state) return;
    state.engaged = engaged;
    state.requested = engaged ? profileFor(surface).hover : profileFor(surface).idle;
    host.classList.toggle('liquid-engaged', engaged);
    reconcileSpeeds();
  };

  const createRipple = (surface, event) => {
    if (reduceMotion.matches) return;
    const rect = surface.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'liquid-ripple';
    const hasPointerOrigin = Number.isFinite(event.clientX) && event.clientX > 0;
    ripple.style.left = `${hasPointerOrigin ? event.clientX - rect.left : rect.width / 2}px`;
    ripple.style.top = `${hasPointerOrigin ? event.clientY - rect.top : rect.height / 2}px`;
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    surface.append(ripple);
  };

  const updateSelectorGeometry = (selector, animate = true) => {
    const active = selector.querySelector('button[aria-selected="true"], button[aria-expanded="true"], button[aria-pressed="true"]');
    const surface = selector.querySelector('[data-liquid-surface]');
    if (!active || !surface) return;
    const state = surfaceState.get(surface);
    const movingElement = surface.closest('[data-liquid-clip]') || surface;
    const first = movingElement.getBoundingClientRect();
    state.flipAnimation?.cancel();
    const selectorRect = selector.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    movingElement.style.left = `${activeRect.left - selectorRect.left + selector.scrollLeft - selector.clientLeft}px`;
    movingElement.style.top = `${activeRect.top - selectorRect.top + selector.scrollTop - selector.clientTop}px`;
    movingElement.style.width = `${activeRect.width}px`;
    movingElement.style.height = `${activeRect.height}px`;
    const last = movingElement.getBoundingClientRect();
    if (selector.hasAttribute('data-liquid-strict')) return;
    if (!animate || reduceMotion.matches || first.width < 2 || last.width < 2 || !surface.animate) return;
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;
    state.flipAnimation = movingElement.animate([
      { transform: `translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`, transformOrigin: '0 0' },
      { transform: 'translate3d(0,0,0) scale(1,1)', transformOrigin: '0 0' }
    ], { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' });
  };

  document.querySelectorAll('[data-liquid-selector]').forEach((selector) => {
    const surface = selector.querySelector('[data-liquid-surface]');
    if (!surface) return;
    updateSelectorGeometry(selector, false);
    document.fonts?.ready.then(() => { if (!disposed) updateSelectorGeometry(selector, false); });
    let resizeTimer = 0;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => updateSelectorGeometry(selector, false), 80);
    });
    resizeObserver.observe(selector);
    cleanups.push(() => { resizeObserver.disconnect(); window.clearTimeout(resizeTimer); });
    const mutationObserver = new MutationObserver(() => requestAnimationFrame(() => updateSelectorGeometry(selector, true)));
    selector.querySelectorAll('button').forEach((button) => mutationObserver.observe(button, { attributes: true, attributeFilter: ['aria-selected', 'aria-expanded', 'aria-pressed'] }));
    cleanups.push(() => mutationObserver.disconnect());
    listen(selector, 'pointerenter', () => engageSurface(surface, selector, true));
    listen(selector, 'pointerleave', () => engageSurface(surface, selector, false));
    listen(selector, 'focusin', () => engageSurface(surface, selector, true));
    listen(selector, 'focusout', (event) => { if (!selector.contains(event.relatedTarget)) engageSurface(surface, selector, false); });
    listen(selector, 'click', (event) => {
      if (!event.target.closest('button')) return;
      pulse(surface.dataset.liquidSurface, 2.4, 360);
      requestAnimationFrame(() => { updateSelectorGeometry(selector, true); createRipple(surface, event); });
    });
  });

  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const surface = entry.target;
      const state = surfaceState.get(surface);
      state.intersecting = entry.isIntersecting;
      state.ratio = entry.intersectionRatio;
      if (entry.isIntersecting && surface.dataset.liquidProfile !== 'transition') mountSurface(surface);
    });
    reconcileSpeeds();
  }, { threshold: [0, 0.05, 0.25, 0.5, 0.75], rootMargin: '120px 0px' });
  const startObservation = () => {
    if (disposed) return;
    surfaces.forEach((surface) => intersectionObserver.observe(surface));
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(startObservation, { timeout: 900 });
  else window.setTimeout(startObservation, 180);
  cleanups.push(() => intersectionObserver.disconnect());

  listen(document, 'visibilitychange', reconcileSpeeds);
  listen(document, 'toptal:themechange', () => {
    const uniforms = themeUniforms();
    mounts.forEach((mount) => mount.setUniforms(uniforms));
  });
  listen(reduceMotion, 'change', (event) => {
    if (!event.matches) return;
    mounts.forEach((mount) => mount.setSpeed(0));
    surfaces.forEach((surface) => { surface.dataset.shaderSpeed = '0'; });
    document.querySelectorAll('.liquid-ripple').forEach((ripple) => ripple.remove());
  });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cleanups.splice(0).forEach((cleanup) => cleanup());
    surfaceState.forEach((state) => { window.clearTimeout(state.timer); state.flipAnimation?.cancel(); });
    mounts.forEach((mount) => mount.dispose());
    mounts.clear();
  };
  listen(window, 'pagehide', dispose, { once: true });

  window.__toptalShaderControl = { pulse, reconcile: reconcileSpeeds, dispose };
  window.__toptalShaderDiagnostics = {
    package: '@paper-design/shaders@0.0.69',
    fragment: 'liquidMetalFragmentShader',
    eligible: webglEligible,
    fallbackReason: fallbackReason || (webglEligible ? '' : 'webgl'),
    budget: { surfaces: surfaces.length, maxLargeMoving: 2, maxPixels: 200000, maxPixelRatio: finePointer.matches ? 1.25 : 1.05 },
    device: { hardwareConcurrency, deviceMemory, lowPower },
    get mounted() { return mounts.size; },
    get disposed() { return disposed; },
    get movingLarge() { return surfaces.filter((surface) => profileFor(surface).large && Number(surface.dataset.shaderSpeed || 0) > 0).length; },
    get canvasPixels() { return Array.from(mounts.values()).reduce((total, mount) => total + mount.canvasElement.width * mount.canvasElement.height, 0); },
    get surfaces() { return surfaces.map((surface) => ({ name: surface.dataset.liquidSurface, profile: surface.dataset.liquidProfile || 'selector', state: surface.dataset.shaderState || 'static', speed: Number(surface.dataset.shaderSpeed || 0), authoredIdle: profileFor(surface).idle, large: profileFor(surface).large, visible: surfaceState.get(surface)?.intersecting || false, intersectionRatio: Number((surfaceState.get(surface)?.ratio || 0).toFixed(3)) })); }
  };
})();
