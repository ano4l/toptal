(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.querySelector('.network-heading .carousel-controls')?.setAttribute('role', 'group');
  document.querySelector('[data-ranking-ladder]')?.setAttribute('role', 'group');

  const getFocusable = (container) => Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hidden && element.offsetParent !== null);
  const waitForState = (callback, delay = 170) => window.setTimeout(callback, reduceMotion.matches ? 0 : delay);

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
      const label = button.querySelector('.theme-toggle__label');
      if (label) label.textContent = nextTheme;
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#081321' : '#f4f6f9');
  };

  setTheme(root.dataset.theme || 'light');
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('toptal-concept-theme', theme); } catch (error) { /* Session theme remains available. */ }
  }));

  const profiles = {
    adrian: {
      name: 'Adrian Gonzalez', discipline: 'Verified Expert in Product Management', role: 'AI Product Manager',
      expertise: 'AI Product Management, Product Leadership, Cloud Strategy', image: 'adrian-gonzalez', employerImage: 'microsoft-56.png', employer: 'Microsoft',
      url: 'https://www.toptal.com/product-managers/resume/adrian-gonzalez'
    },
    casey: {
      name: 'Casey Arrington', discipline: 'Verified Expert in Product Management', role: 'Product Manager',
      expertise: 'Product Strategy, Product Design, Agile Product Management', image: 'casey-arrington', employerImage: 'spacex.svg', employer: 'SpaceX',
      url: 'https://www.toptal.com/product-managers/resume/casey-arrington'
    },
    danielle: {
      name: 'Danielle Thompson', discipline: 'Verified Expert in Design', role: 'Product Designer',
      expertise: 'Product Design, UX Design, Data Visualization Design', image: 'danielle-thompson', employerImage: 'stubhub.svg', employer: 'StubHub',
      url: 'https://www.toptal.com/designers/resume/danielle-thompson'
    }
  };

  const megaTriggers = Array.from(document.querySelectorAll('[data-mega-target]'));
  const megaPanels = Array.from(document.querySelectorAll('.mega-menu'));
  const closeMegaMenus = (returnFocus = false) => {
    let activeTrigger = null;
    megaTriggers.forEach((trigger) => {
      if (trigger.getAttribute('aria-expanded') === 'true') activeTrigger = trigger;
      trigger.setAttribute('aria-expanded', 'false');
    });
    megaPanels.forEach((panel) => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); panel.inert = true; });
    if (returnFocus) activeTrigger?.focus();
  };

  megaTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.dataset.megaTarget);
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      closeMegaMenus();
      if (open && panel) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        panel.inert = false;
      }
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      trigger.click();
      requestAnimationFrame(() => getFocusable(document.getElementById(trigger.dataset.megaTarget))[0]?.focus());
    });
  });

  const talentMenuData = {
    designers: profiles.danielle, products: profiles.adrian, projects: profiles.casey,
    developers: profiles.adrian, marketing: profiles.danielle, consultants: profiles.adrian, sales: profiles.casey, teams: profiles.casey
  };
  const serviceMenuData = {
    technology: { kicker: 'Technology Services', title: 'Build and modernize critical technology.', description: 'Expert-led delivery across AI, cloud, data, and product engineering.', image: 'technology-collaboration-960.webp', alt: 'A multidisciplinary team reviewing project plans', url: 'https://www.toptal.com/services/technology-services', cta: 'Explore Technology Services' },
    agency: { kicker: 'Marketing Agency', title: 'Turn strategy into measurable market action.', description: 'Senior marketing leadership across brand, growth, and digital programs.', image: 'marketing-strategy-960.webp', alt: 'A senior team in a marketing strategy workshop', url: 'https://www.toptal.com/services/marketing-agency', cta: 'Explore Marketing Agency' },
    management: { kicker: 'Management Consulting', title: 'Make complex decisions with experienced leadership.', description: 'Strategy, finance, operations, and transformation support.', image: 'management-consulting-960.webp', alt: 'Consultants reviewing an operating plan', url: 'https://www.toptal.com/services/management-consulting', cta: 'Explore Management Consulting' }
  };

  document.querySelectorAll('[data-menu-group]').forEach((group) => {
    const type = group.dataset.menuGroup;
    const panel = document.querySelector(`[data-menu-feature-panel="${type}"]`);
    group.querySelectorAll('[data-feature]').forEach((link) => {
      const update = () => {
        const key = link.dataset.feature;
        panel.classList.add('is-changing');
        waitForState(() => {
          if (type === 'talent') {
            const data = talentMenuData[key] || profiles.adrian;
            panel.querySelector('img').src = `assets/images/profiles/${data.image}-480.webp`;
            panel.querySelector('img').alt = `${data.name}, ${data.discipline.toLowerCase()}`;
            panel.querySelector('.verified').innerHTML = `<b aria-hidden="true">✓</b> ${data.discipline}`;
            panel.querySelector('h2').textContent = data.name;
            panel.querySelector('p').textContent = data.expertise;
            panel.querySelector('a').href = data.url;
            panel.querySelector('a').innerHTML = `View ${data.name.split(' ')[0]}'s profile <span aria-hidden="true">↗</span>`;
          } else {
            const data = serviceMenuData[key] || serviceMenuData.technology;
            panel.querySelector('img').src = `assets/images/services/${data.image}`;
            panel.querySelector('img').alt = data.alt;
            panel.querySelector('.feature-kicker').textContent = data.kicker;
            panel.querySelector('h2').textContent = data.title;
            panel.querySelector('p').textContent = data.description;
            panel.querySelector('a').href = data.url;
            panel.querySelector('a').innerHTML = `${data.cta} <span aria-hidden="true">↗</span>`;
          }
          panel.classList.remove('is-changing');
        });
      };
      link.addEventListener('mouseenter', update);
      link.addEventListener('focus', update);
    });
  });

  document.addEventListener('click', (event) => { if (!event.target.closest('.site-header')) closeMegaMenus(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && megaTriggers.some((trigger) => trigger.getAttribute('aria-expanded') === 'true')) closeMegaMenus(true); });

  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOpenButton = document.querySelector('.mobile-menu-trigger');
  const mobileCloseButton = document.querySelector('.mobile-menu-close');
  const pageShell = document.getElementById('page-shell');
  let mobileCloseTimer = null;

  const openMobileMenu = () => {
    window.clearTimeout(mobileCloseTimer);
    closeMegaMenus();
    mobileMenu.hidden = false;
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileOpenButton.setAttribute('aria-expanded', 'true');
    mobileOpenButton.setAttribute('aria-label', 'Navigation open');
    pageShell.inert = true;
    body.classList.add('menu-open');
    requestAnimationFrame(() => { mobileMenu.classList.add('is-open'); mobileCloseButton.focus(); });
  };
  const closeMobileMenu = () => {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileOpenButton.setAttribute('aria-expanded', 'false');
    mobileOpenButton.setAttribute('aria-label', 'Open navigation');
    pageShell.inert = false;
    body.classList.remove('menu-open');
    mobileOpenButton.focus();
    mobileCloseTimer = window.setTimeout(() => { mobileMenu.hidden = true; }, reduceMotion.matches ? 0 : 270);
  };
  mobileOpenButton.addEventListener('click', openMobileMenu);
  mobileCloseButton.addEventListener('click', closeMobileMenu);
  mobileMenu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeMobileMenu(); return; }
    if (event.key !== 'Tab') return;
    const focusable = getFocusable(mobileMenu);
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { pageShell.inert = false; body.classList.remove('menu-open'); }));
  window.matchMedia('(min-width: 1180px)').addEventListener('change', (event) => { if (event.matches && !mobileMenu.hidden) closeMobileMenu(); });

  const bindTabs = (tabs, activate) => tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault(); activate(tabs[next], true);
    });
  });

  const heroTabs = Array.from(document.querySelectorAll('[data-hero-tab]'));
  const heroPanels = Array.from(document.querySelectorAll('[data-hero-panel]'));
  const activateHero = (tab, focus = false) => {
    heroTabs.forEach((item) => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    heroPanels.forEach((panel) => { const active = panel.dataset.heroPanel === tab.dataset.heroTab; panel.hidden = !active; panel.classList.toggle('is-active', active); });
    if (focus) tab.focus();
  };
  bindTabs(heroTabs, activateHero);

  const profileTabs = Array.from(document.querySelectorAll('[data-profile]'));
  const heroExpert = document.querySelector('[data-hero-expert]');
  const activateProfile = (tab, focus = false) => {
    const data = profiles[tab.dataset.profile];
    profileTabs.forEach((item) => { const active = item === tab; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    heroExpert.classList.add('is-changing');
    waitForState(() => {
      const source = document.getElementById('hero-profile-source');
      const image = document.getElementById('hero-profile-image');
      source.srcset = `assets/images/profiles/${data.image}-480.webp 480w, assets/images/profiles/${data.image}-960.webp 960w`;
      image.src = `assets/images/profiles/${data.image}-960.webp`;
      image.alt = `Portrait of ${data.name}`;
      document.getElementById('hero-profile-discipline').innerHTML = `<b aria-hidden="true">✓</b> ${data.discipline}`;
      document.getElementById('hero-profile-role').textContent = data.role;
      document.getElementById('hero-profile-name').textContent = data.name;
      document.getElementById('hero-profile-expertise').textContent = data.expertise;
      const employerImage = document.getElementById('hero-profile-employer');
      employerImage.src = `assets/images/logos/${data.employerImage}`; employerImage.alt = data.employer;
      document.getElementById('hero-profile-employer-name').textContent = data.employer;
      document.getElementById('hero-profile-link').href = data.url;
      heroExpert.classList.remove('is-changing');
      window.__toptalShaderControl?.pulse('hero-proof', 1.2, 480);
    }, 150);
    if (focus) tab.focus();
  };
  bindTabs(profileTabs, activateProfile);

  let heroTouchX = 0;
  heroExpert.addEventListener('touchstart', (event) => { heroTouchX = event.changedTouches[0].clientX; }, { passive: true });
  heroExpert.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - heroTouchX;
    if (Math.abs(delta) < 45) return;
    const active = profileTabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    const next = delta < 0 ? (active + 1) % profileTabs.length : (active - 1 + profileTabs.length) % profileTabs.length;
    activateProfile(profileTabs[next]);
  }, { passive: true });

  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  const formatNumber = (value) => value >= 1000 ? value.toLocaleString('en-US') : String(value);
  const runCounter = (element) => {
    const finalValue = Number(element.dataset.counter);
    if (reduceMotion.matches) { element.textContent = formatNumber(finalValue); return; }
    const start = performance.now();
    const duration = 680;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatNumber(Math.round(finalValue * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.querySelectorAll('[data-counter]').forEach(runCounter); observer.unobserve(entry.target); }), { threshold: .45 });
    const counterGroup = document.querySelector('[data-count-group]'); if (counterGroup) counterObserver.observe(counterGroup);
  } else counters.forEach(runCounter);

  const networkTabs = Array.from(document.querySelectorAll('[data-network-category]'));
  const networkTrack = document.querySelector('[data-network-track]');
  const expertCards = new Map(Array.from(networkTrack.querySelectorAll('[data-expert-card]')).map((card) => [card.dataset.expertCard, card]));
  const networkDiscovery = networkTrack.querySelector('.network-discovery');
  const networkData = {
    developers: { label: 'Developers', noun: 'software engineers', route: 'https://www.toptal.com/developers', experts: [], skills: ['AI Engineers', 'React Developers', 'Cloud Engineers'], summary: 'Software engineering, architecture, data, cloud, and AI delivery.' },
    designers: { label: 'Designers', noun: 'designers', route: 'https://www.toptal.com/designers', experts: ['danielle'], skills: ['Product Design', 'UX Design', 'UI Design'], summary: 'Product, experience, research, interface, and visual design.' },
    marketing: { label: 'Marketing Experts', noun: 'marketing specialists', route: 'https://www.toptal.com/marketing', experts: [], skills: ['Growth Marketing', 'SEO', 'Brand Strategy'], summary: 'Growth, content, performance, brand, and fractional leadership.' },
    consultants: { label: 'Management Consultants', noun: 'management consultants', route: 'https://www.toptal.com/management-consultants', experts: [], skills: ['Strategy', 'Finance', 'Operations'], summary: 'Strategy, finance, operations, transformation, and M&A.' },
    projects: { label: 'Project Managers', noun: 'project managers', route: 'https://www.toptal.com/project-managers', experts: [], skills: ['Agile Delivery', 'Technical Programs', 'Scrum'], summary: 'Program, project, and technical delivery leadership.' },
    products: { label: 'Product Managers', noun: 'product leaders', route: 'https://www.toptal.com/product-managers', experts: ['adrian', 'casey'], skills: ['AI Product', 'Product Strategy', 'Agile Product'], summary: 'Product direction, ownership, strategy, and delivery.' },
    sales: { label: 'Sales Experts', noun: 'sales specialists', route: 'https://www.toptal.com/sales', experts: [], skills: ['Sales Strategy', 'Revenue Operations', 'Business Development'], summary: 'Revenue strategy, operations, enablement, and execution.' }
  };
  const makeProofCard = (data, index) => {
    const card = document.createElement('article');
    card.className = 'discipline-proof-card';
    card.dataset.disciplineProof = '';
    const kicker = document.createElement('span');
    const title = document.createElement('strong');
    const description = document.createElement('p');
    const link = document.createElement('a');
    link.href = index === 2 ? 'https://www.toptal.com/hire' : data.route;
    if (index === 0) {
      kicker.textContent = `Live ${data.label} directory`;
      title.textContent = `Explore current verified ${data.noun}.`;
      description.textContent = 'Current named profiles are maintained on Toptal’s governed public directory.';
      link.innerHTML = `Browse ${data.label} <b aria-hidden="true">↗</b>`;
    } else if (index === 1) {
      kicker.textContent = 'Representative expertise';
      title.textContent = 'Search the discipline by capability.';
      description.textContent = data.summary;
      const tags = document.createElement('ul');
      tags.className = 'proof-tags';
      tags.replaceChildren(...data.skills.map((skill) => { const item = document.createElement('li'); item.textContent = skill; return item; }));
      card.append(kicker, title, description, tags);
      link.innerHTML = `Explore ${data.label} <b aria-hidden="true">↗</b>`;
      card.append(link);
      return card;
    } else {
      kicker.textContent = 'How matching works';
      title.textContent = 'Build the search around the outcome.';
      description.textContent = 'A Toptal domain expert refines the brief before qualified introductions are made.';
      link.innerHTML = 'Start a talent search <b aria-hidden="true">↗</b>';
    }
    card.append(kicker, title, description, link);
    return card;
  };
  const renderNetwork = (category) => {
    const data = networkData[category];
    const visibleExperts = data.experts.map((id) => expertCards.get(id));
    visibleExperts.forEach((card) => { card.hidden = false; });
    const proofCards = Array.from({ length: 3 - visibleExperts.length }, (_, index) => makeProofCard(data, index));
    networkTrack.replaceChildren(...visibleExperts, ...proofCards, networkDiscovery);
    const status = data.experts.length === 2
      ? `Showing two current verified Product Management experts plus the live ${data.label} directory.`
      : data.experts.length === 1
        ? `Showing one current verified Design expert plus live ${data.label} directory proof.`
        : `Showing the live ${data.label} directory and discipline-level proof. Named profiles appear only where current public profile data is verified.`;
    document.getElementById('network-status').textContent = status;
  };
  const activateNetwork = (tab, focus = false) => {
    networkTabs.forEach((item) => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    document.querySelectorAll('[data-category-card]').forEach((card) => card.classList.toggle('is-selected', card.dataset.categoryCard === tab.dataset.networkCategory));
    document.querySelectorAll('[data-category-select]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.categorySelect === tab.dataset.networkCategory)));
    networkTrack.classList.add('is-changing');
    waitForState(() => {
      renderNetwork(tab.dataset.networkCategory);
      networkTrack.classList.remove('is-changing');
      networkTrack.scrollTo({ left: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      updateNetworkPosition();
    });
    if (focus) tab.focus();
  };
  bindTabs(networkTabs, activateNetwork);
  document.querySelectorAll('[data-category-select]').forEach((button) => button.addEventListener('click', () => {
    const tab = networkTabs.find((item) => item.dataset.networkCategory === button.dataset.categorySelect);
    if (tab) activateNetwork(tab);
  }));

  const updateNetworkPosition = () => {
    const cards = Array.from(networkTrack.children);
    const index = Math.round(networkTrack.scrollLeft / Math.max(1, cards[0].getBoundingClientRect().width + 14));
    document.getElementById('network-position').textContent = `Card ${Math.min(index + 1, cards.length)} of ${cards.length}`;
  };
  const moveTrack = (track, direction) => {
    const first = track.children[0];
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 14;
    track.scrollBy({ left: direction * (first.getBoundingClientRect().width + gap), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  };
  document.querySelector('[data-network-prev]').addEventListener('click', () => moveTrack(networkTrack, -1));
  document.querySelector('[data-network-next]').addEventListener('click', () => moveTrack(networkTrack, 1));
  networkTrack.addEventListener('scrollend', updateNetworkPosition);
  const spotlightNetworkCard = (event) => {
    const card = event.target.closest('.expert-card');
    if (card) networkTrack.querySelectorAll('.expert-card').forEach((item) => item.classList.toggle('is-spotlight', item === card));
  };
  networkTrack.addEventListener('click', spotlightNetworkCard);
  networkTrack.addEventListener('focusin', spotlightNetworkCard);
  renderNetwork(networkTabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.networkCategory || 'products');
  updateNetworkPosition();

  const deliveryPanels = Array.from(document.querySelectorAll('[data-delivery]'));
  const deliveryTabs = deliveryPanels.map((panel) => panel.querySelector('button'));
  const deliveryTrack = document.querySelector('[data-delivery-panels]');
  const activateDelivery = (tab, focus = false) => {
    const index = deliveryTabs.indexOf(tab);
    deliveryPanels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.classList.toggle('is-active', active);
      const itemTab = deliveryTabs[panelIndex]; itemTab.setAttribute('aria-expanded', String(active)); itemTab.tabIndex = active ? 0 : -1;
      panel.querySelector('.delivery-panel__content').hidden = !active && window.innerWidth >= 768;
    });
    document.getElementById('delivery-position').textContent = `${index + 1} of ${deliveryPanels.length}`;
    if (window.innerWidth < 768) deliveryPanels[index].scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    if (focus) tab.focus();
  };
  bindTabs(deliveryTabs, activateDelivery);
  const moveDelivery = (direction) => {
    const active = deliveryTabs.findIndex((tab) => tab.getAttribute('aria-expanded') === 'true');
    const next = (active + direction + deliveryTabs.length) % deliveryTabs.length;
    activateDelivery(deliveryTabs[next]);
  };
  document.querySelector('[data-delivery-prev]').addEventListener('click', () => moveDelivery(-1));
  document.querySelector('[data-delivery-next]').addEventListener('click', () => moveDelivery(1));

  const processConsole = document.querySelector('[data-process-console]');
  const processTabs = Array.from(document.querySelectorAll('[data-process-tab]'));
  const processPanels = Array.from(document.querySelectorAll('[data-process-panel]'));
  const processViewport = document.getElementById('process-panel');
  const processStatus = document.getElementById('process-status');
  let processIndex = 0;
  let processToken = 0;
  let processSwapTimer = 0;
  let processEndTimer = 0;
  const settleProcess = (index, direction, token) => {
    if (token !== processToken) return;
    processPanels.forEach((panel, panelIndex) => {
      panel.classList.remove('is-active', 'is-outgoing', 'is-entering');
      panel.hidden = panelIndex !== index;
    });
    const incoming = processPanels[index];
    incoming.hidden = false;
    incoming.classList.add('is-active', 'is-entering');
    processViewport.setAttribute('aria-labelledby', processTabs[index].id);
    requestAnimationFrame(() => requestAnimationFrame(() => incoming.classList.remove('is-entering')));
    processIndex = index;
    processStatus.textContent = `${processTabs[index].textContent.trim()} selected.`;
    processEndTimer = window.setTimeout(() => { if (token === processToken) delete processConsole.dataset.transitioning; }, 430);
  };
  const activateProcess = (tab, focus = false) => {
    const nextIndex = processTabs.indexOf(tab);
    if (nextIndex < 0) return;
    const direction = nextIndex === processIndex ? 1 : Math.sign(nextIndex - processIndex);
    processTabs.forEach((item, index) => { const active = index === nextIndex; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    processConsole.style.setProperty('--process-index', String(nextIndex));
    processConsole.style.setProperty('--process-direction', String(direction));
    window.clearTimeout(processSwapTimer);
    window.clearTimeout(processEndTimer);
    processToken += 1;
    const token = processToken;
    window.__toptalShaderControl?.pulse('process', 2.2, 480);
    if (reduceMotion.matches || nextIndex === processIndex) {
      settleProcess(nextIndex, direction, token);
    } else {
      processConsole.dataset.transitioning = 'true';
      processPanels[processIndex].classList.add('is-outgoing');
      processSwapTimer = window.setTimeout(() => settleProcess(nextIndex, direction, token), 170);
    }
    if (focus) tab.focus();
  };
  bindTabs(processTabs, activateProcess);

  const expertiseData = {
    developers: { label: 'Developers', title: 'Engineering depth for critical systems.', chips: [['AI Engineers','https://www.toptal.com/developers/artificial-intelligence'],['React Developers','https://www.toptal.com/developers/react'],['Python Developers','https://www.toptal.com/developers/python'],['Full-stack Developers','https://www.toptal.com/developers/full-stack'],['Cloud Engineers','https://www.toptal.com/developers/cloud']], browse: 'https://www.toptal.com/developers', expert: null },
    designers: { label: 'Designers', title: 'Product and experience design for complex work.', chips: [['Product Designers','https://www.toptal.com/designers/product'],['UX Designers','https://www.toptal.com/designers/ux'],['UI Designers','https://www.toptal.com/designers/ui'],['Web Designers','https://www.toptal.com/designers/web'],['UX Researchers','https://www.toptal.com/designers/ux-research']], browse: 'https://www.toptal.com/designers', expert: 'danielle' },
    marketing: { label: 'Marketing Experts', title: 'Strategy and execution across the growth journey.', chips: [['SEO Experts','https://www.toptal.com/marketing/seo'],['Growth Marketers','https://www.toptal.com/marketing/growth'],['Content Marketers','https://www.toptal.com/marketing/content'],['Brand Strategists','https://www.toptal.com/marketing/brand'],['Fractional CMOs','https://www.toptal.com/marketing/fractional-cmo']], browse: 'https://www.toptal.com/marketing', expert: null },
    consultants: { label: 'Management Consultants', title: 'Strategy, finance, and operations leadership.', chips: [['Strategy Consultants','https://www.toptal.com/management-consultants/strategy'],['Finance Experts','https://www.toptal.com/management-consultants/finance'],['Operations Consultants','https://www.toptal.com/management-consultants/operations'],['M&A Consultants','https://www.toptal.com/management-consultants/mergers-acquisitions'],['FP&A Experts','https://www.toptal.com/management-consultants/fpa']], browse: 'https://www.toptal.com/management-consultants', expert: null },
    projects: { label: 'Project Managers', title: 'Program and delivery leadership for moving work.', chips: [['Agile Project Managers','https://www.toptal.com/project-managers/agile'],['Scrum Masters','https://www.toptal.com/project-managers/scrum'],['Technical Project Managers','https://www.toptal.com/project-managers/technical'],['Program Managers','https://www.toptal.com/project-managers/program'],['Digital Project Managers','https://www.toptal.com/project-managers/digital']], browse: 'https://www.toptal.com/project-managers', expert: null },
    products: { label: 'Product Managers', title: 'Product direction, leadership, and delivery.', chips: [['AI Product Management','https://www.toptal.com/product-managers/artificial-intelligence'],['Product Strategy','https://www.toptal.com/product-managers/product-strategy'],['Product Owners','https://www.toptal.com/product-managers/product-owners'],['Data Product Management','https://www.toptal.com/product-managers/data'],['Agile Product Management','https://www.toptal.com/product-managers/agile']], browse: 'https://www.toptal.com/product-managers', expert: 'adrian' },
    sales: { label: 'Sales Experts', title: 'Revenue leadership from strategy through execution.', chips: [['Sales Strategists','https://www.toptal.com/sales/strategy'],['Business Development','https://www.toptal.com/sales/business-development'],['Account Executives','https://www.toptal.com/sales/account-executives'],['Sales Operations','https://www.toptal.com/sales/operations'],['Revenue Leaders','https://www.toptal.com/sales']], browse: 'https://www.toptal.com/sales', expert: null }
  };
  const expertiseTabs = Array.from(document.querySelectorAll('[data-expertise]'));
  const expertiseDetail = document.querySelector('.expertise-detail');
  const expertiseEmpty = document.querySelector('.expertise-empty');
  const updateExpertise = (tab, focus = false) => {
    const data = expertiseData[tab.dataset.expertise];
    expertiseTabs.forEach((item) => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    expertiseDetail.classList.add('is-changing');
    waitForState(() => {
      document.getElementById('expertise-discipline').textContent = data.label;
      document.getElementById('expertise-detail-title').textContent = data.title;
      const chips = document.getElementById('expertise-chips');
      chips.replaceChildren(...data.chips.map(([label, url]) => { const link = document.createElement('a'); link.href = url; link.textContent = label; return link; }));
      const browse = document.getElementById('expertise-browse'); browse.href = data.browse; browse.innerHTML = `Browse all ${data.label} <span aria-hidden="true">↗</span>`;
      const expertCard = document.getElementById('featured-expert');
      const image = document.getElementById('featured-expert-image');
      const verified = document.getElementById('featured-expert-verified');
      const name = document.getElementById('featured-expert-name');
      const role = document.getElementById('featured-expert-role');
      const profileLink = document.getElementById('featured-expert-link');
      if (data.expert) {
        const expert = profiles[data.expert];
        expertCard.classList.remove('is-directory');
        image.hidden = false;
        image.src = `assets/images/profiles/${expert.image}-480.webp`;
        image.alt = `Portrait of ${expert.name}`;
        verified.innerHTML = `<b aria-hidden="true">✓</b> ${expert.discipline}`;
        name.textContent = expert.name;
        role.textContent = expert.role;
        profileLink.href = expert.url;
        profileLink.innerHTML = 'View profile <span aria-hidden="true">↗</span>';
      } else {
        expertCard.classList.add('is-directory');
        image.hidden = true;
        verified.innerHTML = '<b aria-hidden="true">↗</b> Live Toptal directory';
        name.textContent = `Browse ${data.label}`;
        role.textContent = 'Current verified profiles are maintained in the public discipline directory.';
        profileLink.href = data.browse;
        profileLink.innerHTML = `Explore ${data.label} <span aria-hidden="true">↗</span>`;
      }
      expertiseDetail.classList.remove('is-changing');
    });
    if (focus) tab.focus();
  };
  bindTabs(expertiseTabs, updateExpertise);

  const expertiseInput = document.getElementById('expertise-filter');
  const clearSearch = document.querySelector('[data-search-clear]');
  const resetSearch = document.querySelector('[data-search-reset]');
  const filterExpertise = () => {
    const query = expertiseInput.value.trim().toLowerCase();
    const matches = expertiseTabs.filter((tab) => !query || tab.dataset.search.includes(query));
    expertiseTabs.forEach((tab) => { tab.hidden = !matches.includes(tab); });
    clearSearch.hidden = !query;
    expertiseDetail.hidden = matches.length === 0;
    expertiseEmpty.hidden = matches.length !== 0;
    document.getElementById('expertise-status').textContent = matches.length ? `Showing ${matches.length} matching ${matches.length === 1 ? 'discipline' : 'disciplines'}.` : `No disciplines match ${expertiseInput.value.trim()}.`;
    if (matches.length && !matches.some((tab) => tab.getAttribute('aria-selected') === 'true')) updateExpertise(matches[0]);
  };
  expertiseInput.addEventListener('input', filterExpertise);
  const clearExpertise = () => { expertiseInput.value = ''; filterExpertise(); expertiseInput.focus(); };
  clearSearch.addEventListener('click', clearExpertise); resetSearch.addEventListener('click', clearExpertise);

  const serviceData = {
    technology: { kicker: 'Technology Services', name: 'Build and modernize critical technology.', description: 'Move initiatives forward with expert-led delivery across artificial intelligence, cloud, data, and product engineering.', image: 'technology-collaboration', height: 901, alt: 'A technology team collaborating around project plans', capabilities: ['Artificial Intelligence','Cloud Services','Data and Analytics'], url: 'https://www.toptal.com/services/technology-services', cta: 'Explore Technology Services', proof: 'https://www.toptal.com/case-study/precision-drilling-real-time-data-platform-insights', proofLabel: 'Read the Precision Drilling case study' },
    marketing: { kicker: 'Marketing Agency', name: 'Connect market insight to focused execution.', description: 'Bring senior expertise to brand, digital, content, performance, and growth programs.', image: 'marketing-strategy', height: 1000, alt: 'Senior professionals in a marketing strategy workshop', capabilities: ['Brand Strategy','Digital Marketing','Growth Marketing'], url: 'https://www.toptal.com/services/marketing-agency', cta: 'Explore Marketing Agency', proof: 'https://www.toptal.com/clients', proofLabel: 'Explore client case studies' },
    management: { kicker: 'Management Consulting', name: 'Make complex decisions with experienced leadership.', description: 'Shape and execute strategy across finance, operations, organization, and transformation.', image: 'management-consulting', height: 1000, alt: 'Management consultants reviewing an operating plan', capabilities: ['Business Strategy','Finance','Operations'], url: 'https://www.toptal.com/services/management-consulting', cta: 'Explore Management Consulting', proof: 'https://www.toptal.com/clients', proofLabel: 'Explore client case studies' }
  };
  const servicesTabList = document.querySelector('[data-service-tabs]');
  const serviceTabs = Array.from(document.querySelectorAll('[data-service]'));
  const serviceStage = document.querySelector('.service-stage');
  const serviceWipe = document.querySelector('[data-liquid-surface="service-wipe"]');
  const serviceWipeScrim = document.querySelector('.service-wipe-scrim');
  const warmedServiceImages = new Set();
  const warmServiceImage = (key) => {
    const data = serviceData[key];
    if (!data || warmedServiceImages.has(key)) return;
    warmedServiceImages.add(key);
    const image = new Image();
    image.decoding = 'async';
    image.src = `assets/images/services/${data.image}-960.webp`;
  };
  serviceTabs.forEach((tab) => {
    tab.addEventListener('pointerenter', () => warmServiceImage(tab.dataset.service), { passive: true });
    tab.addEventListener('focus', () => warmServiceImage(tab.dataset.service));
  });
  let renderedServiceIndex = 0;
  let serviceToken = 0;
  let serviceSwapTimer = 0;
  let serviceEndTimer = 0;
  let wipeAnimation = null;
  let wipeScrimAnimation = null;
  const updateServiceOverflowCue = () => {
    if (!servicesTabList) return;
    const maxScroll = Math.max(0, servicesTabList.scrollWidth - servicesTabList.clientWidth);
    servicesTabList.classList.toggle('has-more-before', servicesTabList.scrollLeft > 8);
    servicesTabList.classList.toggle('has-more-after', servicesTabList.scrollLeft < maxScroll - 8);
  };
  const centerServiceTab = (tab) => {
    if (window.innerWidth >= 768 || !servicesTabList) return;
    tab.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    window.setTimeout(updateServiceOverflowCue, reduceMotion.matches ? 0 : 420);
  };
  servicesTabList?.addEventListener('scroll', updateServiceOverflowCue, { passive: true });
  window.addEventListener('resize', updateServiceOverflowCue, { passive: true });
  requestAnimationFrame(updateServiceOverflowCue);
  const setServiceContent = (data) => {
    document.getElementById('service-image-source-mobile').srcset = `assets/images/services/${data.image}-960.webp`;
    document.getElementById('service-image-source').srcset = `assets/images/services/${data.image}-960.webp 960w, assets/images/services/${data.image}-1600.webp 1600w`;
    const image = document.getElementById('service-image'); image.src = `assets/images/services/${data.image}-960.webp`; image.alt = data.alt;
    document.getElementById('service-kicker').textContent = data.kicker;
    document.getElementById('service-name').textContent = data.name;
    document.getElementById('service-description').textContent = data.description;
    const list = document.getElementById('service-capabilities'); list.replaceChildren(...data.capabilities.map((label) => { const item = document.createElement('li'); item.textContent = label; return item; }));
    const cta = document.getElementById('service-cta'); cta.href = data.url; cta.querySelector('span').textContent = data.cta;
    const proof = document.getElementById('service-proof'); proof.href = data.proof; proof.innerHTML = `${data.proofLabel} <span aria-hidden="true">↗</span>`;
  };
  const activateService = (tab, focus = false) => {
    const data = serviceData[tab.dataset.service];
    const nextIndex = serviceTabs.indexOf(tab);
    serviceTabs.forEach((item) => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    centerServiceTab(tab);
    window.clearTimeout(serviceSwapTimer);
    window.clearTimeout(serviceEndTimer);
    wipeAnimation?.cancel();
    wipeScrimAnimation?.cancel();
    serviceToken += 1;
    const token = serviceToken;
    const direction = nextIndex === renderedServiceIndex ? 1 : Math.sign(nextIndex - renderedServiceIndex);
    const fallback = reduceMotion.matches || document.documentElement.classList.contains('liquid-static-fallback') || !serviceWipe?.animate;
    if (fallback) {
      setServiceContent(data);
      renderedServiceIndex = nextIndex;
      delete serviceStage.dataset.transitionState;
    } else {
      serviceStage.dataset.transitionState = 'exiting';
      window.__toptalShaderControl?.pulse('service-wipe', 2.6, 620);
      const origin = direction > 0 ? '0% 50%' : '100% 50%';
      const clearX = direction > 0 ? '100%' : '-100%';
      wipeAnimation = serviceWipe.animate([
        { opacity: .96, transform: 'translate3d(0,0,0) scaleX(0)', transformOrigin: origin, offset: 0 },
        { opacity: 1, transform: 'translate3d(0,0,0) scaleX(1)', transformOrigin: origin, offset: .4 },
        { opacity: 1, transform: 'translate3d(0,0,0) scaleX(1)', transformOrigin: origin, offset: .58 },
        { opacity: .98, transform: `translate3d(${clearX},0,0) scaleX(1)`, transformOrigin: origin, offset: 1 }
      ], { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' });
      wipeScrimAnimation = serviceWipeScrim.animate([{ opacity: 0 }, { opacity: .58, offset: .36 }, { opacity: .58, offset: .58 }, { opacity: 0 }], { duration: 620, easing: 'linear' });
      serviceSwapTimer = window.setTimeout(() => {
        if (token !== serviceToken) return;
        setServiceContent(data);
        renderedServiceIndex = nextIndex;
        serviceStage.dataset.transitionState = 'entering';
      }, 250);
      serviceEndTimer = window.setTimeout(() => {
        if (token !== serviceToken) return;
        delete serviceStage.dataset.transitionState;
      }, 620);
    }
    if (focus) tab.focus();
  };
  bindTabs(serviceTabs, activateService);

  const revealTargets = Array.from(document.querySelectorAll('.reveal-mask, [data-reveal-group]'));
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }), { threshold: .18, rootMargin: '0px 0px -10% 0px' });
    revealTargets.forEach((target) => revealObserver.observe(target));
    const ladder = document.querySelector('[data-ranking-ladder]');
    const rankingObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }), { threshold: .22 });
    rankingObserver.observe(ladder);
  } else {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
    document.querySelector('[data-ranking-ladder]').classList.add('is-visible');
  }

  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width - .5) * 6}px`);
        element.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height - .5) * 6}px`);
      });
      element.addEventListener('pointerleave', () => { element.style.setProperty('--mx', '0px'); element.style.setProperty('--my', '0px'); });
    });
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(1100px) rotateX(${(-y * 4.4).toFixed(2)}deg) rotateY(${(x * 4.4).toFixed(2)}deg) translate3d(${(x * 4).toFixed(2)}px, ${(y * 4).toFixed(2)}px, 0)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  const footerDetails = Array.from(document.querySelectorAll('.footer-groups details'));
  const footerMedia = window.matchMedia('(max-width: 767px)');
  const updateFooterAccordions = (mobile) => footerDetails.forEach((detail) => { detail.open = !mobile; });
  updateFooterAccordions(footerMedia.matches);
  footerMedia.addEventListener('change', (event) => updateFooterAccordions(event.matches));
  document.querySelector('[data-back-to-top]').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' }));
})();
