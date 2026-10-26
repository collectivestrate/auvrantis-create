"use client';

import { designPresets } from '@/lib/design-system';
import { useDraft } from '@/lib/templates';

export default function DesignSystemPanel() {
  const [draft, setDraft] = useDraft();
  const inkRef = React.useRef<HTMLInputElement>(null);
  const paperRef = React.useRef<HTMLInputElement>(null);
  const accentRef = React.useRef<HTMLInputElement>(null);

  const applyPreset = (preset: typeof designPresets[0]) => {
    setDraft({
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
            ref={inkRef}
            type="color"
            value={draft.site.theme.ink}
            onChange={(e) =>
              setDraft({
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
            ref={paperRef}
            type="color"
            value={draft.site.theme.paper}
            onChange={(e) =>
              setDraft({
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
            ref={accentRef}
            type="color"
            value={draft.site.theme.accent}
            onChange={(e) =>
              setDraft({
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