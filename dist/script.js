document.getElementById('year').textContent = new Date().getFullYear();

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!motionPreference.matches) {
  const characters = [];
  document.querySelectorAll('[data-type-text]').forEach((line) => {
    const spans = Array.from(line.textContent, (letter) => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.className = 'typing-character';
      characters.push(span);
      return span;
    });
    line.replaceChildren(...spans);
  });

  let index = 0;
  const finishTyping = () => {
    clearInterval(typingTimer);
    characters.forEach((character) => {
      character.classList.add('is-typed');
      character.classList.remove('typing-cursor');
    });
  };
  const typingTimer = setInterval(() => {
    if (index > 0) characters[index - 1].classList.remove('typing-cursor');
    if (index === characters.length) {
      finishTyping();
      return;
    }
    characters[index].classList.add('is-typed', 'typing-cursor');
    index += 1;
  }, 65);

  motionPreference.addEventListener('change', (event) => {
    if (event.matches) finishTyping();
  });
}

if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const sections = document.querySelectorAll('.section-heading, .work-placeholder, .about-statement, .about-bottom, .skills-grid');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach((section) => {
    section.classList.add('reveal', 'reveal-pending');
    observer.observe(section);
  });

  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      observer.disconnect();
      sections.forEach((section) => section.classList.remove('reveal-pending'));
    }
  });
}

const menu = document.querySelector('.menu');
menu.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => { menu.open = false; });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
document.addEventListener('click', (event) => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
});

// Scroll controls only the entrance; normal document scrolling stays intact.
const experienceSection = document.querySelector('.experience-section');
const experienceMotion = window.matchMedia('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)');
let experienceFrame = null;
const updateExperience = () => {
  experienceFrame = null;
  if (!experienceMotion.matches) return;
  const top = experienceSection.getBoundingClientRect().top;
  const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.3 - top) / (window.innerHeight * 0.65)));
  experienceSection.style.setProperty('--experience-progress', progress.toFixed(4));
};
const queueExperience = () => {
  if (experienceMotion.matches && experienceFrame === null) {
    experienceFrame = requestAnimationFrame(updateExperience);
  }
};
const configureExperience = () => {
  if (experienceFrame !== null) cancelAnimationFrame(experienceFrame);
  experienceFrame = null;
  experienceSection.classList.toggle('experience-animated', experienceMotion.matches);
  experienceSection.style.setProperty('--experience-progress', '1');
  updateExperience();
};
window.addEventListener('scroll', queueExperience, { passive: true });
window.addEventListener('resize', queueExperience);
experienceMotion.addEventListener('change', configureExperience);
configureExperience();

const projectTrack = document.getElementById('project-track');
const projectCards = Array.from(projectTrack.querySelectorAll('.featured-project'));
const previousProject = document.getElementById('previous-project');
const nextProject = document.getElementById('next-project');
const projectCounter = document.querySelector('.project-counter');
let activeProject = 0;
let projectScrollTimer;
const syncProjects = () => {
  activeProject = projectCards.reduce((nearest, card, index) =>
    Math.abs(card.offsetLeft - projectTrack.scrollLeft) < Math.abs(projectCards[nearest].offsetLeft - projectTrack.scrollLeft) ? index : nearest, 0);
  previousProject.disabled = activeProject === 0;
  nextProject.disabled = activeProject === projectCards.length - 1;
  projectCounter.textContent = `${String(activeProject + 1).padStart(2, '0')} / ${String(projectCards.length).padStart(2, '0')}`;
};
const showProject = (direction) => {
  syncProjects();
  const index = Math.max(0, Math.min(projectCards.length - 1, activeProject + direction));
  projectTrack.scrollTo({ left: projectCards[index].offsetLeft, behavior: motionPreference.matches ? 'auto' : 'smooth' });
};
previousProject.hidden = nextProject.hidden = projectCards.length < 2;
previousProject.addEventListener('click', () => showProject(-1));
nextProject.addEventListener('click', () => showProject(1));
projectTrack.addEventListener('scroll', () => {
  clearTimeout(projectScrollTimer);
  projectScrollTimer = setTimeout(syncProjects, 120);
}, { passive: true });
projectTrack.addEventListener('keydown', (event) => {
  if (event.target === projectTrack && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    showProject(event.key === 'ArrowRight' ? 1 : -1);
  }
});
window.addEventListener('resize', syncProjects);
syncProjects();
