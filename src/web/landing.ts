// The pilot form on the landing page. Nothing is sent or stored: this is a prototype, so a
// valid submission only shows, in plain words, what would happen next.
const form = document.getElementById('pilot-form') as HTMLFormElement;
const error = document.getElementById('p-error')!, done = document.getElementById('p-done')!;
const field = (id: string) => document.getElementById(id) as HTMLInputElement;

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = field('p-name').value.trim(), email = field('p-email').value.trim(), company = field('p-company').value.trim();
  const problem = !name ? ['p-name', 'Please add your name.']
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? ['p-email', 'Please add a work email we could reply to.']
    : !company ? ['p-company', 'Please add your company.'] : null;
  for (const id of ['p-name', 'p-email', 'p-company']) field(id).removeAttribute('aria-invalid');
  if (problem) { error.textContent = problem[1]; error.hidden = false; field(problem[0]).setAttribute('aria-invalid', 'true'); field(problem[0]).focus(); return; }
  error.hidden = true;
  const size = (document.getElementById('p-size') as HTMLSelectElement).value;
  done.replaceChildren();
  const title = document.createElement('strong'); title.textContent = `Thanks, ${name.split(/\s+/)[0]}.`;
  const body = document.createElement('p');
  body.textContent = `In a live launch, this would reach the Lull team, and we’d reply to ${email} within two working days with a pilot plan for ${company} (${size}). This prototype didn’t send or save anything.`;
  done.append(title, body); done.hidden = false;
  form.querySelector('button[type=submit]')!.setAttribute('disabled', '');
});
