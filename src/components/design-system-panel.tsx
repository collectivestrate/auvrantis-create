"use client";

import React from 'react';
import { designPresets } from '@/lib/design-system';
import type { Draft } from '@/lib/templates';

interface DesignSystemPanelProps {
  draft: Draft;
  onUpdateDraft: (draft: Draft) => void;
}

export default function DesignSystemPanel({ draft, onUpdateDraft }: DesignSystemPanelProps) {
  const applyPreset = (preset: typeof designPresets[0]) => {
    onUpdateDraft({
      ...draft,
      site: {
        ...draft.site,
        theme: {
          ink: preset.ink,
          paper: preset.paper,
          accent: preset.accent,
        },
      },
    });
  };

  return (
    <div className="design-system-panel">
      <h2>Design Presets</h2>
      <div className="preset-grid">
        {designPresets.map((preset) => (
          <button
            key={preset.id}
            className="preset-chip"
            style={{ backgroundColor: preset.accent }}
            onClick={() => applyPreset(preset)}
            title={preset.name}
          >
            <span className="preset-color" style={{ backgroundColor: preset.ink }} />
            <span className="preset-name">{preset.name}</span>
          </button>
        ))}
      </div>
      <div className="color-pickers">
        <label>
          Ink
          <input
            type="color"
            value={draft.site.theme.ink}
            onChange={(e) =>
              onUpdateDraft({
                ...draft,
                site: {
                  ...draft.site,
                  theme: { ...draft.site.theme, ink: e.target.value },
                },
              })
            }
          />
        </label>
        <label>
          Paper
          <input
            type="color"
            value={draft.site.theme.paper}
            onChange={(e) =>
              onUpdateDraft({
                ...draft,
                site: {
                  ...draft.site,
                  theme: { ...draft.site.theme, paper: e.target.value },
                },
              })
            }
          />
        </label>
        <label>
          Accent
          <input
            type="color"
            value={draft.site.theme.accent}
            onChange={(e) =>
              onUpdateDraft({
                ...draft,
                site: {
                  ...draft.site,
                  theme: { ...draft.site.theme, accent: e.target.value },
                },
              })
            }
          />
        </label>
      </div>
    </div>
  );
}