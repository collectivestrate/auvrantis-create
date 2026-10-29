// Learning Center course: "Build your first website, step by step".
// Every lesson builds the same example site (Maple Street Bakery). The code in
// "The complete code" lesson is the finished, tested version of that site.

export type PartId = 'plan' | 'build' | 'launch';

export type CodeSample = { file: string; code: string };

export type LessonStep = {
  title: string;
  /** Paragraphs. Wrap code words in backticks, e.g. `<h1>`. */
  text: string[];
  code?: CodeSample;
  tip?: string;
};

export type Lesson = {
  slug: string;
  part: PartId;
  title: string;
  summary: string;
  minutes: number;
  outcomes: string[];
  steps: LessonStep[];
  mistakes: { problem: string; fix: string }[];
  checklist: string[];
};

export const parts: { id: PartId; title: string; description: string }[] = [
  { id: 'plan', title: 'Plan', description: 'Decide what your site needs to do, learn how the web works, and set up your tools.' },
  { id: 'build', title: 'Build', description: 'Write your first page, add sections and photos, then style it for every screen.' },
  { id: 'launch', title: 'Launch', description: 'Help people find you, test everything, and put your website online.' },
];

export const lessons: Lesson[] = [
  {
    slug: 'plan-your-website',
    part: 'plan',
    title: 'Plan your website',
    summary: 'Before you write any code, decide who the site is for, what it must do, and what goes on it.',
    minutes: 15,
    outcomes: [
      'Write a one-sentence goal for your website',
      'Choose the pages and sections you need',
      'Gather your words, photos and contact details in one place',
    ],
    steps: [
      {
        title: 'Write down the one job of your website',
        text: [
          'A good website has one main job. For a bakery, it might be “get nearby people to visit the shop.” For a plumber, it might be “get people to call for a quote.”',
          'Finish this sentence on paper: “When someone visits my website, I want them to …”. Keep that sentence in front of you. Every choice in this course should help with that one job.',
        ],
        tip: 'If you have two jobs, pick the most important one for the first version. You can always add more later.',
      },
      {
        title: 'Describe the people you are building it for',
        text: [
          'Think about who will visit. Where are they? What do they want to know first? A visitor to a bakery usually wants three things: what you sell, where you are, and when you are open.',
          'Write the three questions your visitors ask most often. Your homepage should answer all three without anyone needing to scroll far.',
        ],
      },
      {
        title: 'Choose your sections',
        text: [
          'Most small business websites start as one page with a few sections stacked on top of each other. In this course we build these sections for Maple Street Bakery:',
          'A header with your name and links, a big welcome message (often called the “hero”), a menu or list of services, an about section with a photo, a visit section with your address and contact buttons, and a footer.',
          'Sketch these boxes on paper, top to bottom, in the order you want people to see them.',
        ],
      },
      {
        title: 'Gather your content',
        text: [
          'Create a folder or a note and collect everything before you start: your business name, a short description, your products or services with prices, your address, opening hours, phone number, email address, and one or two good photos.',
          'Real words make a better site than placeholder text. If you are not sure what to write, describe your business out loud as if you were talking to a new customer, then write that down.',
        ],
        tip: 'Use photos you took yourself or have permission to use. Do not copy images from other websites.',
      },
    ],
    mistakes: [
      { problem: 'Trying to put everything on the first version.', fix: 'Launch with the sections your visitors need most. A small site that is finished beats a big site that is never published.' },
      { problem: 'Writing about yourself instead of your visitor.', fix: 'Lead with what the visitor gets: “Fresh bread in Chicago” is clearer than “Welcome to our website.”' },
    ],
    checklist: [
      'I wrote one sentence that says what my website is for',
      'I listed the sections my homepage will have',
      'I collected my text, photos and contact details in one place',
    ],
  },
  {
    slug: 'how-websites-work',
    part: 'plan',
    title: 'How a website works',
    summary: 'Learn the few words you need: browser, HTML, CSS, JavaScript, web host and domain name.',
    minutes: 10,
    outcomes: [
      'Explain what HTML, CSS and JavaScript each do',
      'Understand what a web host and a domain name are',
      'Know which files make up a simple website',
    ],
    steps: [
      {
        title: 'A website is a set of files',
        text: [
          'A simple website is just a folder of files: text files that describe the page, and image files for the pictures. When someone visits your site, their browser (Chrome, Safari, Edge or Firefox) downloads those files and draws the page on their screen.',
        ],
        code: {
          file: 'Your website folder',
          code: `my-website/
  index.html    the page itself
  style.css     how the page looks
  bakery.jpg    a photo`,
        },
      },
      {
        title: 'HTML says what is on the page',
        text: [
          'HTML (HyperText Markup Language) describes the content: headings, paragraphs, images, links and lists. It uses tags written in angle brackets. Most tags come in pairs: an opening tag like `<h1>` and a closing tag like `</h1>`. The text between them is the content.',
        ],
        code: {
          file: 'index.html',
          code: `<h1>Maple Street Bakery</h1>
<p>Fresh bread, baked every morning.</p>`,
        },
      },
      {
        title: 'CSS says how it looks',
        text: [
          'CSS (Cascading Style Sheets) controls the design: colors, fonts, sizes, spacing and layout. You write a rule that picks some part of the page and gives it a style.',
        ],
        code: {
          file: 'style.css',
          code: `h1 {
  color: #2d45ff;
  font-size: 56px;
}`,
        },
      },
      {
        title: 'JavaScript makes it interactive',
        text: [
          'JavaScript is a programming language that lets a page respond to clicks, typing and other actions, such as opening a menu or checking a form. A simple business website can work well with no JavaScript at all, so this course focuses on HTML and CSS.',
        ],
      },
      {
        title: 'A web host and a domain put it online',
        text: [
          'While your files are on your own computer, only you can see them. A web host is a company that keeps your files on a computer that is always connected to the internet, so anyone can visit.',
          'A domain name, such as `maplestreetbakery.com`, is the address people type to reach your site. You rent a domain from a domain registrar, usually by the year, and then point it at your web host. You will do this in the “Publish your website” lesson.',
        ],
      },
    ],
    mistakes: [
      { problem: 'Thinking you need to learn programming first.', fix: 'You do not. HTML and CSS are not programming languages in the usual sense. They describe content and design, and you can learn the basics in an afternoon.' },
    ],
    checklist: [
      'I can say what HTML, CSS and JavaScript each do',
      'I know that a web host stores my files and a domain is my address',
    ],
  },
  {
    slug: 'set-up-your-workspace',
    part: 'plan',
    title: 'Set up your workspace',
    summary: 'Create a project folder, install a free code editor, and open your first file in a browser.',
    minutes: 15,
    outcomes: [
      'Create a folder for your website',
      'Install and open a code editor',
      'Open a file in your browser and see changes after you save',
    ],
    steps: [
      {
        title: 'Create a folder for your website',
        text: [
          'On your computer, create a new folder called `my-website`. Put it somewhere easy to find, such as your Documents folder. Every file for your site will live inside this folder.',
          'Copy the photos you gathered into this folder too.',
        ],
      },
      {
        title: 'Install a code editor',
        text: [
          'A code editor is a text editor made for writing code. It colors your code so it is easier to read and helps you spot mistakes. Visual Studio Code is free and works on Mac, Windows and Linux. Download it from its official website, `code.visualstudio.com`, and install it.',
          'Open Visual Studio Code, choose File, then Open Folder, and pick your `my-website` folder.',
        ],
        tip: 'Any plain text editor works. If you use TextEdit on a Mac, choose Format, then Make Plain Text, before you save, or the file will not work as a web page.',
      },
      {
        title: 'Create your first file',
        text: [
          'In your editor, create a new file and save it inside `my-website` with the exact name `index.html`. Use lowercase letters. Web hosts look for a file called `index.html` and show it as the homepage.',
          'Type one line into the file and save it:',
        ],
        code: {
          file: 'index.html',
          code: `<h1>Hello from Maple Street Bakery</h1>`,
        },
      },
      {
        title: 'Open it in your browser',
        text: [
          'Find `index.html` in your folder and double-click it. It opens in your web browser and shows your heading in large bold letters. Congratulations: that is a web page.',
          'Now change the text in your editor, save the file, and refresh the browser (press Command and R on a Mac, or Control and R on Windows). You will see your change. This save-and-refresh loop is how you will build the whole site.',
        ],
      },
    ],
    mistakes: [
      { problem: 'The file opens in the editor instead of the browser.', fix: 'Right-click `index.html`, choose Open With, and pick your browser.' },
      { problem: 'The file is called index.html.txt.', fix: 'Your computer may hide file extensions. Turn on “Show all filename extensions” (Mac Finder settings) or “File name extensions” (Windows File Explorer, View menu) and rename the file to `index.html`.' },
    ],
    checklist: [
      'I have a `my-website` folder with my photos in it',
      'I created `index.html` and opened it in my browser',
      'I changed the text, saved, refreshed, and saw the change',
    ],
  },
  {
    slug: 'your-first-page',
    part: 'build',
    title: 'Write your first real page',
    summary: 'Every web page starts with the same short template. Learn what each line does.',
    minutes: 20,
    outcomes: [
      'Write the standard HTML page template from memory',
      'Understand the difference between the head and the body',
      'Add a page title, a heading and a paragraph',
    ],
    steps: [
      {
        title: 'Replace your file with the page template',
        text: [
          'Delete the line you wrote in the last lesson and type this template instead. Every web page you build will start like this.',
        ],
        code: {
          file: 'index.html',
          code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Maple Street Bakery — Fresh bread in Chicago</title>
</head>
<body>
  <h1>Fresh bread in Chicago, baked every morning.</h1>
  <p>Sourdough, rye and pastries made by hand on Maple Street since 2019.</p>
</body>
</html>`,
        },
      },
      {
        title: 'What each line means',
        text: [
          '`<!doctype html>` tells the browser this is a modern web page. `<html lang="en">` wraps the whole page and says it is written in English, which helps screen readers and translation tools.',
          'The `<head>` holds information about the page that visitors do not see directly. `<meta charset="utf-8">` lets you use any letter or symbol, such as é or ©. The viewport line makes the page fit phone screens properly. `<title>` is the text shown in the browser tab and in search results.',
          'The `<body>` holds everything visitors see. Right now that is one heading and one paragraph.',
        ],
      },
      {
        title: 'Use one main heading',
        text: [
          'The `<h1>` is the main heading of the page. Use exactly one `<h1>` per page, and make it say what you offer in plain words. HTML has six heading levels, `<h1>` to `<h6>`. You will use `<h2>` for section headings and `<h3>` for smaller headings inside sections.',
        ],
      },
      {
        title: 'Indent to keep it readable',
        text: [
          'Notice that the lines inside `<head>` and `<body>` are pushed in with two spaces. The browser ignores this spacing, but it makes it much easier for you to see which tags are inside which. Keep your indentation tidy as the page grows.',
        ],
        tip: 'Save and refresh after every few lines. If something looks wrong, you will know exactly which change caused it.',
      },
    ],
    mistakes: [
      { problem: 'Forgetting a closing tag, like `</p>`.', fix: 'Every opening tag such as `<p>` needs a matching closing tag `</p>`. A few tags, such as `<meta>` and `<img>`, never have a closing tag.' },
      { problem: 'Putting visible content inside the head.', fix: 'Headings, paragraphs and images always go inside `<body>`.' },
    ],
    checklist: [
      'My page starts with `<!doctype html>`',
      'My page has a `<title>` that names my business and what I do',
      'My page has exactly one `<h1>`',
    ],
  },
  {
    slug: 'structure-your-content',
    part: 'build',
    title: 'Structure your content',
    summary: 'Group your page into a header, sections and a footer, add a menu list, and link to each section.',
    minutes: 25,
    outcomes: [
      'Use header, nav, main, section and footer tags',
      'Write a list with ul and li',
      'Link from the navigation to a section on the same page',
    ],
    steps: [
      {
        title: 'Add a header with navigation',
        text: [
          'Inside `<body>`, before your heading, add a `<header>`. It holds your business name and a `<nav>` with links. The `<a>` tag makes a link, and its `href` says where the link goes. A link that starts with `#` jumps to a part of the same page.',
        ],
        code: {
          file: 'index.html',
          code: `<header class="site-header">
  <a class="logo" href="index.html">Maple Street Bakery</a>
  <nav aria-label="Main">
    <a href="#menu">Menu</a>
    <a href="#about">About</a>
    <a href="#visit">Visit</a>
  </nav>
</header>`,
        },
        tip: 'The `class` names, such as `site-header`, do nothing yet. They are labels you will use later to style each part with CSS.',
      },
      {
        title: 'Wrap your content in main and sections',
        text: [
          'Put everything between the header and the footer inside one `<main>` tag. Then split it into `<section>` tags, one for each part of your plan. Your welcome message becomes the first section.',
        ],
        code: {
          file: 'index.html',
          code: `<main>
  <section class="hero">
    <h1>Fresh bread in Chicago, baked every morning.</h1>
    <p>Sourdough, rye and pastries made by hand on Maple Street since 2019.</p>
  </section>
</main>`,
        },
      },
      {
        title: 'Add the menu section with a list',
        text: [
          'Lists are written with `<ul>` (an unordered list) and one `<li>` (list item) for each entry. Each item here has its own `<h3>` heading and a short description. The `id="menu"` is the target that the Menu link jumps to.',
          'Add this section inside `<main>`, after the hero section.',
        ],
        code: {
          file: 'index.html',
          code: `<section id="menu">
  <h2>Our menu</h2>
  <ul class="cards">
    <li>
      <h3>Sourdough loaf</h3>
      <p>Slow-fermented for 24 hours. $9</p>
    </li>
    <li>
      <h3>Seeded rye</h3>
      <p>Dense, nutty and great for sandwiches. $8</p>
    </li>
    <li>
      <h3>Butter croissant</h3>
      <p>Flaky layers, baked fresh at 7 a.m. $4</p>
    </li>
  </ul>
</section>`,
        },
      },
      {
        title: 'Add the visit section and a footer',
        text: [
          'Add a visit section with your address and hours. The `<br>` tag starts a new line inside a paragraph. Then, after `</main>`, add a `<footer>` for your copyright line. You will add the about section with a photo in the next lesson, and the contact buttons in the lesson after styling.',
        ],
        code: {
          file: 'index.html',
          code: `<section id="visit">
  <h2>Visit us</h2>
  <p>1200 Maple Street, Chicago<br>Tuesday to Sunday, 7 a.m. to 3 p.m.</p>
</section>

<!-- after </main> -->
<footer class="site-footer">
  <p>© 2026 Maple Street Bakery</p>
</footer>`,
        },
        tip: 'Text between `<!--` and `-->` is a comment. Browsers ignore it, so you can leave notes for yourself.',
      },
      {
        title: 'Test your links',
        text: [
          'Save, refresh, and click Menu and Visit in your navigation. The page should jump to each section. The About link will start working once you add the about section in the next lesson.',
        ],
      },
    ],
    mistakes: [
      { problem: 'A navigation link does not jump anywhere.', fix: 'Check that the `href` matches the `id` exactly, including capital letters. `href="#menu"` needs `id="menu"`, written without the `#`.' },
      { problem: 'Using two sections with the same id.', fix: 'Each `id` must be unique on the page.' },
    ],
    checklist: [
      'My page has a header, a main area with sections, and a footer',
      'My menu or services are in a list',
      'Clicking a navigation link jumps to its section',
    ],
  },
  {
    slug: 'add-images',
    part: 'build',
    title: 'Add images',
    summary: 'Prepare a photo, add it with the img tag, and describe it for people who cannot see it.',
    minutes: 15,
    outcomes: [
      'Choose the right file type and size for a photo',
      'Add an image with src, alt, width and height',
      'Write useful alt text',
    ],
    steps: [
      {
        title: 'Prepare your photo',
        text: [
          'Use JPG for photos, PNG for graphics with sharp edges or transparent backgrounds, and SVG for logos when you have one. Photos straight from a phone are often 4,000 pixels wide and several megabytes, which makes a page slow. Resize photos to about 1,600 pixels wide before you add them. Most computers include a basic editor that can do this, such as Preview on Mac or Photos on Windows.',
          'Name the file in lowercase with no spaces, for example `bakery.jpg`, and save it in your `my-website` folder.',
        ],
      },
      {
        title: 'Add the about section with an image',
        text: [
          'The `<img>` tag shows an image. It has no closing tag. `src` is the file name, `alt` describes the picture, and `width` and `height` give its size in pixels so the page does not jump around while it loads. Add this section between the menu and visit sections.',
        ],
        code: {
          file: 'index.html',
          code: `<section id="about" class="split">
  <img src="bakery.jpg" alt="A baker shaping sourdough loaves on a floured wooden table" width="1200" height="800">
  <div>
    <h2>About us</h2>
    <p>We are a small neighborhood bakery. Everything is mixed, shaped and baked in our kitchen, using flour from Midwest farms.</p>
  </div>
</section>`,
        },
        tip: 'Set `width` and `height` to your photo’s real size in pixels. You will make it shrink to fit smaller screens with CSS in a later lesson.',
      },
      {
        title: 'Write alt text that helps',
        text: [
          'Alt text is read aloud by screen readers for people who are blind or have low vision, and it is shown if the image fails to load. Describe what the picture shows and why it matters, in one short sentence. Do not start with “image of”, because screen readers already announce that it is an image.',
          'If an image is purely decorative and adds no information, use an empty alt: `alt=""`.',
        ],
      },
    ],
    mistakes: [
      { problem: 'The image shows as a broken icon.', fix: 'Check that the file is in the same folder as `index.html` and that the name in `src` matches exactly, including the extension and lowercase letters.' },
      { problem: 'The page loads slowly.', fix: 'Resize large photos to about 1,600 pixels wide and save them as JPG.' },
    ],
    checklist: [
      'My photo is resized and named in lowercase with no spaces',
      'My image has `src`, `alt`, `width` and `height`',
      'My alt text describes what the photo shows',
    ],
  },
  {
    slug: 'style-with-css',
    part: 'build',
    title: 'Style your page with CSS',
    summary: 'Connect a stylesheet, set up a black, white and blue color palette, and style text and links.',
    minutes: 25,
    outcomes: [
      'Link a CSS file to your page',
      'Read and write a CSS rule',
      'Use CSS variables for a consistent color palette',
    ],
    steps: [
      {
        title: 'Create and link your stylesheet',
        text: [
          'Create a new file in `my-website` called `style.css`. Then connect it to your page by adding a `<link>` tag inside `<head>`, just before `</head>`.',
        ],
        code: {
          file: 'index.html',
          code: `<link rel="stylesheet" href="style.css">`,
        },
      },
      {
        title: 'Understand a CSS rule',
        text: [
          'A CSS rule has a selector and a list of declarations inside curly braces. The selector picks what to style. Each declaration is a property, a colon, a value and a semicolon.',
          'A selector can be a tag name like `h2`, a class name with a dot like `.hero` (matching `class="hero"`), or an id with a hash like `#menu`.',
        ],
        code: {
          file: 'style.css',
          code: `/* selector { property: value; } */
h2 {
  font-size: 36px;
}`,
        },
      },
      {
        title: 'Set up your color palette',
        text: [
          'Pick a small set of colors and give them names with CSS variables. A variable starts with two dashes and is defined inside `:root`, which means the whole page. Use it anywhere with `var(--name)`. If you change a color later, you change it in one place.',
          'This palette is black, white and one blue accent. Colors are written as hex codes: `#ffffff` is white and `#111111` is a soft black.',
        ],
        code: {
          file: 'style.css',
          code: `/* Colors and fonts used across the whole site */
:root {
  --ink: #111111;
  --muted: #6e6e73;
  --paper: #ffffff;
  --mist: #f5f5f7;
  --blue: #2d45ff;
}`,
        },
      },
      {
        title: 'Style the whole page',
        text: [
          'Rules on `body` apply to all the text on the page. `font-family` lists fonts in order of preference; `system-ui` uses the clean built-in font of each device. `line-height: 1.6` adds comfortable space between lines.',
          'The `*` rule with `box-sizing: border-box` makes widths easier to work with. You will see why in the next lesson.',
        ],
        code: {
          file: 'style.css',
          code: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 18px;
  line-height: 1.6;
}

a {
  color: var(--blue);
}`,
        },
      },
      {
        title: 'Style headings and the hero',
        text: [
          'Make headings large and tight, and center the welcome section. The `.hero p` selector means “paragraphs inside the element with the class hero.”',
        ],
        code: {
          file: 'style.css',
          code: `h1 {
  font-size: 56px;
  line-height: 1.1;
  margin: 0 0 16px;
}

h2 {
  font-size: 36px;
  margin: 0 0 16px;
}

.hero {
  text-align: center;
}

.hero p {
  color: var(--muted);
  font-size: 22px;
}`,
        },
        tip: 'Margin values can be written as one to four numbers. `margin: 0 0 16px` means 0 on top, 0 on the left and right, and 16px on the bottom.',
      },
    ],
    mistakes: [
      { problem: 'None of my styles show up.', fix: 'Check that `style.css` is in the same folder as `index.html` and that the `<link>` tag is inside `<head>`. Then refresh the page.' },
      { problem: 'One rule works but the ones after it do not.', fix: 'Look for a missing semicolon or curly brace just before the rule that stopped working.' },
    ],
    checklist: [
      'My page is linked to `style.css`',
      'My colors are defined once as variables in `:root`',
      'My text uses one font, my headings are large, and my links are blue',
    ],
  },
  {
    slug: 'layout-and-mobile',
    part: 'build',
    title: 'Lay it out for every screen',
    summary: 'Use spacing, Flexbox and Grid to arrange your sections, then make them work on phones.',
    minutes: 30,
    outcomes: [
      'Center content with a maximum width',
      'Arrange items in a row with Flexbox and in columns with Grid',
      'Change the layout on small screens with a media query',
    ],
    steps: [
      {
        title: 'Give every section room to breathe',
        text: [
          'Every element is a box. Padding is the space inside the box, between its edge and its content. Margin is the space outside the box. `max-width` stops lines from getting too long on big screens, and `margin: 0 auto` centers the box.',
        ],
        code: {
          file: 'style.css',
          code: `section {
  max-width: 1040px;
  margin: 0 auto;
  padding: 72px 24px;
}`,
        },
      },
      {
        title: 'Lay out the header with Flexbox',
        text: [
          '`display: flex` places the children of an element side by side in a row. `justify-content: space-between` pushes the logo to the left and the navigation to the right, and `align-items: center` lines them up vertically. `gap` sets the space between items.',
        ],
        code: {
          file: 'style.css',
          code: `.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
}

.logo {
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
}

.site-header nav {
  display: flex;
  gap: 24px;
}

.site-header nav a {
  color: var(--muted);
  text-decoration: none;
}

.site-header nav a:hover {
  color: var(--ink);
}`,
        },
        tip: '`:hover` styles apply only while the mouse pointer is over an element. It gives visitors a clear sign that something can be clicked.',
      },
      {
        title: 'Lay out the menu cards with Grid',
        text: [
          'Grid arranges items into columns. `repeat(3, 1fr)` makes three columns that share the space equally. `list-style: none` removes the bullet points from the list.',
        ],
        code: {
          file: 'style.css',
          code: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cards li {
  padding: 28px;
  border-radius: 20px;
  background: var(--mist);
}

.cards h3 {
  margin: 0 0 8px;
}

.cards p {
  margin: 0;
  color: var(--muted);
}`,
        },
      },
      {
        title: 'Put the photo beside the text',
        text: [
          'The about section uses Flexbox again. `flex: 1` makes the image and the text share the row equally. The `img` rule makes every image shrink to fit its container, so it never spills off the screen.',
        ],
        code: {
          file: 'style.css',
          code: `img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
}

.split {
  display: flex;
  align-items: center;
  gap: 48px;
}

.split img,
.split div {
  flex: 1;
}`,
        },
      },
      {
        title: 'Style the footer',
        text: [
          'A dark footer clearly marks the end of the page. Here the background uses the black ink color and the text is white.',
        ],
        code: {
          file: 'style.css',
          code: `.site-footer {
  padding: 32px 24px;
  background: var(--ink);
  color: #ffffff;
  text-align: center;
}`,
        },
      },
      {
        title: 'Make it work on phones',
        text: [
          'A media query applies rules only when a condition is true. `@media (max-width: 720px)` means “when the screen is 720 pixels wide or narrower.” On phones, the cards stack in one column, the photo sits above the text, and the main heading gets smaller.',
          'Put this at the very end of `style.css`, so it overrides the earlier rules.',
        ],
        code: {
          file: 'style.css',
          code: `/* Phones and small screens */
@media (max-width: 720px) {
  h1 {
    font-size: 38px;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .split {
    flex-direction: column;
  }

  .site-header nav {
    gap: 16px;
  }
}`,
        },
      },
      {
        title: 'Test it at different sizes',
        text: [
          'Drag the edge of your browser window to make it narrow, then wide again. The cards should stack into one column on a narrow window. For a closer look, open your browser’s developer tools (right-click the page and choose Inspect) and turn on the device toolbar to preview phone sizes.',
        ],
      },
    ],
    mistakes: [
      { problem: 'The page scrolls sideways on a phone.', fix: 'Something is wider than the screen. Check that images have `max-width: 100%` and that the viewport meta tag is in your `<head>`.' },
      { problem: 'My phone rules do not apply.', fix: 'Make sure the media query is at the end of the file and that every opening curly brace has a matching closing brace.' },
    ],
    checklist: [
      'My sections have a maximum width and padding',
      'My header and menu cards are laid out in rows',
      'On a narrow window, everything stacks into one column with no sideways scrolling',
    ],
  },
  {
    slug: 'buttons-and-contact',
    part: 'build',
    title: 'Add buttons and contact links',
    summary: 'Turn links into clear buttons and let visitors call or email you with one tap.',
    minutes: 15,
    outcomes: [
      'Style a link to look like a button',
      'Create phone and email links',
      'Make a main button and a secondary outline button',
    ],
    steps: [
      {
        title: 'Add the buttons to your page',
        text: [
          'A button that takes visitors somewhere is still a link (`<a>`), just styled to stand out. Add a button to the hero section, after the paragraph, and add a row of two contact buttons to the visit section, after the address paragraph.',
          'A link starting with `tel:` opens the phone app with your number ready to call. A link starting with `mailto:` opens a new email to your address. Write the phone number with your country code and no spaces in the `href`.',
        ],
        code: {
          file: 'index.html',
          code: `<!-- in the hero section -->
<a class="button" href="#visit">Plan your visit</a>

<!-- in the visit section -->
<div class="actions">
  <a class="button" href="tel:+13125550123">Call (312) 555-0123</a>
  <a class="button button-outline" href="mailto:hello@maplestreetbakery.com">Email us</a>
</div>`,
        },
      },
      {
        title: 'Style the buttons',
        text: [
          '`display: inline-block` lets a link have padding like a box. `border-radius: 999px` gives fully rounded ends. A second class, `button-outline`, changes only what is different, so the outline button keeps the size and shape of the main one.',
        ],
        code: {
          file: 'style.css',
          code: `.button {
  display: inline-block;
  padding: 14px 28px;
  border: 2px solid var(--blue);
  border-radius: 999px;
  background: var(--blue);
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}

.button:hover {
  background: #1a32e6;
  border-color: #1a32e6;
}

.button-outline {
  background: transparent;
  color: var(--blue);
}

.button-outline:hover {
  background: var(--mist);
  color: var(--blue);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}`,
        },
      },
      {
        title: 'Use one main action',
        text: [
          'Give each section one main button in solid blue, and make any other choice an outline button. When everything is bright, nothing stands out. Write button text that says what happens: “Call (312) 555-0123” is clearer than “Click here.”',
        ],
      },
    ],
    mistakes: [
      { problem: 'The phone link does nothing on a computer.', fix: 'That is normal. On a computer without a calling app, `tel:` links may do nothing. Test them on your phone.' },
      { problem: 'Visitors cannot find how to contact me.', fix: 'Put a contact button near the top of the page as well as at the bottom.' },
    ],
    checklist: [
      'My hero has one clear main button',
      'My phone and email links open the right app on my phone',
      'My button text says exactly what happens',
    ],
  },
  {
    slug: 'search-and-accessibility',
    part: 'launch',
    title: 'Help people find and use your site',
    summary: 'Write a title and description for search results, and make your site work for everyone.',
    minutes: 20,
    outcomes: [
      'Write a page title and meta description',
      'Check your headings, alt text and link text',
      'Check that your colors have enough contrast',
    ],
    steps: [
      {
        title: 'Write a clear title and description',
        text: [
          'Search engines often show your `<title>` as the blue headline in results and your meta description as the short text below it. Include your business name, what you do and your town in natural words. Keep the title under about 60 characters and the description under about 155, so they are not cut off.',
          'Add the description inside `<head>`, right after the title.',
        ],
        code: {
          file: 'index.html',
          code: `<title>Maple Street Bakery — Fresh bread in Chicago</title>
<meta name="description" content="Sourdough, rye and pastries baked every morning on Maple Street in Chicago. Open Tuesday to Sunday.">`,
        },
        tip: 'Nobody can guarantee a top search ranking. Clear, honest, useful pages are what help most over time.',
      },
      {
        title: 'Keep your headings in order',
        text: [
          'Screen reader users often jump from heading to heading to find their way around. Use one `<h1>` for the page, `<h2>` for each section, and `<h3>` inside sections. Do not skip levels just to get a smaller size; change the size with CSS instead.',
        ],
      },
      {
        title: 'Check images and links',
        text: [
          'Every meaningful image needs alt text. Every link should make sense on its own, so use “See our menu” instead of “Click here.” The `aria-label="Main"` on your `<nav>` tells screen reader users what that group of links is for.',
        ],
      },
      {
        title: 'Check color contrast',
        text: [
          'Text must stand out clearly from its background. The common guideline, from the Web Content Accessibility Guidelines (WCAG), asks for a contrast ratio of at least 4.5 to 1 for normal text. Black text on white and white text on the blue `#2d45ff` both pass. Light gray text on white often fails, so check it with a free contrast checker such as the one from WebAIM.',
        ],
      },
      {
        title: 'Try your site with only a keyboard',
        text: [
          'Click on the page, then press the Tab key repeatedly. Focus should move through every link and button in order, with a visible outline showing where you are. Press Enter to follow a link. If you can use the whole site this way, so can people who do not use a mouse.',
        ],
      },
    ],
    mistakes: [
      { problem: 'The same title on every page.', fix: 'If you add more pages, give each one its own title and description.' },
      { problem: 'Removing focus outlines because they look untidy.', fix: 'Keep them. Keyboard users need to see where they are. You can restyle the outline, but never remove it completely.' },
    ],
    checklist: [
      'My title and description include my business, what I do and my town',
      'My headings go in order: one h1, then h2 and h3',
      'My text passes a contrast check and the site works with the Tab key',
    ],
  },
  {
    slug: 'test-before-you-publish',
    part: 'launch',
    title: 'Test before you publish',
    summary: 'Run through a short checklist so your site works the first time a customer sees it.',
    minutes: 20,
    outcomes: [
      'Check your HTML for errors with a free validator',
      'Test every link, button and image',
      'Proofread on both a computer and a phone',
    ],
    steps: [
      {
        title: 'Check your code with the W3C validator',
        text: [
          'The World Wide Web Consortium (W3C), which writes the rules for HTML, offers a free checker at `validator.w3.org`. Choose “Validate by File Upload”, upload your `index.html`, and fix any errors it lists, starting from the top. One missing closing tag can cause several errors further down, so re-check after each fix.',
          'There is also a CSS validator at `jigsaw.w3.org/css-validator` for your `style.css`.',
        ],
      },
      {
        title: 'Click everything',
        text: [
          'Open your page and click every navigation link, every button and every email or phone link. Make sure each one goes where it should. Check that every image appears and that none show as broken icons.',
        ],
      },
      {
        title: 'Read every word',
        text: [
          'Read the whole page out loud, slowly. Reading aloud catches missing words and typos your eyes skip over. Check your phone number, email address, street address and opening hours twice, because a wrong number costs you customers.',
        ],
      },
      {
        title: 'Test on a real phone',
        text: [
          'Most visitors will use a phone. Once your site is online, open it on your own phone and on a friend’s. Before then, use your browser’s device toolbar to preview phone sizes. Check that text is easy to read without zooming and that buttons are easy to tap.',
        ],
      },
      {
        title: 'Ask someone else to try it',
        text: [
          'Give your site to someone who has not seen it and ask them to find your opening hours and contact you. Watch without helping. Anything they struggle with is worth fixing.',
        ],
      },
    ],
    mistakes: [
      { problem: 'Only testing on your own computer.', fix: 'Different browsers and screen sizes can show your site differently. Test in at least two browsers and on a phone.' },
    ],
    checklist: [
      'The W3C validator shows no errors for my HTML',
      'Every link, button and image works',
      'I proofread every word and double-checked my contact details',
    ],
  },
  {
    slug: 'publish-your-website',
    part: 'launch',
    title: 'Publish your website',
    summary: 'Choose a web host, upload your folder, and connect your own domain name.',
    minutes: 30,
    outcomes: [
      'Choose a host for a simple website',
      'Upload your site and get a public web address',
      'Connect a domain name and make sure it uses HTTPS',
    ],
    steps: [
      {
        title: 'Choose a web host',
        text: [
          'Your site is a static website: a folder of HTML, CSS and image files with no database. Static sites are the simplest and cheapest kind to host. Several well-known hosts, including Netlify, Cloudflare Pages, GitHub Pages and Vercel, specialize in static sites, and many offer a free plan suitable for a small business site. Check each host’s current plans and terms before you sign up.',
        ],
      },
      {
        title: 'Upload your folder',
        text: [
          'Create an account with your chosen host and start a new site or project. Most static hosts let you upload your `my-website` folder directly, often by dragging it into the browser. Make sure `index.html` is at the top level of the folder, not inside another folder.',
          'When the upload finishes, the host gives you a free web address, usually ending in the host’s own name. Open it and check that your site looks the same as it did on your computer.',
        ],
      },
      {
        title: 'Get your own domain name',
        text: [
          'A domain such as `maplestreetbakery.com` looks more professional than the free address. Search for an available name at a domain registrar, or through your host if it sells domains. Pick something short, easy to spell and close to your business name. Domains are usually paid for each year, so note the renewal date and price.',
        ],
      },
      {
        title: 'Connect your domain',
        text: [
          'In your host’s settings, find the section for custom domains and add your domain. The host will show you DNS records to add at your registrar. DNS (the Domain Name System) is the internet’s address book that sends visitors to the right host. Follow your host’s instructions exactly, copying each value carefully.',
          'DNS changes can take from a few minutes to a couple of days to work everywhere. If your domain does not work straight away, wait and try again later.',
        ],
      },
      {
        title: 'Check for HTTPS',
        text: [
          'HTTPS keeps the connection between your visitors and your site private, and browsers warn people about sites without it. Most static hosts turn on HTTPS for your domain automatically once the DNS is connected. Visit your site and check that the address starts with `https://` and that your browser shows no security warning.',
        ],
      },
      {
        title: 'Update your site later',
        text: [
          'To make a change, edit the files on your computer, test them, and upload the folder again. Keep a copy of your `my-website` folder backed up somewhere safe, such as an external drive or a cloud storage service.',
        ],
      },
    ],
    mistakes: [
      { problem: 'The host shows a “page not found” error.', fix: 'Make sure your homepage file is named exactly `index.html` and is at the top of the folder you uploaded.' },
      { problem: 'Letting the domain expire.', fix: 'Turn on auto-renew at your registrar and keep your payment details up to date. An expired domain can be bought by someone else.' },
    ],
    checklist: [
      'My site is online at a public address',
      'My own domain name points to my site',
      'My address starts with https:// and shows no warnings',
    ],
  },
  {
    slug: 'build-faster-with-the-studio',
    part: 'launch',
    title: 'Build faster with the Studio',
    summary: 'Now that you know how it works, use the Auvrantis Create Studio to make a site in minutes.',
    minutes: 10,
    outcomes: [
      'Start a website from one of twelve designs',
      'Edit, reorder and hide sections',
      'Export your site and keep a backup',
    ],
    steps: [
      {
        title: 'Start a website',
        text: [
          'Open the Studio and choose “Start a website.” Pick one of the twelve hand-built designs, such as Atelier, Fieldwork or Café & Restaurant. Choose the one closest to your business; you can change words, colors and sections later.',
        ],
      },
      {
        title: 'Tell it about your business',
        text: [
          'Fill in your business name and, if you like, what you do, who you help, where you are based, a contact email and the tone you want. Choose “Build my first draft.” The Studio starts from hand-built templates and your own details, and it will not invent credentials, customer reviews or promises for you.',
        ],
      },
      {
        title: 'Edit your sections',
        text: [
          'In the editor, the list of page sections works just like the sections you wrote by hand in this course. Move sections up and down to change their order, hide the ones you do not need, and edit the words in each one. Switch between Desktop and Mobile to check both views, and use Undo and Redo if you change your mind.',
        ],
      },
      {
        title: 'Export and keep a backup',
        text: [
          'Your drafts are saved in this browser only. Choose “Export website” to download a complete HTML file you can upload to any host, exactly as in the “Publish your website” lesson. Choose “JSON backup” to download a backup you can import later with “Import backup” to keep editing.',
        ],
        tip: 'Download a backup before clearing your browser data or switching computers, so you never lose your work.',
      },
    ],
    mistakes: [
      { problem: 'My draft is missing on another computer.', fix: 'Drafts stay in the browser where you made them. Export a JSON backup and import it on the other computer.' },
    ],
    checklist: [
      'I started a website from a design',
      'I edited, reordered or hid at least one section',
      'I exported my website and saved a JSON backup',
    ],
  },
  {
    slug: 'the-complete-code',
    part: 'launch',
    title: 'The complete code',
    summary: 'The finished Maple Street Bakery site from this course, in two files, ready to copy and make your own.',
    minutes: 5,
    outcomes: [
      'See how every piece from the course fits together',
      'Copy a working starting point for your own site',
    ],
    steps: [
      {
        title: 'The finished index.html',
        text: [
          'This is the full page built in this course. Replace the bakery’s words, photo and contact details with your own.',
        ],
        code: {
          file: 'index.html',
          code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Maple Street Bakery — Fresh bread in Chicago</title>
  <meta name="description" content="Sourdough, rye and pastries baked every morning on Maple Street in Chicago. Open Tuesday to Sunday.">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a class="logo" href="index.html">Maple Street Bakery</a>
    <nav aria-label="Main">
      <a href="#menu">Menu</a>
      <a href="#about">About</a>
      <a href="#visit">Visit</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <h1>Fresh bread in Chicago, baked every morning.</h1>
      <p>Sourdough, rye and pastries made by hand on Maple Street since 2019.</p>
      <a class="button" href="#visit">Plan your visit</a>
    </section>

    <section id="menu">
      <h2>Our menu</h2>
      <ul class="cards">
        <li>
          <h3>Sourdough loaf</h3>
          <p>Slow-fermented for 24 hours. $9</p>
        </li>
        <li>
          <h3>Seeded rye</h3>
          <p>Dense, nutty and great for sandwiches. $8</p>
        </li>
        <li>
          <h3>Butter croissant</h3>
          <p>Flaky layers, baked fresh at 7 a.m. $4</p>
        </li>
      </ul>
    </section>

    <section id="about" class="split">
      <img src="bakery.jpg" alt="A baker shaping sourdough loaves on a floured wooden table" width="1200" height="800">
      <div>
        <h2>About us</h2>
        <p>We are a small neighborhood bakery. Everything is mixed, shaped and baked in our kitchen, using flour from Midwest farms.</p>
      </div>
    </section>

    <section id="visit">
      <h2>Visit us</h2>
      <p>1200 Maple Street, Chicago<br>Tuesday to Sunday, 7 a.m. to 3 p.m.</p>
      <div class="actions">
        <a class="button" href="tel:+13125550123">Call (312) 555-0123</a>
        <a class="button button-outline" href="mailto:hello@maplestreetbakery.com">Email us</a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p>© 2026 Maple Street Bakery</p>
  </footer>
</body>
</html>
`,
        },
      },
      {
        title: 'The finished style.css',
        text: [
          'This is the full stylesheet. To change the look of the whole site, start with the colors in `:root`.',
        ],
        code: {
          file: 'style.css',
          code: `/* Colors and fonts used across the whole site */
:root {
  --ink: #111111;
  --muted: #6e6e73;
  --paper: #ffffff;
  --mist: #f5f5f7;
  --blue: #2d45ff;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 18px;
  line-height: 1.6;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
}

a {
  color: var(--blue);
}

/* Header and navigation */
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
}

.logo {
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
}

.site-header nav {
  display: flex;
  gap: 24px;
}

.site-header nav a {
  color: var(--muted);
  text-decoration: none;
}

.site-header nav a:hover {
  color: var(--ink);
}

/* Sections */
section {
  max-width: 1040px;
  margin: 0 auto;
  padding: 72px 24px;
}

h1 {
  font-size: 56px;
  line-height: 1.1;
  margin: 0 0 16px;
}

h2 {
  font-size: 36px;
  margin: 0 0 16px;
}

.hero {
  text-align: center;
}

.hero p {
  color: var(--muted);
  font-size: 22px;
}

/* Buttons */
.button {
  display: inline-block;
  padding: 14px 28px;
  border: 2px solid var(--blue);
  border-radius: 999px;
  background: var(--blue);
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}

.button:hover {
  background: #1a32e6;
  border-color: #1a32e6;
}

.button-outline {
  background: transparent;
  color: var(--blue);
}

.button-outline:hover {
  background: var(--mist);
  color: var(--blue);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Menu cards */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cards li {
  padding: 28px;
  border-radius: 20px;
  background: var(--mist);
}

.cards h3 {
  margin: 0 0 8px;
}

.cards p {
  margin: 0;
  color: var(--muted);
}

/* Image beside text */
.split {
  display: flex;
  align-items: center;
  gap: 48px;
}

.split img,
.split div {
  flex: 1;
}

/* Footer */
.site-footer {
  padding: 32px 24px;
  background: var(--ink);
  color: #ffffff;
  text-align: center;
}

/* Phones and small screens */
@media (max-width: 720px) {
  h1 {
    font-size: 38px;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .split {
    flex-direction: column;
  }

  .site-header nav {
    gap: 16px;
  }
}
`,
        },
      },
      {
        title: 'Make it yours',
        text: [
          'Save both files in your `my-website` folder, add your own photo named `bakery.jpg` (or change the file name in the `<img>` tag), and open `index.html` in your browser. Then work through the “Test before you publish” checklist and publish it.',
        ],
      },
    ],
    mistakes: [
      { problem: 'Copied code shows as plain text.', fix: 'Make sure you saved the file as `index.html`, not `index.html.txt`, and that it is plain text, not rich text.' },
    ],
    checklist: [
      'I saved both files and opened the page in my browser',
      'I replaced the example content with my own',
    ],
  },
];

export const glossary: { term: string; meaning: string }[] = [
  { term: 'Browser', meaning: 'The app you use to view websites, such as Chrome, Safari, Edge or Firefox.' },
  { term: 'HTML', meaning: 'The language that describes what is on a page: headings, text, images and links.' },
  { term: 'CSS', meaning: 'The language that describes how a page looks: colors, fonts, spacing and layout.' },
  { term: 'JavaScript', meaning: 'A programming language that makes pages respond to clicks and typing.' },
  { term: 'Tag', meaning: 'An HTML instruction in angle brackets, such as <p> to start a paragraph.' },
  { term: 'Attribute', meaning: 'Extra information inside a tag, such as href in a link or alt on an image.' },
  { term: 'Selector', meaning: 'The part of a CSS rule that picks which elements to style.' },
  { term: 'Responsive design', meaning: 'A layout that adapts to any screen size, from phones to large monitors.' },
  { term: 'Web host', meaning: 'A company that keeps your website files online so anyone can visit them.' },
  { term: 'Domain name', meaning: 'Your website’s address, such as maplestreetbakery.com, rented from a registrar.' },
  { term: 'DNS', meaning: 'The Domain Name System, the internet’s address book that sends visitors to your host.' },
  { term: 'HTTPS', meaning: 'A secure, private connection between a visitor and your website.' },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getLessonNeighbors(slug: string): { previous?: Lesson; next?: Lesson } {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index < 0) return {};
  return { previous: lessons[index - 1], next: lessons[index + 1] };
}

export function lessonNumber(slug: string): number {
  return lessons.findIndex((lesson) => lesson.slug === slug) + 1;
}

export const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
