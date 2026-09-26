const selectedTopics = new Set();
const chips = document.querySelectorAll('.chips button');
const continueButton = document.querySelector('.continue-button');

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('is-selected');
    const key = chip.textContent.trim();
    chip.classList.contains('is-selected') ? selectedTopics.add(key) : selectedTopics.delete(key);
    continueButton.disabled = selectedTopics.size < 3;
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

continueButton.addEventListener('click', () => {
  if (continueButton.disabled) return;
  document.body.classList.add('is-leaving');
  window.setTimeout(() => { window.location.href = 'membership.html'; }, 260);
});
