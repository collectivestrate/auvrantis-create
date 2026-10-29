import { describe, expect, it } from 'vitest';
import { getLesson, getLessonNeighbors, lessonNumber, lessons, parts } from './learn-content';

describe('learning center content', () => {
  it('gives every lesson a unique, URL-safe slug', () => {
    const slugs = lessons.map((lesson) => lesson.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('puts every lesson in a known part, with parts in course order', () => {
    const partIds = parts.map((part) => part.id);
    const order = lessons.map((lesson) => partIds.indexOf(lesson.part));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('gives every lesson outcomes, steps and a checklist', () => {
    for (const lesson of lessons) {
      expect(lesson.outcomes.length).toBeGreaterThan(0);
      expect(lesson.steps.length).toBeGreaterThan(0);
      expect(lesson.checklist.length).toBeGreaterThan(0);
      expect(lesson.minutes).toBeGreaterThan(0);
      for (const step of lesson.steps) expect(step.text.length).toBeGreaterThan(0);
    }
  });

  it('closes every inline code backtick', () => {
    for (const lesson of lessons) {
      const strings = [lesson.summary, ...lesson.checklist, ...lesson.steps.flatMap((step) => [...step.text, step.tip ?? '']), ...lesson.mistakes.flatMap((m) => [m.problem, m.fix])];
      for (const text of strings) expect((text.match(/`/g) ?? []).length % 2).toBe(0);
    }
  });

  it('links lessons in order', () => {
    expect(getLesson(lessons[0].slug)).toBe(lessons[0]);
    expect(getLesson('missing')).toBeUndefined();
    expect(lessonNumber(lessons[2].slug)).toBe(3);
    expect(getLessonNeighbors(lessons[0].slug).previous).toBeUndefined();
    expect(getLessonNeighbors(lessons[0].slug).next).toBe(lessons[1]);
    expect(getLessonNeighbors(lessons[lessons.length - 1].slug).next).toBeUndefined();
  });
});
