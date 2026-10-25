import { describe, expect, it } from 'vitest';
import { designPresets, getDesignPreset } from './design-system';

describe('design system presets', () => {
  it('ships distinct, safe presets', () => {
    expect(designPresets.length).toBeGreaterThanOrEqual(4);
    expect(new Set(designPresets.map((preset) => preset.id)).size).toBe(designPresets.length);
    expect(designPresets.every((preset) => /^#[0-9A-F]{6}$/i.test(preset.accent))).toBe(true);
  });

  it('falls back safely for an unknown preset', () => {
    expect(getDesignPreset('missing').id).toBe(designPresets[0].id);
  });
});
