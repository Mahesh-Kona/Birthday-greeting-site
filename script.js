function openGiftBox() {
  // Require password to open; name is hardcoded to Teju when successful.
  const MAX_ATTEMPTS = 3;
  let attempts = 0;
  let ok = false;
  while(attempts < MAX_ATTEMPTS){
    const pw = prompt('Enter password to open the gift:', '');
    if(pw === null){ // user cancelled
      return;
    }
    if(pw === 'teju321') { ok = true; break; }
    attempts++;
    alert('Incorrect password. Please try again.');
  }
  if(!ok){ alert('Failed to open the gift.'); return; }

  const nameEl = document.getElementById('greet-name');
  if(nameEl) nameEl.innerHTML = 'Happy Birthday,<span class="name-signature">Teju</span>!';

  // Animate the lid
  const lid = document.querySelector('.lid');
  if(lid) lid.classList.add('open');
  // Stop the bounce animation on box
  const box = document.getElementById('gift-box');
  if(box) box.style.animation = 'none';

  // After animation, reveal the greeting and then hide the box (more robust)
  setTimeout(function() {
    try{
      const container = document.getElementById('gift-box-container');
      const greeting = document.getElementById('greeting');

      // Show greeting first so user always sees something
      if(greeting) greeting.style.display = 'flex';

      // entrance animations and particles

      const msg = document.getElementById('message');
      const portrait = document.getElementById('portrait');
      const title = document.getElementById('greet-name');
      const spot = document.querySelector('.bg-spot');
      if(spot) spot.classList.add('show');

      // Ensure canvas (particles) is behind the message so it doesn't visually block content
      try{
        const canvas = document.getElementById('confetti-canvas');
        if(canvas){ canvas.style.zIndex = '9990'; canvas.style.pointerEvents = 'none'; }
      }catch(e){ /* ignore */ }

      // Make message visible immediately, then run the staged entrance animation (like before)
      if(msg){
        msg.style.opacity = '1';
        msg.style.transform = 'scale(1) translateY(0)';
      }

      // small delay for dramatic timing (restores previous staged animation)
      setTimeout(()=>{
        try{
          if(msg) msg.classList.add('entered');
          if(portrait) portrait.classList.add('pulse');
          if(title) {
            title.classList.add('pop');
            setTimeout(()=> title.classList.remove('pop'), 900);
          }

          // start particle/typing/music but guard each call
          try{ startHearts(); }catch(e){ console.warn('startHearts failed', e); }
          try{ startTyping(); }catch(e){ console.warn('startTyping failed', e); }
          try{ playBackgroundMusic(); }catch(e){ console.warn('playBackgroundMusic failed', e); }
          try{ startFallingElements(); }catch(e){ console.warn('startFallingElements failed', e); }

        }catch(e){ console.warn('staged animation failed', e); }
      }, 160);

      // hide the gift container after we've shown the greeting (avoid covering the greeting)
      if(container){ setTimeout(()=>{ container.style.display = 'none'; }, 300); }

    }catch(err){
      console.error('Greeting open error', err);
      try{ alert('An error occurred while opening the greeting: ' + (err && err.message ? err.message : err)); }catch(e){}
      // best-effort fallback: show greeting and keep gift hidden
      const container = document.getElementById('gift-box-container'); if(container) container.style.display = 'none';
      const greeting = document.getElementById('greeting'); if(greeting) greeting.style.display = 'flex';
    }
  }, 700);
}

/* Typing effect */
const linesDefault = [
"You're always special to me✨" ,
  
];
function startTyping(){
  const el = document.getElementById('typed');
  el.textContent = '';
  const lines = linesDefault.slice();
  let lineIndex = 0; let charIndex = 0;

  function typeChar(){
    if(lineIndex>=lines.length) return;
    const line = lines[lineIndex];
    if(charIndex < line.length){
      el.textContent += line[charIndex++];
      setTimeout(typeChar, 36 + Math.random()*40);
    } else {
      // pause then next line
      charIndex = 0; lineIndex++;
      if(lineIndex < lines.length){ el.textContent += '\n'; setTimeout(typeChar, 800); }
    }
  }
  typeChar();
}

/* Simple confetti */
let heartAnimId = null;
function startHearts(){
  const canvas = document.getElementById('confetti-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#ff6ba6','#ffd6e5','#ffb3d1','#ff9fb8','#ff9fb8'];
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize();
  window.addEventListener('resize', resize);

  function drawHeart(ctx,x,y,s,color,angle){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle*Math.PI/180);
    ctx.scale(s,s);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(-0.5,-0.5,-1.2,0.1,-1.2,0.6);
    ctx.bezierCurveTo(-1.2,1.4,-0.2,1.9,0,2.4);
    ctx.bezierCurveTo(0.2,1.9,1.2,1.4,1.2,0.6);
    ctx.bezierCurveTo(1.2,0.1,0.5,-0.5,0,0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function spawn(){
    const w = canvas.width, h = canvas.height;
    for(let i=0;i<10;i++){
      particles.push({
        x: w*0.5 + (Math.random()-0.5)*220,
        y: h*0.65 + Math.random()*60,
        s: 6 + Math.random()*6,
        vx: (Math.random()-0.5)*0.6,
        vy: - (1 + Math.random()*2.6),
        color: colors[Math.floor(Math.random()*colors.length)],
        angle: (Math.random()*60)-30,
        life: 200 + Math.random()*240,
        alpha: 1
      });
    }
  }

  function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy *= 0.995; p.angle += (p.vx*4);
      p.life -= 1; if(p.life<60) p.alpha = p.life/60;
      ctx.globalAlpha = Math.max(0, p.alpha);
      drawHeart(ctx, p.x, p.y, p.s/18, p.color, p.angle);
      ctx.globalAlpha = 1;
      if(p.y < -60 || p.alpha <= 0) particles.splice(i,1);
    }
  }

  let frames = 0;
  function loop(){
    frames++;
    // increase spawn frequency for a livelier confetti
    if(frames % 4 === 0) spawn();
    update();
    heartAnimId = requestAnimationFrame(loop);
  }

  // run for a while then gracefully stop
  loop();
  setTimeout(()=>{
    cancelAnimationFrame(heartAnimId);
    heartAnimId = null;
    window.removeEventListener('resize', resize);
    // clear canvas gently
    try{ ctx.clearRect(0,0,canvas.width,canvas.height); }catch(e){}
  }, 10000);
}

/* Autoplay helper */
function playBackgroundMusic(){
  const a = document.getElementById('bg-music');
  if(!a) return;
  try{
    a.volume = 0.65;
    const p = a.play();
    if(p && p.then) p.catch(()=>{});
  }catch(e){ /* ignore autoplay errors */ }
}

// Portrait load/error handling: show placeholder if image missing
try{
  const portraitImg = document.getElementById && document.getElementById('portrait');
  const portraitPlaceholder = document.getElementById && document.getElementById('portrait-placeholder');
  if(portraitImg){
    // hide placeholder when image loads
    portraitImg.addEventListener('load', function(){
      if(portraitPlaceholder) portraitPlaceholder.style.display = 'none';
      portraitImg.style.display = 'block';
    });
    portraitImg.addEventListener('error', function(){
      if(portraitPlaceholder) portraitPlaceholder.style.display = 'flex';
      portraitImg.style.display = 'none';
    });
    // If image already loaded (cache), trigger load handler
    if(portraitImg.complete && portraitImg.naturalWidth){
      if(portraitPlaceholder) portraitPlaceholder.style.display = 'none';
      portraitImg.style.display = 'block';
    }
  }
}catch(e){ /* non-fatal */ }

/* Falling decorative elements (petals/hearts) inside the .bg-spot area */
function startFallingElements(count = 18){
  // Use a full-page overlay so items start from the top of the page
  let global = document.getElementById('global-falls');
  if(!global){
    global = document.createElement('div');
    global.id = 'global-falls';
    document.body.appendChild(global);
  }
  const spot = global;
  if(!spot) return;
  // Use ice-cream and chocolate themed shapes per request
  const shapes = ['🍦','🍨','🍫','🍫','🍬','🍩','🍪'];
  const created = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('span');
    el.className = 'falling';
    el.textContent = shapes[Math.floor(Math.random()*shapes.length)];
    // random horizontal position across the page
    const left = Math.random()*100;
    el.style.left = left + '%';
    // start near the top (allow small random vertical offset so items don't all align)
    el.style.top = (-6 - Math.random()*6) + 'vh';
    const scale = 0.8 + Math.random()*1.4;
    // larger base so icons are clearly visible
    el.style.fontSize = Math.round(16*scale) + 'px';
    // vary duration for a more organic fall
    const dur = 3000 + Math.floor(Math.random()*6000);
    el.style.animation = `fallDown ${dur}ms cubic-bezier(.15,.7,.25,1) forwards`;
    // stagger the start slightly
    const delay = Math.floor(Math.random()*900);
    el.style.animationDelay = delay + 'ms';
    // gentle sideways offset using transform (and small sway via CSS animation later)
    const offset = (Math.random()-0.5)*60;
    el.style.transform = `translateX(${offset}px)`;
    spot.appendChild(el);
    created.push(el);
    // remove after animation completes
    setTimeout(()=>{ try{ el.remove(); }catch(e){} }, dur + delay + 200);
  }
  // repeat a couple more waves for fullness, but reduce growth to avoid overload
  setTimeout(()=> startFallingElements(Math.max(8, Math.floor(count*0.65))), 1600 + Math.random()*800);
}

/* Small share helper */
function shareLove(){
  try{
    if(navigator.share){ navigator.share({ title: document.title, text: document.getElementById('greet-name').textContent }); }
    else { alert('Copy the URL and send it to her — she will love it!'); }
  }catch(e){ alert('Unable to share from this browser.'); }
}
