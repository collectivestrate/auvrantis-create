'use client';

import { useId, useState } from 'react';

function esc(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CSS_CODE = `body {
  font-family: system-ui, sans-serif;
  color: #1d1d1f;
  text-align: center;
  padding: 64px 24px;
}

h1 {
  font-size: 48px;
  letter-spacing: -0.03em;
}

a {
  color: #2d45ff;
}`;

const NOTES = [
  ['<title>', 'The name on the browser tab and in search results. Your city here helps nearby customers find you.'],
  ['<h1>', 'Your main headline. Use one per page.'],
  ['mailto:', 'A link that opens the visitor’s email app, so people can reach you without a form.'],
];

export default function CodeLab({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [name, setName] = useState('Maple Street Bakery');
  const [city, setCity] = useState('Chicago');
  const [service, setService] = useState('Fresh bread and pastries');
  const [tab, setTab] = useState<'html' | 'css'>('html');

  const where = city.trim() ? ` in ${city.trim()}` : '';
  const line = `${service.trim() || 'What you do'}${where}`;
  const title = `${name.trim() || 'Your business'}`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <title>${esc(title)}${where ? ` — ${esc(city.trim())}` : ''}</title>
  <meta name="description" content="${esc(line)}." />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>${esc(title)}</h1>
  <p>${esc(line)}.</p>
  <a href="mailto:hello@example.com">Get in touch</a>
</body>
</html>`;

  return (
    <div className={compact ? 'mk-lab mk-lab-compact' : 'mk-lab'}>
      <div className="mk-lab-fields">
        <label htmlFor={`${id}-name`}>
          Business name
          <input id={`${id}-name`} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
        </label>
        <label htmlFor={`${id}-city`}>
          Your city
          <input id={`${id}-city`} value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label htmlFor={`${id}-service`}>
          What you do
          <input id={`${id}-service`} value={service} maxLength={70} onChange={(e) => setService(e.target.value)} />
        </label>
      </div>

      <div className="mk-lab-stage">
        <div className="mk-lab-preview" aria-label="Website preview">
          <div className="mk-lab-bar" aria-hidden><i /><i /><i /></div>
          <div className="mk-lab-page">
            <h3>{title}</h3>
            <p>{line}.</p>
            <span className="mk-lab-link">Get in touch</span>
          </div>
        </div>

        <div className="mk-lab-code">
          <div className="mk-lab-tabs" role="group" aria-label="Choose code file">
            <button type="button" aria-pressed={tab === 'html'} onClick={() => setTab('html')}>index.html</button>
            <button type="button" aria-pressed={tab === 'css'} onClick={() => setTab('css')}>style.css</button>
          </div>
          <pre tabIndex={0} aria-label={tab === 'html' ? 'HTML code' : 'CSS code'}><code>{tab === 'html' ? html : CSS_CODE}</code></pre>
        </div>
      </div>

      {compact ? null : (
        <dl className="mk-lab-notes">
          {NOTES.map(([term, text]) => (
            <div key={term}>
              <dt><code>{term}</code></dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
