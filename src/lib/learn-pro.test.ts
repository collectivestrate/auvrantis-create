import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyStripeSignature } from './learn-access';
import { getProLesson, proCourses } from './learn-pro';

describe('learning center pro content', () => {
  it('gives every course and lesson a unique, URL-safe slug', () => {
    const courses = proCourses.map((course) => course.slug);
    expect(new Set(courses).size).toBe(courses.length);
    for (const course of proCourses) {
      const lessons = course.lessons.map((lesson) => lesson.slug);
      expect(new Set(lessons).size).toBe(lessons.length);
      for (const slug of [course.slug, ...lessons]) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('makes exactly the first lesson of each course a free preview', () => {
    for (const course of proCourses) {
      expect(course.lessons[0].preview).toBe(true);
      expect(course.lessons.slice(1).every((lesson) => !lesson.preview)).toBe(true);
    }
  });

  it('closes every inline code backtick', () => {
    for (const lesson of proCourses.flatMap((course) => course.lessons)) {
      const strings = [lesson.summary, ...lesson.checklist, ...lesson.steps.flatMap((step) => [...step.text, step.tip ?? '']), ...lesson.mistakes.flatMap((m) => [m.problem, m.fix])];
      for (const text of strings) expect((text.match(/`/g) ?? []).length % 2).toBe(0);
    }
  });

  it('finds lessons by course and slug', () => {
    const course = proCourses[0];
    expect(getProLesson(course.slug, course.lessons[1].slug)?.index).toBe(1);
    expect(getProLesson(course.slug, 'missing')).toBeUndefined();
    expect(getProLesson('missing', course.lessons[0].slug)).toBeUndefined();
  });
});

describe('stripe webhook signatures', () => {
  const secret = 'whsec_test_secret';
  const body = '{"id":"evt_1","type":"customer.subscription.updated"}';
  const now = 1_793_000_000_000;
  const t = Math.floor(now / 1000);
  const sign = (timestamp: number, payload = body) => createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');

  it('accepts a valid signature', () => {
    expect(verifyStripeSignature(body, `t=${t},v1=${sign(t)}`, secret, 300, now)).toBe(true);
  });

  it('accepts a valid signature among several', () => {
    expect(verifyStripeSignature(body, `t=${t},v1=${'0'.repeat(64)},v1=${sign(t)}`, secret, 300, now)).toBe(true);
  });

  it('rejects a changed body, a wrong secret, an old timestamp and a missing header', () => {
    expect(verifyStripeSignature(`${body} `, `t=${t},v1=${sign(t)}`, secret, 300, now)).toBe(false);
    expect(verifyStripeSignature(body, `t=${t},v1=${sign(t)}`, 'whsec_other', 300, now)).toBe(false);
    expect(verifyStripeSignature(body, `t=${t - 301},v1=${sign(t - 301)}`, secret, 300, now)).toBe(false);
    expect(verifyStripeSignature(body, null, secret, 300, now)).toBe(false);
    expect(verifyStripeSignature(body, `t=${t}`, secret, 300, now)).toBe(false);
  });
});
