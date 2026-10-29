// Learning Center Pro courses. The first lesson of each course is a free
// preview; the rest unlock with a Starter or Unlimited plan.
// The code course extends the Maple Street Bakery site from the free course.

import type { Lesson } from './learn-content';

export type ProLesson = Omit<Lesson, 'part'> & { preview: boolean };

export type ProCourse = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  level: string;
  lessons: ProLesson[];
};

export const proCourses: ProCourse[] = [
  {
    slug: 'code-a-full-website',
    title: 'Code a full website',
    tagline: 'Go from one page to a complete multi-page site with a form and JavaScript.',
    description: 'Pick up where the free course ends. Add more pages and shared navigation, build an accessible contact form, learn the JavaScript basics, make a mobile menu, and finish a site you can be proud of.',
    level: 'After the free course',
    lessons: [
      {
        slug: 'plan-a-multi-page-site',
        preview: true,
        title: 'Plan a multi-page site',
        summary: 'Decide which pages you need, organize your files, and link pages together with relative links.',
        minutes: 15,
        outcomes: [
          'Choose the pages your site needs',
          'Organize files and folders so links keep working',
          'Write relative links between pages',
        ],
        steps: [
          {
            title: 'Decide when you need more than one page',
            text: [
              'A one-page site is perfect while you have a little to say. Add separate pages when a section grows too long to scan, or when visitors arrive looking for one specific thing, such as your full menu or a way to contact you.',
              'For Maple Street Bakery we will build three pages: a homepage, a full menu page and a contact page with a form.',
            ],
          },
          {
            title: 'Organize your files',
            text: [
              'Keep every page in the top level of your `my-website` folder, and put images in their own `images` folder. One shared `style.css` styles every page, and one shared `script.js` adds behavior to every page. Change it once and the whole site updates.',
            ],
            code: {
              file: 'Your website folder',
              code: `my-website/
  index.html     homepage
  menu.html      full menu
  contact.html   contact form
  style.css      styles for every page
  script.js      JavaScript for every page
  images/
    bakery.jpg`,
            },
          },
          {
            title: 'Link pages with relative links',
            text: [
              'A relative link points to another file in your own site, starting from where the current page is. Because all three pages sit in the same folder, the link is just the file name. If you move a file into a folder, include the folder name, as in `images/bakery.jpg`.',
            ],
            code: {
              file: 'index.html',
              code: `<a href="menu.html">Our menu</a>
<a href="contact.html">Contact</a>
<img src="images/bakery.jpg" alt="A baker shaping sourdough loaves on a floured wooden table">`,
            },
            tip: 'Relative links keep working when you move your whole folder to a web host, because they do not include your computer’s folder names or your domain.',
          },
          {
            title: 'Give every page its own title and description',
            text: [
              'Each page needs a `<title>` and meta description that describe that page, not the whole site. Put the page name first and the business name second, so each tab and search result is easy to tell apart.',
            ],
            code: {
              file: 'contact.html',
              code: `<title>Contact — Maple Street Bakery</title>
<meta name="description" content="Order a cake or ask a question. Maple Street Bakery, Chicago.">`,
            },
          },
        ],
        mistakes: [
          { problem: 'Links break after uploading the site.', fix: 'Check for links that start with `file:///` or include your computer’s folder names. Replace them with relative links such as `menu.html`.' },
          { problem: 'Capital letters in file names.', fix: 'Many web hosts treat `Menu.html` and `menu.html` as different files. Use lowercase everywhere.' },
        ],
        checklist: [
          'I listed the pages my site needs',
          'My pages, `style.css` and `script.js` are in one folder, with images in `images`',
          'Every page has its own title and description',
        ],
      },
      {
        slug: 'shared-navigation',
        preview: false,
        title: 'Build shared navigation',
        summary: 'Use the same header on every page and show visitors which page they are on.',
        minutes: 20,
        outcomes: [
          'Copy one header to every page',
          'Mark the current page with aria-current',
          'Style the current page link so it stands out',
        ],
        steps: [
          {
            title: 'Write the header once',
            text: [
              'Every page gets the same header with the same links. This version adds a menu button you will make work in a later lesson. `aria-controls` tells assistive technology which element the button opens, and `aria-expanded="false"` says the menu starts closed.',
            ],
            code: {
              file: 'every page',
              code: `<header class="site-header">
  <a class="logo" href="index.html">Maple Street Bakery</a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
  <nav id="site-nav" class="site-nav" aria-label="Main">
    <a href="index.html">Home</a>
    <a href="menu.html">Our menu</a>
    <a href="contact.html" aria-current="page">Contact</a>
  </nav>
</header>`,
            },
          },
          {
            title: 'Mark the current page',
            text: [
              'On each page, add `aria-current="page"` to the link for that page only. Screen readers announce it as the current page, and you can style it with CSS. In the example above, the attribute is on Contact because this is the contact page. On `menu.html`, move it to the Our menu link.',
            ],
          },
          {
            title: 'Style the navigation',
            text: [
              'An attribute selector, written in square brackets, styles elements that have a certain attribute. Here the current page link is darker and bolder than the others.',
            ],
            code: {
              file: 'style.css',
              code: `.site-nav {
  display: flex;
  gap: 24px;
}

.site-nav a {
  color: var(--muted);
  text-decoration: none;
}

.site-nav a[aria-current="page"] {
  color: var(--ink);
  font-weight: 600;
}`,
            },
          },
          {
            title: 'Keep every copy the same',
            text: [
              'When you change the header, change it on every page. Copy the whole block from one page and paste it over the others, then move `aria-current` to the right link on each page. Bigger sites use tools that build pages from one shared header automatically. You will meet those in the Automation course.',
            ],
          },
        ],
        mistakes: [
          { problem: 'Two links are marked as current.', fix: 'Only one link on each page should have `aria-current="page"`.' },
          { problem: 'A page is missing from the menu.', fix: 'After adding a page, update the header on every existing page, not just the new one.' },
        ],
        checklist: [
          'Every page has the same header',
          'Each page marks its own link with `aria-current="page"`',
          'The current page link looks different from the others',
        ],
      },
      {
        slug: 'build-a-contact-form',
        preview: false,
        title: 'Build an accessible contact form',
        summary: 'Create a form with labels, the right input types, and required fields.',
        minutes: 25,
        outcomes: [
          'Build a form with labels and inputs',
          'Choose input types that help phones show the right keyboard',
          'Understand where form submissions go',
        ],
        steps: [
          {
            title: 'Start the form',
            text: [
              'A `<form>` groups the fields. `method="post"` sends the answers privately in the request rather than in the address bar. `action` is the address that receives the answers. A plain HTML website cannot store messages by itself, so you need a form service to receive them. For now, use the placeholder address below; you will connect a real service in the Automation course.',
            ],
            code: {
              file: 'contact.html',
              code: `<form class="contact-form" action="https://example.com/your-form-endpoint" method="post">
  <!-- fields go here -->
</form>`,
            },
          },
          {
            title: 'Add labeled fields',
            text: [
              'Every field needs a `<label>`. The label’s `for` must match the field’s `id`, so clicking the label focuses the field and screen readers read the label aloud. The `name` is the key that arrives with each answer.',
              '`type="email"` shows an email keyboard on phones and checks the format. `autocomplete` lets browsers fill in saved details. `required` stops the form being sent while the field is empty.',
            ],
            code: {
              file: 'contact.html',
              code: `<label for="name">Your name</label>
<input id="name" name="name" type="text" autocomplete="name" required>

<label for="email">Email address</label>
<input id="email" name="email" type="email" autocomplete="email" required>`,
            },
          },
          {
            title: 'Add a choice, a message box and a button',
            text: [
              'A `<select>` gives a list of choices. A `<textarea>` is a box for longer messages, and `rows` sets its height. Finish with a `<button type="submit">`.',
            ],
            code: {
              file: 'contact.html',
              code: `<label for="topic">What is it about?</label>
<select id="topic" name="topic">
  <option>A question</option>
  <option>Cake order</option>
  <option>Something else</option>
</select>

<label for="message">Message</label>
<textarea id="message" name="message" rows="5" required></textarea>

<button class="button" type="submit">Send message</button>`,
            },
          },
          {
            title: 'Style the form',
            text: [
              'Grid stacks the labels and fields with even spacing. `font: inherit` makes fields use the same font as the rest of the page; browsers use a different font for fields by default. The `:focus` rule gives a clear blue outline to whichever field the visitor is typing in.',
            ],
            code: {
              file: 'style.css',
              code: `.contact-form {
  display: grid;
  gap: 8px;
  max-width: 560px;
}

.contact-form label {
  margin-top: 12px;
  font-weight: 600;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  font: inherit;
}

.contact-form input:focus,
.contact-form select:focus,
.contact-form textarea:focus {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

.contact-form button {
  justify-self: start;
  margin-top: 16px;
  cursor: pointer;
}`,
            },
          },
        ],
        mistakes: [
          { problem: 'Clicking a label does nothing.', fix: 'The label’s `for` must exactly match the field’s `id`.' },
          { problem: 'Using placeholder text instead of labels.', fix: 'Placeholder text disappears as soon as someone types and is often too faint to read. Always use a visible label.' },
          { problem: 'Asking for more than you need.', fix: 'Every extra field means fewer people finish the form. Ask only for what you will actually use.' },
        ],
        checklist: [
          'Every field has a visible label connected with `for` and `id`',
          'The email field uses `type="email"`',
          'Required fields have `required`, and the form has a clear submit button',
        ],
      },
      {
        slug: 'javascript-basics',
        preview: false,
        title: 'JavaScript basics',
        summary: 'Add a script to your pages, find elements, and change them. Your first lines of real code.',
        minutes: 30,
        outcomes: [
          'Connect a JavaScript file to every page',
          'Use variables, functions and conditions',
          'Find an element on the page and change it',
        ],
        steps: [
          {
            title: 'Connect your script',
            text: [
              'Create `script.js` in your folder and add this line inside `<head>` on every page. `defer` tells the browser to run the script after the page has loaded, so your code can find every element.',
            ],
            code: {
              file: 'every page',
              code: `<script src="script.js" defer></script>`,
            },
          },
          {
            title: 'Find an element and change it',
            text: [
              '`document.querySelector` finds the first element that matches a CSS selector. `const` creates a variable, a named box that holds a value. Here it holds the footer’s year so we can update it.',
              'The `if` checks that the element exists before changing it, so the script does not break on a page without a footer year. `new Date().getFullYear()` is the current year, so your footer never goes out of date.',
            ],
            code: {
              file: 'script.js',
              code: `// Keep the copyright year up to date
const year = document.querySelector('#year');
if (year) {
  year.textContent = new Date().getFullYear();
}`,
            },
          },
          {
            title: 'Add the element it changes',
            text: [
              'Wrap the year in your footer in a `<span>` with an `id`, so the script can find it. Keep the year written in the HTML too, so the footer still makes sense if JavaScript does not run.',
            ],
            code: {
              file: 'every page',
              code: `<footer class="site-footer">
  <p>© <span id="year">2026</span> Maple Street Bakery</p>
</footer>`,
            },
          },
          {
            title: 'Open the console to see errors',
            text: [
              'When JavaScript has a mistake, the browser stops running it and writes an error in the console. Right-click the page, choose Inspect, and open the Console tab. Each error names the file and line number. Read it from the top; the first error is usually the real cause.',
            ],
            tip: 'JavaScript is picky about spelling and capital letters. `querySelector` works; `queryselector` does not.',
          },
        ],
        mistakes: [
          { problem: 'My script does nothing.', fix: 'Check that the `<script>` tag has `defer`, that the file name matches exactly, and look in the console for errors.' },
          { problem: 'Mixing up `=` and `===`.', fix: 'One equals sign stores a value. Three equals signs compare two values.' },
        ],
        checklist: [
          'Every page loads `script.js` with `defer`',
          'The footer year updates itself',
          'I know how to open the console and read an error',
        ],
      },
      {
        slug: 'mobile-menu',
        preview: false,
        title: 'Make a mobile menu',
        summary: 'Hide the navigation behind a button on small screens and open it with JavaScript.',
        minutes: 25,
        outcomes: [
          'Show a menu button only on small screens',
          'Respond to a click with an event listener',
          'Keep the menu accessible with aria-expanded',
        ],
        steps: [
          {
            title: 'Style the button and hide the links on phones',
            text: [
              'On large screens, the button is hidden and the links show in a row. On small screens, the button appears and the links are hidden until the menu is opened. The class `is-open` is what JavaScript will add to show them.',
            ],
            code: {
              file: 'style.css',
              code: `.menu-toggle {
  display: none;
  padding: 8px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  font: inherit;
}

@media (max-width: 720px) {
  .site-header {
    flex-wrap: wrap;
  }

  .menu-toggle {
    display: block;
  }

  .site-nav {
    display: none;
    flex-direction: column;
    width: 100%;
    gap: 12px;
    padding-top: 16px;
  }

  .site-nav.is-open {
    display: flex;
  }
}`,
            },
          },
          {
            title: 'Listen for clicks',
            text: [
              '`addEventListener` runs a function whenever something happens, here a click on the button. The function reads whether the menu is open, flips it, and updates both the button’s `aria-expanded` and the menu’s class.',
              '`classList.toggle` adds the class when the second value is true and removes it when it is false. Add this to the end of `script.js`.',
            ],
            code: {
              file: 'script.js',
              code: `// Open and close the menu on small screens
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
  });
}`,
            },
          },
          {
            title: 'Test it',
            text: [
              'Make your browser window narrow. The links should disappear and the Menu button should appear. Click it: the links open. Click again: they close. Then try it with the keyboard by pressing Tab to reach the button and Enter to open it.',
            ],
          },
        ],
        mistakes: [
          { problem: 'The menu opens but never closes.', fix: 'Make sure you compare with `=== \'true\'`. `getAttribute` returns text, not a true or false value.' },
          { problem: 'Using a link or a div as the menu button.', fix: 'Use a real `<button>`. It works with the keyboard and screen readers automatically.' },
        ],
        checklist: [
          'The Menu button appears only on small screens',
          'Clicking it opens and closes the links',
          '`aria-expanded` changes between `true` and `false`',
        ],
      },
      {
        slug: 'finish-and-polish',
        preview: false,
        title: 'Finish and polish your site',
        summary: 'Speed up images, add a browser tab icon and a friendly error page, then check everything.',
        minutes: 20,
        outcomes: [
          'Make images load faster with lazy loading',
          'Add a favicon and a 404 page',
          'Run a final check before publishing',
        ],
        steps: [
          {
            title: 'Load images only when needed',
            text: [
              'Add `loading="lazy"` to images that are further down the page. The browser then waits to download them until a visitor scrolls near them, so the top of the page appears faster. Leave it off the first image people see.',
            ],
            code: {
              file: 'index.html',
              code: `<img src="images/bakery.jpg" alt="A baker shaping sourdough loaves on a floured wooden table" width="1200" height="800" loading="lazy">`,
            },
          },
          {
            title: 'Add a favicon',
            text: [
              'A favicon is the small icon in the browser tab. Make a square image of your logo, at least 512 by 512 pixels, save it as `favicon.png` in your folder, and add this line to the `<head>` of every page.',
            ],
            code: {
              file: 'every page',
              code: `<link rel="icon" href="favicon.png" type="image/png">`,
            },
          },
          {
            title: 'Add a friendly 404 page',
            text: [
              'When someone visits an address that does not exist, many hosts show a file called `404.html` if you include one. Check your host’s documentation for the exact file name it uses. Copy one of your pages, keep its `<head>`, header and footer, and replace everything inside `<main>` with a short message and a way back.',
            ],
            code: {
              file: '404.html',
              code: `<main>
  <section>
    <h1>We could not find that page.</h1>
    <p>It may have moved. Try our homepage instead.</p>
    <a class="button" href="index.html">Go to the homepage</a>
  </section>
</main>`,
            },
          },
          {
            title: 'Run your final check',
            text: [
              'Validate every page at `validator.w3.org`, click every link on every page, submit the form once, and test the mobile menu on a real phone. Read every word aloud one more time. Then publish exactly as you did in the free course’s “Publish your website” lesson.',
            ],
          },
        ],
        mistakes: [
          { problem: 'Lazy loading the first image on the page.', fix: 'Leave `loading="lazy"` off images that are visible as soon as the page opens.' },
        ],
        checklist: [
          'Images below the top of the page use `loading="lazy"`',
          'My site has a favicon and a 404 page',
          'Every page passes the validator and every link works',
        ],
      },
    ],
  },
  {
    slug: 'build-websites-with-ai',
    title: 'Build websites with AI',
    tagline: 'Use AI assistants to write, explain and fix code, and know when to trust them.',
    description: 'Learn to work with AI assistants such as Claude the way professionals do: write clear requests, ask for explanations so you keep learning, fix bugs together, and review every line before it goes on your site.',
    level: 'Beginner friendly',
    lessons: [
      {
        slug: 'what-ai-can-do',
        preview: true,
        title: 'What AI can and cannot do',
        summary: 'Understand where AI assistants help most, where they go wrong, and how to use them safely.',
        minutes: 15,
        outcomes: [
          'Know the jobs AI assistants do well',
          'Recognize the mistakes they make',
          'Follow simple rules to stay safe',
        ],
        steps: [
          {
            title: 'What an AI assistant is',
            text: [
              'An AI assistant, such as Claude, is a program you talk to in plain English. Ask it for a piece of HTML, an explanation of some CSS, or help with an error, and it replies in seconds. Many are free to try, and some can also be used inside code editors.',
            ],
          },
          {
            title: 'Where it helps most',
            text: [
              'AI is very good at writing a first draft of code you can describe clearly, explaining code line by line, suggesting why something is broken, turning your notes into tidy text, and giving you several design ideas to choose from.',
              'Used well, it is like a patient tutor who is always available. You still decide what goes on your website.',
            ],
          },
          {
            title: 'Where it goes wrong',
            text: [
              'AI can sound confident and still be wrong. It may write code that looks right but does not work, mention settings that do not exist, or forget details you told it earlier. It does not know your business, so it can invent facts, such as opening hours or reviews, if you let it.',
              'Treat everything it gives you as a draft to check, never as finished work.',
            ],
          },
          {
            title: 'Three rules to stay safe',
            text: [
              'First, never paste passwords, API keys, or customers’ private details into an AI chat. Second, never publish facts it wrote about your business without checking them. Third, test every piece of code before it goes live: open the page, click everything, and run the validator.',
            ],
            tip: 'You are responsible for what is on your website, whoever or whatever wrote it.',
          },
        ],
        mistakes: [
          { problem: 'Copying code you do not understand.', fix: 'Ask the assistant to explain it first. You will learn faster and spot mistakes sooner.' },
          { problem: 'Letting AI write your reviews or claims.', fix: 'Only publish real reviews and claims you can back up.' },
        ],
        checklist: [
          'I know what AI assistants are good at',
          'I know they can be confidently wrong',
          'I will never paste secrets or private customer details into a chat',
        ],
      },
      {
        slug: 'write-good-prompts',
        preview: false,
        title: 'Write requests that get good code',
        summary: 'Give the assistant context, a clear goal and limits, so the first answer is close to what you want.',
        minutes: 20,
        outcomes: [
          'Describe your project, goal and limits in a request',
          'Ask for code that fits your existing files',
          'Improve an answer by giving feedback',
        ],
        steps: [
          {
            title: 'Give context, a goal and limits',
            text: [
              'The request you type is often called a prompt. Good prompts have three parts. Context: what you are building and what you already have. Goal: exactly what you want now. Limits: what to avoid, such as frameworks you do not use or features you do not need.',
            ],
            code: {
              file: 'Example request',
              code: `I am building a simple website for a bakery with plain HTML and CSS,
no frameworks. I already have a style.css with these colors:
--ink: #111111, --paper: #ffffff, --blue: #2d45ff.

Write the HTML and CSS for an opening-hours section with a table
for Tuesday to Sunday, 7 a.m. to 3 p.m. Use my color variables.
Make it readable on phones. Keep the CSS short and explain each rule.`,
            },
          },
          {
            title: 'Share the code it needs to see',
            text: [
              'If you want the new code to fit your site, paste the relevant part of your existing HTML or CSS into the chat, such as your header or your color variables. The assistant cannot see your files unless you show them, or use a tool that is connected to your project.',
            ],
          },
          {
            title: 'Ask for one thing at a time',
            text: [
              'Small requests get better results than “build my whole website.” Ask for one section, check it, then ask for the next. It is easier to test, and if something breaks you know which change caused it.',
            ],
          },
          {
            title: 'Give feedback to improve it',
            text: [
              'If the answer is not right, say exactly what to change: “Make the table text larger on phones and remove the borders.” You do not need to start again. A short conversation usually gets you there faster than one perfect prompt.',
            ],
          },
        ],
        mistakes: [
          { problem: 'Vague requests like “make it look better.”', fix: 'Say what better means: larger headings, more space between sections, or a different button color.' },
          { problem: 'Getting code for a framework you are not using.', fix: 'Say “plain HTML and CSS, no frameworks” in your first message.' },
        ],
        checklist: [
          'My request includes context, a goal and limits',
          'I pasted the code the assistant needs to see',
          'I asked for one section at a time and gave specific feedback',
        ],
      },
      {
        slug: 'learn-with-ai',
        preview: false,
        title: 'Use AI as your coding tutor',
        summary: 'Ask for explanations, examples and practice so you understand the code, not just copy it.',
        minutes: 15,
        outcomes: [
          'Get line-by-line explanations of code',
          'Ask for practice exercises at your level',
          'Check your understanding by explaining back',
        ],
        steps: [
          {
            title: 'Ask it to explain line by line',
            text: [
              'Paste any code from this course or from the assistant itself and ask for an explanation in plain English. Ask it to assume you are a beginner, so it does not skip steps.',
            ],
            code: {
              file: 'Example request',
              code: `I am a beginner learning HTML and CSS. Explain this CSS line by line
in plain English, and tell me what would change if I removed each line:

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,
            },
          },
          {
            title: 'Ask for small exercises',
            text: [
              'Ask for a short exercise on something you just learned, such as “Give me three small exercises on Flexbox, from easy to harder, without the answers.” Try them yourself first, then ask it to check your work.',
            ],
          },
          {
            title: 'Explain it back',
            text: [
              'Write your own explanation of a piece of code and ask the assistant to correct anything you got wrong. Explaining something in your own words is one of the fastest ways to learn it.',
            ],
            tip: 'If an explanation does not make sense, say so and ask for a simpler one with an everyday example.',
          },
        ],
        mistakes: [
          { problem: 'Asking for answers before trying.', fix: 'Try first, even if you get it wrong. Then ask for help with the exact part you are stuck on.' },
        ],
        checklist: [
          'I asked for a line-by-line explanation of some code',
          'I tried an exercise before checking the answer',
          'I explained a piece of code in my own words',
        ],
      },
      {
        slug: 'fix-bugs-with-ai',
        preview: false,
        title: 'Fix bugs with AI',
        summary: 'Describe the problem clearly, share the error and the code, and test the fix.',
        minutes: 20,
        outcomes: [
          'Describe a bug so it can be fixed',
          'Share errors from the browser console',
          'Test a suggested fix before keeping it',
        ],
        steps: [
          {
            title: 'Describe what you expected and what happened',
            text: [
              'A good bug report says three things: what you did, what you expected, and what happened instead. “It doesn’t work” gives the assistant nothing to go on.',
            ],
            code: {
              file: 'Example request',
              code: `On my phone-sized screen, I click the Menu button. I expected the
links to appear, but nothing happens. The console shows:

Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
    at script.js:11

Here is my script.js and the header from my HTML: ...`,
            },
          },
          {
            title: 'Include the error and the code',
            text: [
              'Copy the exact error from the browser console, including the file name and line number, and paste the code around it. In the example above, the error means `document.querySelector` found nothing, usually because a class or `id` is spelled differently in the HTML and the JavaScript.',
            ],
          },
          {
            title: 'Test the fix, then understand it',
            text: [
              'Apply one suggested fix at a time, save, refresh and test. If it works, ask why it works, so you can fix the same kind of problem yourself next time. If it does not, tell the assistant what happened now; do not pile several fixes on top of each other.',
            ],
          },
        ],
        mistakes: [
          { problem: 'Accepting a fix that removes the feature.', fix: 'Some “fixes” just delete the broken part. Check that everything still works the way you wanted.' },
        ],
        checklist: [
          'My bug report says what I did, expected and saw',
          'I included the exact error message and the related code',
          'I tested one fix at a time and asked why it worked',
        ],
      },
      {
        slug: 'review-ai-code',
        preview: false,
        title: 'Review AI code before you publish',
        summary: 'A checklist to run on every piece of AI-written code before it goes on your live site.',
        minutes: 15,
        outcomes: [
          'Check AI code for correctness and accessibility',
          'Spot risky code, such as unknown scripts',
          'Decide when to ask a person for help',
        ],
        steps: [
          {
            title: 'Check that it works',
            text: [
              'Open the page, use every new feature, and try it on a narrow screen. Run the page through `validator.w3.org`. Open the browser console and make sure there are no new errors.',
            ],
          },
          {
            title: 'Check that everyone can use it',
            text: [
              'Run through the accessibility checks from the free course: one `<h1>`, headings in order, alt text on images, labels on form fields, enough color contrast, and everything reachable with the Tab key.',
            ],
          },
          {
            title: 'Look for risky code',
            text: [
              'Be careful with any `<script>` tag that loads code from another website you do not recognize, any code that sends form data somewhere other than your own form service, and any request to paste a password or key into your page. Ask the assistant to explain anything like this, and remove it if you are not sure.',
            ],
            tip: 'Keys and passwords never belong in HTML, CSS or JavaScript files that visitors download. Anyone can read those files.',
          },
          {
            title: 'Check the words and facts',
            text: [
              'Read every sentence the assistant wrote as if a customer were reading it. Remove anything that is not true, such as awards, reviews or promises, and replace placeholder details with your real ones.',
            ],
          },
        ],
        mistakes: [
          { problem: 'Publishing straight from the chat.', fix: 'Always paste into your files, test locally, and only then upload.' },
        ],
        checklist: [
          'The new code works, passes the validator and adds no console errors',
          'It passes the accessibility checks',
          'It loads no unknown scripts and contains no keys or passwords',
          'Every fact on the page is true',
        ],
      },
    ],
  },
  {
    slug: 'automation-for-websites',
    title: 'Automation for websites',
    tagline: 'Let tools handle the repetitive work: form emails, publishing, checks and backups.',
    description: 'Discover the tools that save website owners hours: receive form messages by email, publish automatically when you save changes, run checks on every update, and keep watch on your site while you sleep.',
    level: 'After the free course',
    lessons: [
      {
        slug: 'what-to-automate',
        preview: true,
        title: 'What to automate',
        summary: 'Learn which website jobs are worth automating and which still need a person.',
        minutes: 10,
        outcomes: [
          'Spot repetitive website jobs',
          'Know the main kinds of automation tools',
          'Keep a person in charge of what matters',
        ],
        steps: [
          {
            title: 'Look for jobs you repeat',
            text: [
              'Automation means letting a tool do a job for you every time, the same way. Good candidates are tasks you repeat often and that follow the same steps: sending form messages to your inbox, uploading files after every change, checking for broken links, and making backups.',
            ],
          },
          {
            title: 'The four kinds of tools in this course',
            text: [
              'Form services receive what visitors type into your forms and email it to you. Automatic publishing puts your site online every time you save changes to your project. Automatic checks test your pages every time they change. Monitoring tools watch your live site and warn you if it goes down.',
            ],
          },
          {
            title: 'Keep a person in charge',
            text: [
              'Automate the mechanical steps, not the judgment. A tool can publish your changes the moment you save them, but a person should still read the words, check the design and approve anything that customers will see.',
            ],
            tip: 'Start with one automation, make sure it works, then add the next.',
          },
        ],
        mistakes: [
          { problem: 'Automating before the process works by hand.', fix: 'Do the job manually a few times first, so you know exactly what the tool should do.' },
        ],
        checklist: [
          'I listed the website jobs I repeat most',
          'I know the four kinds of tools in this course',
          'I decided which steps still need a person',
        ],
      },
      {
        slug: 'automatic-form-emails',
        preview: false,
        title: 'Get form messages by email',
        summary: 'Connect your contact form to a form service so every message lands in your inbox.',
        minutes: 20,
        outcomes: [
          'Choose a form service',
          'Connect your form with one address',
          'Test the form and protect it from spam',
        ],
        steps: [
          {
            title: 'Why you need a form service',
            text: [
              'A plain HTML website has no way to store messages or send email. A form service receives your form’s answers, saves them, and emails them to you. Some hosts, such as Netlify, have forms built in. Independent services, such as Formspree, work with any host. Compare their current plans, limits and privacy terms before you choose.',
            ],
          },
          {
            title: 'Connect your form',
            text: [
              'Sign up with your chosen service and create a form. It gives you a unique address. Replace the placeholder in your form’s `action` with that address. The `name` on each field becomes the label you see in the email.',
            ],
            code: {
              file: 'contact.html',
              code: `<!-- before -->
<form class="contact-form" action="https://example.com/your-form-endpoint" method="post">

<!-- after: paste the address your form service gives you -->
<form class="contact-form" action="https://forms.example-service.com/abc123" method="post">`,
            },
            tip: 'The second address above is only an example. Use the exact address and any extra instructions from your own service.',
          },
          {
            title: 'Test it',
            text: [
              'Upload your site, open the contact page, fill in the form with your own details and send it. Check that the email arrives, including your spam folder. Many services ask you to confirm your email address the first time.',
            ],
          },
          {
            title: 'Keep spam out',
            text: [
              'Public forms attract spam. Most form services include spam filtering; turn it on. Some offer a hidden extra field (often called a honeypot) or a challenge such as a CAPTCHA. Follow your service’s instructions for adding them.',
            ],
          },
        ],
        mistakes: [
          { problem: 'Messages never arrive.', fix: 'Check your spam folder, confirm your address with the service, and make sure every field has a `name`.' },
        ],
        checklist: [
          'My form’s `action` points to my form service',
          'I sent a test message and it arrived',
          'Spam protection is turned on',
        ],
      },
      {
        slug: 'publish-automatically',
        preview: false,
        title: 'Publish automatically when you save',
        summary: 'Store your site on GitHub and let your host publish every change for you.',
        minutes: 30,
        outcomes: [
          'Understand version control and GitHub',
          'Connect a GitHub repository to your host',
          'Use preview links to check changes before they go live',
        ],
        steps: [
          {
            title: 'Version control in one minute',
            text: [
              'Version control keeps a history of every change to your files, so you can see what changed and undo mistakes. Git is the most popular version control tool, and GitHub is a website that stores Git projects online. A project stored on GitHub is called a repository.',
            ],
          },
          {
            title: 'Put your site on GitHub',
            text: [
              'Create a free GitHub account and a new repository. You can upload your `my-website` folder straight from the browser: on the repository page, choose “Add file,” then “Upload files,” and drag your files in. Each upload is saved as a commit, a named snapshot of your changes.',
            ],
          },
          {
            title: 'Connect your host',
            text: [
              'Hosts such as Netlify, Vercel, Cloudflare Pages and GitHub Pages can connect to a GitHub repository. In your host, create a new project from your repository and follow its steps. After that, every new commit is published automatically, usually within a minute or two.',
            ],
          },
          {
            title: 'Check previews before going live',
            text: [
              'Many hosts can also build a private preview link for changes made on a separate branch, a parallel copy of your project. Make your changes on a branch, check the preview, and only then merge them into your main branch to publish. That is how professional teams avoid surprises.',
            ],
            tip: 'This is exactly how the Auvrantis Create website itself is updated.',
          },
        ],
        mistakes: [
          { problem: 'Publishing every small experiment to the live site.', fix: 'Use a separate branch and its preview link for experiments.' },
          { problem: 'Uploading private files to a public repository.', fix: 'Anyone can read a public repository. Never upload passwords, keys or private documents.' },
        ],
        checklist: [
          'My site is in a GitHub repository',
          'My host publishes automatically when I commit',
          'I know how to check a preview before going live',
        ],
      },
      {
        slug: 'automatic-checks',
        preview: false,
        title: 'Run checks on every change',
        summary: 'Use GitHub Actions to check your HTML automatically, and Lighthouse to measure quality.',
        minutes: 25,
        outcomes: [
          'Understand what GitHub Actions does',
          'Add a workflow that validates your HTML on every change',
          'Measure speed and accessibility with Lighthouse',
        ],
        steps: [
          {
            title: 'What GitHub Actions does',
            text: [
              'GitHub Actions runs tasks for you on GitHub’s computers whenever something happens in your repository, such as a new commit. A set of tasks is called a workflow, and it is described in a small text file in a folder named `.github/workflows`.',
            ],
          },
          {
            title: 'Add an HTML check',
            text: [
              'This workflow downloads your files, sets up Node.js, and runs html-validate, a free tool that checks every HTML file in the top level of your project. If it finds a problem, GitHub marks the commit with a red cross and shows the details.',
              'Create the file `.github/workflows/check.yml` in your repository with this content. In YAML files, indentation matters, so copy the spaces exactly.',
            ],
            code: {
              file: '.github/workflows/check.yml',
              code: `name: Check website

on:
  push:
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx --yes html-validate "*.html"`,
            },
          },
          {
            title: 'Tell the checker which rules to use',
            text: [
              'Add a file called `.htmlvalidate.json` to the top of your repository. It tells html-validate to use its recommended set of rules.',
            ],
            code: {
              file: '.htmlvalidate.json',
              code: `{
  "extends": ["html-validate:recommended"]
}`,
            },
          },
          {
            title: 'Measure quality with Lighthouse',
            text: [
              'Lighthouse is a free tool built into Google Chrome that scores a page for performance, accessibility, best practices and search basics. Open your page in Chrome, right-click, choose Inspect, open the Lighthouse tab, and click Analyze page load. Each score comes with a list of specific things to improve.',
            ],
            tip: 'Run Lighthouse after big changes and fix the items marked in red first.',
          },
        ],
        mistakes: [
          { problem: 'The workflow file does nothing.', fix: 'It must be inside `.github/workflows/` and end in `.yml`. Check the Actions tab on GitHub for errors.' },
          { problem: 'Ignoring a red cross.', fix: 'Open the failed check, read the first error, and fix it before your next change.' },
        ],
        checklist: [
          'My repository has a workflow that checks my HTML',
          'My commits show a green check mark',
          'I ran Lighthouse and fixed the most important item',
        ],
      },
      {
        slug: 'monitor-and-back-up',
        preview: false,
        title: 'Monitor, back up and keep up to date',
        summary: 'Get warned if your site goes down, keep safe copies, and set reminders for the jobs that need a person.',
        minutes: 15,
        outcomes: [
          'Set up an uptime monitor',
          'Keep automatic backups of your site',
          'Schedule regular content reviews',
        ],
        steps: [
          {
            title: 'Get warned if your site goes down',
            text: [
              'An uptime monitor visits your website every few minutes and emails you if it stops responding. Many services offer a free plan for a few websites, such as UptimeRobot. Add your homepage address and your email, and you will usually know about a problem before your customers do.',
            ],
          },
          {
            title: 'Keep backups',
            text: [
              'If your site is on GitHub, every commit is already a backup you can return to. Also keep a copy of your files, photos and form messages somewhere separate, such as an external drive or cloud storage. Check once in a while that you can actually open your backup.',
            ],
          },
          {
            title: 'Schedule the jobs a person must do',
            text: [
              'Some jobs cannot be automated well: checking your opening hours, prices and photos are still right, and replying to messages. Put a repeating reminder in your calendar, for example on the first Monday of each month, to review your site from top to bottom.',
            ],
          },
          {
            title: 'Watch your domain and plans',
            text: [
              'Turn on auto-renew for your domain name, and keep a list of every service your site uses, such as your host, form service and monitor, with the email address and renewal date for each. That list will save you hours if something ever goes wrong.',
            ],
          },
        ],
        mistakes: [
          { problem: 'Never testing a backup.', fix: 'A backup you cannot restore is not a backup. Try restoring a copy at least once.' },
        ],
        checklist: [
          'An uptime monitor watches my site',
          'My files are backed up in at least two places',
          'I have a monthly reminder to review my site',
        ],
      },
    ],
  },
];

export function getProCourse(slug: string): ProCourse | undefined {
  return proCourses.find((course) => course.slug === slug);
}

export function getProLesson(courseSlug: string, lessonSlug: string): { course: ProCourse; lesson: ProLesson; index: number } | undefined {
  const course = getProCourse(courseSlug);
  if (!course) return undefined;
  const index = course.lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  return index < 0 ? undefined : { course, lesson: course.lessons[index], index };
}
