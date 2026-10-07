const zoomButton = document.querySelector('#zoom');
const diagram = document.querySelector('#preparation-diagram');

zoomButton.addEventListener('click', () => {
  const expanded = zoomButton.getAttribute('aria-pressed') !== 'true';
  diagram.classList.toggle('is-expanded', expanded);
  zoomButton.setAttribute('aria-pressed', String(expanded));
  zoomButton.textContent = expanded ? 'Ajustar diagrama' : 'Ampliar diagrama';
});

document.querySelector('#print-guide').addEventListener('click', () => window.print());

document.querySelectorAll('article').forEach((article, index) => {
  const video = article.querySelector('video');
  const speed = article.querySelector('.speed');
  const label = article.querySelector('h3').textContent.trim();
  const videoId = `tutorial-video-${index}`;
  video.id = videoId;
  speed.setAttribute('aria-label', `Velocidad: ${label}`);
  speed.setAttribute('aria-controls', videoId);
  speed.addEventListener('change', () => {
    video.playbackRate = Number(speed.value);
  });
});
