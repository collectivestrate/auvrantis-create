import type { Metadata } from 'next';
import Link from 'next/link';
import CodeLab from '@/components/code-lab';
import { MkFooter, MkNav } from '@/components/mk-chrome';

export const metadata: Metadata = {
  title: 'Learn to build a website — Auvrantis Create',
  description: 'Short, plain-English lessons on how a website is made, with the real code beside each one.',
  alternates: { canonical: 'https://auvrantis-create.vercel.app/learn' },
};

const lessons = [
  {
    title: 'What a website is made of',
    body: 'Every website is built from three languages. HTML says what is on the page. CSS says how it looks. JavaScript makes it respond to clicks and typing. A simple business site needs mostly HTML and CSS.',
    code: `<!-- HTML: what is on the page -->
<h1>Maple Street Bakery</h1>

/* CSS: how it looks */
h1 { color: #1d1d1f; }`,
  },
  {
    title: 'Write a headline people understand',
    body: 'The h1 is the biggest line on your page. Say who you are and what you do in plain words. Use one h1 per page, so visitors and search engines know what the page is about.',
    code: `<h1>Fresh bread in Chicago</h1>
<p>Baked every morning on Maple Street.</p>`,
  },
  {
    title: 'Choose color and type',
    body: 'CSS properties are like labels on a form. color is the text color, background is what is behind it, and font-family picks the letters. Pick one accent color and use it for links and buttons.',
    code: `body {
  color: #1d1d1f;
  background: #ffffff;
  font-family: system-ui, sans-serif;
}

a {
  color: #2d45ff;
}`,
  },
  {
    title: 'Add sections and a way to reach you',
    body: 'A section groups a heading with its text. The order in your code is the order on the page. For contact, a mailto link opens the visitor’s email app, so you do not need a form to get started.',
    code: `<section>
  <h2>Our bread</h2>
  <p>Sourdough, rye and seeded loaves.</p>
</section>

<a href="mailto:hello@example.com">
  Email us
</a>`,
  },
  {
    title: 'Help nearby customers find you',
    body: 'The title and description are what people see in search results. Put your business, what you do and your city in them in natural words. Good descriptions help people choose you, but no one can promise a ranking.',
    code: `<title>Maple Street Bakery — Chicago</title>
<meta
  name="description"
  content="Fresh bread and pastries in Chicago."
/>`,
  },
  {
    title: 'Put it online',
    body: 'Export your site from the Studio as one HTML file. Upload it to any web host, then point your own domain name at it. To change it later, edit and export again, or open the file in any editor or assistant.',
    code: `my-site/
  index.html   <- your exported page
  logo.png     <- optional images`,
  },
];

export default function Learn() {
  return (
    <main className="mk">
      <MkNav />

      <section className="mk-hero">
        <div className="mk-wrap">
          <h1>Learn how a website works.</h1>
          <p>Six short lessons in plain English. Each one shows the real code, and each one you can try in the Studio.</p>
          <div className="mk-hero-actions">
            <Link className="mk-btn" href="/studio">Open the Studio</Link>
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-mist" aria-labelledby="try-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="try-title">Try it first.</h2>
            <p>Change the details and watch the page and its code update together.</p>
          </div>
          <CodeLab />
        </div>
      </section>

      <section className="mk-section" aria-labelledby="lessons-title">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <h2 id="lessons-title">The lessons</h2>
            <p>Take them in order, or jump to what you need.</p>
          </div>
          <div className="mk-lessons">
            {lessons.map((lesson, index) => (
              <article className="mk-lesson" key={lesson.title}>
                <div>
                  <span className="mk-lesson-num" aria-hidden>{index + 1}</span>
                  <h2>{lesson.title}</h2>
                  <p>{lesson.body}</p>
                  <Link className="mk-lesson-try" href="/studio">Try it in the Studio</Link>
                </div>
                <pre tabIndex={0} aria-label={`Code for lesson ${index + 1}`}><code>{lesson.code}</code></pre>
              </article>
            ))}
          </div>
        </div>
      </section>

      <MkFooter />
    </main>
  );
}
