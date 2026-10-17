(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tema claro/escuro, com memória segura */
  const themeBtn = $('#theme');
  const setTheme = t => {
    root.dataset.theme = t;
    themeBtn.innerHTML = `<i class="fa-solid fa-${t === 'dark' ? 'sun' : 'moon'}"></i>`;
    $('meta[name=theme-color]').content = t === 'dark' ? '#0f1a23' : '#f1f5f9';
  };
  let saved = null;
  try { saved = localStorage.getItem('tema'); } catch (e) {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(t);
    try { localStorage.setItem('tema', t); } catch (e) {}
  });

  /* Revelar elementos ao entrar no ecrã */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* Secção ativa: muda o matiz do fundo e o item do menu */
  const sections = $$('main section[id]');
  const links = $$('nav a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    root.style.setProperty('--hue', e.target.dataset.hue);
    links.forEach(a => a.classList.toggle('active', a.dataset.link === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* Scroll: progresso, cabeçalho, botão de topo e linha do tempo */
  const bar = $('#progress'), header = $('#top-bar'), toTop = $('#toTop');
  const tl = $('#timeline'), steps = $$('li', tl);
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY, max = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 10);
    header.classList.toggle('hide', y > lastY && y > 400);
    toTop.classList.toggle('show', y > 700);
    document.body.classList.toggle('moved', y > 40);
    lastY = y;

    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height));
    tl.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    steps.forEach(li => li.classList.toggle('on', li.getBoundingClientRect().top < innerHeight * .6));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* Texto que se escreve sozinho */
  const out = $('#typed');
  const words = ['sites responsivos', 'interfaces elegantes', 'projetos no GitHub', 'a minha evolução'];
  if (reduced) { out.textContent = words[0]; return; }
  let w = 0, c = 0, del = false;
  const tick = () => {
    const word = words[w];
    out.textContent = word.slice(0, c += del ? -1 : 1);
    let wait = del ? 35 : 80;
    if (!del && c === word.length) { del = true; wait = 1600; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 400; }
    setTimeout(tick, wait);
  };
  tick();
})();
