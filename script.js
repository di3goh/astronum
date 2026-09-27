document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (link.target === '_blank' || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => { window.location.href = link.href; }, 260);
  });
});

const openModal = (modal) => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); };
const closeModal = (modal) => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
const toast = document.querySelector('.toast');
document.querySelector('.write-trigger')?.addEventListener('click', (event) => { event.preventDefault(); toast.classList.add('is-visible'); window.clearTimeout(window.__toastTimer); window.__toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800); });
document.querySelectorAll('.story-trigger').forEach((trigger) => trigger.addEventListener('click', (event) => { event.preventDefault(); openModal(document.querySelector('.story-modal')); }));
document.querySelectorAll('.auth-trigger').forEach((trigger) => trigger.addEventListener('click', (event) => { event.preventDefault(); const modal = document.querySelector('.auth-modal'); modal.querySelector('.auth-title').textContent = trigger.dataset.mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido'; modal.querySelector('.auth-subtitle').textContent = trigger.dataset.mode === 'register' ? 'Regístrate en Astronum para empezar a leer' : 'Ingresa a Astronum para empezar a leer'; modal.querySelector('.auth-submit').firstChild.textContent = trigger.dataset.mode === 'register' ? 'Registrarme ' : 'Ingresar '; openModal(modal); }));
document.querySelectorAll('.modal-close').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.overlay-modal'))));
document.querySelectorAll('.overlay-modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.overlay-modal.is-open').forEach(closeModal); });

const hero = document.querySelector('.hero');
const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (motionAllowed && window.gsap) {
  gsap.utils.toArray('.button').forEach((button) => {
    const shine = button.querySelector('.button-shine');
    if (!shine) return;
    gsap.set(shine, { xPercent: -175 });
    const playShine = () => {
      gsap.killTweensOf(shine);
      gsap.fromTo(shine, { xPercent: -175 }, { xPercent: 250, duration: .72, ease: 'power2.inOut' });
    };
    button.addEventListener('mouseenter', playShine);
    button.addEventListener('focus', playShine);
  });
}

const AURORA_PALETTE = {
  ink: [0.002, 0.005, 0.012],
  navy: [0.004, 0.018, 0.075],
  blue: [0.008, 0.075, 0.30],
  cyan: [0.015, 0.42, 0.66],
  violet: [0.20, 0.035, 0.52],
  magenta: [0.72, 0.08, 0.72],
};

const canvas = document.querySelector('.gradient-canvas');
if (canvas) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (gl) {
    const vertex = 'attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}';
    const fragment = `precision highp float;
      uniform vec2 r; uniform float t; uniform vec2 m; uniform sampler2D tex;
      uniform vec3 ink, navy, blue, cyan, violet, magenta;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(7.7,3.1);a*=.5;}return v;}
      float segmentDistance(vec2 point,vec2 start,vec2 end){vec2 path=end-start;return length(point-start-path*clamp(dot(point-start,path)/dot(path,path),0.,1.));}
      float bezierDistance(vec2 point,vec2 a,vec2 b,vec2 c,vec2 d){float closest=9.;vec2 previous=a;for(int i=1;i<=28;i++){float progress=float(i)/28.;float inverse=1.-progress;vec2 current=inverse*inverse*inverse*a+3.*inverse*inverse*progress*b+3.*inverse*progress*progress*c+progress*progress*progress*d;closest=min(closest,segmentDistance(point,previous,current));previous=current;}return closest;}
      void main(){
        vec2 uv=gl_FragCoord.xy/r;
        float aspect=r.x/r.y;
        vec2 p=(uv-.5)*vec2(aspect,1.);
        float time=t*.07;
        vec2 pointer=vec2(m.x*aspect*.055,m.y*.055);
        p+=pointer;

        // A slow, cyclical domain warp keeps the ribbons organic without making them noisy.
        vec2 warp=vec2(
          fbm(p*1.45+vec2(sin(time),cos(time*.83))*1.7),
          fbm(p*1.55+vec2(cos(time*.71),sin(time*1.13))*1.7)
        )-.5;
        vec2 q=p+warp*.025;

        // Cover the viewport while preserving the 16:9 texture composition.
        vec2 texUv=uv;
        float imageAspect=16.0/9.0;
        if(aspect>imageAspect) texUv.y=(texUv.y-.5)*aspect/imageAspect+.5;
        else texUv.x=(texUv.x-.5)*imageAspect/aspect+.5;
        vec2 flow=vec2(
          sin(texUv.y*7.0+time*.31)+sin(texUv.x*4.0-time*.21),
          cos(texUv.x*6.0-time*.27)+sin(texUv.y*5.0+time*.18)
        )*.0025+warp*.012;
        texUv+=flow;
        // Two connected Bézier strokes form the broad, luminous bend in the reference.
        vec2 curveOffset=vec2(sin(t*.23)*.010,cos(t*.31)*.016);
        float topBend=bezierDistance(q,vec2(1.65,.50)+curveOffset,vec2(1.32,.26)+curveOffset,vec2(.33,.48)+curveOffset,vec2(.12,.13)+curveOffset);
        float lowerBend=bezierDistance(q,vec2(.12,.13)+curveOffset,vec2(.10,-.20)+curveOffset,vec2(.45,-.48)+curveOffset,vec2(.79,-.50)+curveOffset);
        float tubeDistance=min(topBend,lowerBend);
        float blueHalo=exp(-pow(tubeDistance/.245,2.));
        float softLight=exp(-pow(tubeDistance/.115,2.));
        float whiteCore=exp(-pow(tubeDistance/.052,2.));
        float travel=q.x*4.1-q.y*1.7-t*1.35;
        float livingLight=.82+.18*sin(travel);
        float glint=pow(max(0.,sin(travel*1.8+.7)),10.)*.26;
        float textureGrain=texture2D(tex,texUv).b;
        float colorReveal=smoothstep(1.35,2.45,t);
        float colorTime=max(t-1.35,0.)*.45;
        float bluePhase=.5+.5*sin(colorTime-1.57);
        float violetPhase=.5+.5*sin(colorTime-3.66);
        float neonPhase=pow(.5+.5*sin(colorTime-5.75),2.);

        // The base slowly travels from near-black through electric blue and violet, with restrained neon blooms.
        vec3 base=vec3(.003,.004,.012);
        base+=vec3(.006,.030,.145)*bluePhase*colorReveal;
        base+=vec3(.050,.010,.150)*violetPhase*colorReveal;
        base+=vec3(.030,.010,.070)*neonPhase*colorReveal;
        vec3 col=mix(base,base+vec3(.025,.05,.23),textureGrain*.42);
        col+=vec3(.015,.035,.20)*blueHalo*(.92+glint);
        col+=vec3(.13,.31,.93)*softLight*livingLight;
        col+=vec3(.75,.86,1.0)*whiteCore*(livingLight+glint);
        col+=vec3(.05,.12,.70)*exp(-dot((q-vec2(-.08,.06))*vec2(.82,1.15),(q-vec2(-.08,.06))*vec2(.82,1.15))*1.6);
        col+=vec3(.20,.025,.42)*neonPhase*colorReveal*blueHalo*.28;

        // Soft interaction light, kept subordinate to the art-directed flow.
        float mouseGlow=exp(-dot(p-pointer*8.,p-pointer*8.)/.22);
        col+=vec3(.045,.09,.16)*mouseGlow*.22;

        float depth=fbm(q*2.3+vec2(time*.04,-time*.025));
        col+=vec3(.004,.008,.022)*depth;
        float vign=1.-smoothstep(.48,1.24,length(p*vec2(.72,1.14)));
        col*=mix(.56,1.,vign);
        float grain=(noise(gl_FragCoord.xy*.47+t*.035)-.5)*.004;
        col+=grain;
        gl_FragColor=vec4(max(col,0.),1.);
      }`;
    const compile = (type, source) => { const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader); return shader; };
    const program=gl.createProgram(); gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex)); gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment)); gl.linkProgram(program); gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const timeLoc=gl.getUniformLocation(program,'t'), resLoc=gl.getUniformLocation(program,'r'), mouseLoc=gl.getUniformLocation(program,'m');
    Object.entries(AURORA_PALETTE).forEach(([name, color]) => gl.uniform3fv(gl.getUniformLocation(program, name), color));
    const texture=gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([2,5,14,255]));
    gl.uniform1i(gl.getUniformLocation(program,'tex'),0);
    const textureImage=new Image();
    textureImage.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,textureImage);};
    textureImage.src='assets/abstract-dark-blue-texture.jpg';
    let mx=0,my=0,targetX=0,targetY=0,lastFrame=0;
    const resize=()=>{const d=Math.min(devicePixelRatio||1,1.35);canvas.width=innerWidth*d;canvas.height=innerHeight*d;gl.viewport(0,0,canvas.width,canvas.height);};resize();addEventListener('resize',resize);
    hero.addEventListener('pointermove',(e)=>{const b=hero.getBoundingClientRect();targetX=((e.clientX-b.left)/b.width-.5)*2;targetY=-((e.clientY-b.top)/b.height-.5)*2;});
    hero.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
    const draw=(now)=>{requestAnimationFrame(draw);if(document.hidden||now-lastFrame<33)return;lastFrame=now;mx+=(targetX-mx)*.055;my+=(targetY-my)*.055;gl.uniform1f(timeLoc,motionAllowed?now*.001:0.);gl.uniform2f(resLoc,canvas.width,canvas.height);gl.uniform2f(mouseLoc,mx,my);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};requestAnimationFrame(draw);
  }
}

if (hero && motionAllowed) {
  let frameId;
  let pointerX = 0;
  let pointerY = 0;

  const updateGradient = () => {
    hero.style.setProperty('--mouse-x', pointerX.toFixed(3));
    hero.style.setProperty('--mouse-y', pointerY.toFixed(3));
    hero.style.setProperty('--spot-x', `${((pointerX + 1) * 50).toFixed(1)}%`);
    hero.style.setProperty('--spot-y', `${((pointerY + 1) * 50).toFixed(1)}%`);
    frameId = undefined;
  };

  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    pointerY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    if (!frameId) frameId = requestAnimationFrame(updateGradient);
  });

  hero.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    if (!frameId) frameId = requestAnimationFrame(updateGradient);
  });
}
