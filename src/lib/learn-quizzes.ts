// Short knowledge checks for the free course, keyed by lesson slug.
// `answer` is the index of the correct option.

export type QuizQuestion = { question: string; options: string[]; answer: number; explain: string };

export const quizzes: Record<string, QuizQuestion[]> = {
  'plan-your-website': [
    { question: 'What should you decide first?', options: ['Your colors', 'The one main job of your website', 'Your domain name'], answer: 1, explain: 'Every later choice should help with that one job.' },
    { question: 'Which photos should you use?', options: ['Any photo from a search engine', 'Photos you took or have permission to use', 'Photos from a competitor’s site'], answer: 1, explain: 'Using other people’s photos without permission can break copyright law.' },
  ],
  'how-websites-work': [
    { question: 'What does CSS control?', options: ['What is on the page', 'How the page looks', 'Where the site is hosted'], answer: 1, explain: 'HTML is the content; CSS is the design.' },
    { question: 'What is a domain name?', options: ['The address people type to reach your site', 'The company that stores your files', 'A kind of image file'], answer: 0, explain: 'The web host stores the files; the domain is the address.' },
  ],
  'set-up-your-workspace': [
    { question: 'What should your homepage file be called?', options: ['Home.html', 'index.html', 'homepage.txt'], answer: 1, explain: 'Web hosts look for index.html and show it as the homepage.' },
    { question: 'You changed your file. How do you see the change?', options: ['Save, then refresh the browser', 'Restart the computer', 'Rename the file'], answer: 0, explain: 'Save and refresh is the loop you use to build the whole site.' },
  ],
  'your-first-page': [
    { question: 'Where do headings and paragraphs go?', options: ['Inside <head>', 'Inside <body>', 'Before <!doctype html>'], answer: 1, explain: 'Everything visitors see goes inside <body>.' },
    { question: 'How many <h1> headings should a page have?', options: ['One', 'Three', 'As many as you like'], answer: 0, explain: 'One main heading tells people and search engines what the page is about.' },
  ],
  'structure-your-content': [
    { question: 'A link has href="#menu". What must the section have?', options: ['class="menu"', 'id="menu"', 'name="#menu"'], answer: 1, explain: 'The # link jumps to the element with that exact id.' },
    { question: 'Which tags make a bulleted list?', options: ['<ul> and <li>', '<list> and <item>', '<ol> and <p>'], answer: 0, explain: '<ul> is an unordered list and each <li> is one item.' },
  ],
  'add-images': [
    { question: 'What is alt text for?', options: ['Making the image load faster', 'Describing the image for people who cannot see it', 'Adding a caption under the image'], answer: 1, explain: 'Screen readers read alt text aloud, and it shows if the image fails to load.' },
    { question: 'About how wide should a photo be before you add it?', options: ['400 pixels', 'About 1,600 pixels', '6,000 pixels'], answer: 1, explain: 'Phone photos are often far larger and make the page slow.' },
  ],
  'style-with-css': [
    { question: 'Which selector matches class="hero"?', options: ['#hero', '.hero', 'hero'], answer: 1, explain: 'A dot selects a class; a # selects an id.' },
    { question: 'Why put colors in CSS variables in :root?', options: ['So you can change each color in one place', 'Because browsers require it', 'To make the page load faster'], answer: 0, explain: 'Change the variable once and every use updates.' },
  ],
  'layout-and-mobile': [
    { question: 'Which arranges items in equal columns?', options: ['grid-template-columns: repeat(3, 1fr)', 'text-align: center', 'margin: 0 auto'], answer: 0, explain: 'Grid with repeat(3, 1fr) makes three equal columns.' },
    { question: 'What does @media (max-width: 720px) do?', options: ['Applies the rules only on screens 720px wide or narrower', 'Makes the page 720px wide', 'Hides the page on phones'], answer: 0, explain: 'Media queries apply rules only when the condition is true.' },
  ],
  'buttons-and-contact': [
    { question: 'Which link opens the phone app to call?', options: ['href="phone:3125550123"', 'href="tel:+13125550123"', 'href="call://3125550123"'], answer: 1, explain: 'tel: links open the phone app with the number ready.' },
    { question: 'What is the best button text?', options: ['Click here', 'Call (312) 555-0123', 'Submit'], answer: 1, explain: 'Button text should say exactly what happens.' },
  ],
  'search-and-accessibility': [
    { question: 'What contrast ratio does WCAG ask for normal text?', options: ['At least 2 to 1', 'At least 4.5 to 1', 'At least 10 to 1'], answer: 1, explain: '4.5 to 1 is the common guideline for normal-sized text.' },
    { question: 'Should you remove focus outlines?', options: ['Yes, they look untidy', 'No, keyboard users need them', 'Only on buttons'], answer: 1, explain: 'You can restyle the outline, but never remove it.' },
  ],
  'test-before-you-publish': [
    { question: 'Where can you check your HTML for errors?', options: ['validator.w3.org', 'Your email inbox', 'The domain registrar'], answer: 0, explain: 'The W3C validator is free and lists errors from the top.' },
    { question: 'What is a good way to catch typos?', options: ['Read the page out loud', 'Make the text smaller', 'Use more headings'], answer: 0, explain: 'Reading aloud catches mistakes your eyes skip over.' },
  ],
  'publish-your-website': [
    { question: 'What does DNS do?', options: ['Sends visitors to the right host for your domain', 'Stores your photos', 'Checks your spelling'], answer: 0, explain: 'DNS is the internet’s address book.' },
    { question: 'Your host says “page not found.” What should you check first?', options: ['That index.html is at the top of the uploaded folder', 'Your font size', 'Your color variables'], answer: 0, explain: 'The homepage must be named index.html and be at the top level.' },
  ],
  'build-faster-with-the-studio': [
    { question: 'Where are Studio drafts saved?', options: ['In this browser only', 'On every device automatically', 'In your email'], answer: 0, explain: 'Export a JSON backup to move a draft to another computer.' },
    { question: 'How do you get a file to upload to any host?', options: ['Choose “Export website”', 'Take a screenshot', 'Copy the page address'], answer: 0, explain: 'Export website downloads a complete HTML file.' },
  ],
  'the-complete-code': [
    { question: 'Which two files make up the finished site?', options: ['index.html and style.css', 'home.doc and design.pdf', 'site.txt and colors.txt'], answer: 0, explain: 'One HTML file for the content and one CSS file for the design.' },
    { question: 'Where should you start to change the look of the whole site?', options: ['The colors in :root', 'The footer text', 'The image file name'], answer: 0, explain: 'The color variables in :root are used everywhere.' },
  ],
};
