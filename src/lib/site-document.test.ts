import { describe, expect, it } from 'vitest';
import { serializeSite } from './site-document';

const site = {
  title: 'Studio <script>alert("x")</script>',
  description: 'A & B "design"',
  templateId: 'atelier',
  theme: { ink: '#111827', paper: '#FFFDF7', accent: '#2448FF' },
  sections: [
    { id: 'hero', type: 'hero', visible: true, title: 'Make <strong>good</strong> work', body: 'Always & forever', imageUrl: '' },
  ],
};

describe('serializeSite', () => {
  it('escapes customer text instead of treating it as markup', () => {
    const html = serializeSite(site);
    expect(html).toContain('Studio &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).toContain('Make &lt;strong&gt;good&lt;/strong&gt; work');
    expect(html).not.toContain('<script>alert');
  });

  it('rejects unsafe image URL schemes', () => {
    expect(() => serializeSite({
      ...site,
      sections: [{ ...site.sections[0], imageUrl: 'javascript:alert(1)' }],
    })).toThrow(/unsafe url/i);
  });

  it('allows only safe web URLs for customer supplied images', () => {
    expect(() => serializeSite({
      ...site,
      sections: [{ ...site.sections[0], imageUrl: 'data:text/html,<script>alert(1)</script>' }],
    })).toThrow(/unsafe url/i);
  });

  it('uses a real contact email when supplied and never invents a success form', () => {
    const withoutContact = serializeSite(site);
    expect(withoutContact).not.toContain('mailto:');
    expect(withoutContact).not.toContain('href="#contact"');
    const withContact = serializeSite({
      ...site,
      contactEmail: 'hello@example.com',
      sections: [...site.sections, { id: 'contact', type: 'contact', visible: true, title: 'Contact us', body: 'Say hello.' }],
    });
    expect(withContact).toContain('href="mailto:hello@example.com"');
    expect(() => serializeSite({ ...site, contactEmail: 'javascript:alert(1)' })).toThrow(/invalid contact email/i);
  });

  it('does not add product branding to a customer website', () => {
    expect(serializeSite(site)).not.toContain('Auvrantis Group');
    expect(serializeSite(site)).not.toContain('Auvrantis Create');
  });

  it('uses a known template class without allowing markup in layout names', () => {
    expect(serializeSite({ ...site, templateId: 'fieldwork' })).toContain('<body class="template-fieldwork">');
    expect(serializeSite({ ...site, templateId: 'atelier onload=alert(1)' })).toContain('<body class="template-atelier">');
  });

  it('renders the hero once at its position in the section order', () => {
    const orderedSite = {
      ...site,
      sections: [
        { id: 'about', type: 'about', visible: true, title: 'About comes first', body: 'First content.' },
        { ...site.sections[0], title: 'Hero stays in order' },
        { id: 'services', type: 'services', visible: true, title: 'Services come last', body: 'Last content.' },
      ],
    };
    const html = serializeSite(orderedSite);
    expect(html.match(/Hero stays in order/g)).toHaveLength(1);
    expect(html.indexOf('About comes first')).toBeLessThan(html.indexOf('Hero stays in order'));
    expect(html.indexOf('Hero stays in order')).toBeLessThan(html.indexOf('Services come last'));
  });

  it('does not render the hero content when the hero section is hidden', () => {
    const html = serializeSite({ ...site, sections: [{ ...site.sections[0], visible: false }] });
    expect(html).not.toContain('Make &lt;strong&gt;good&lt;/strong&gt; work');
  });
});
