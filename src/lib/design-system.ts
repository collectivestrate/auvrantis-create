export type DesignPreset = { id: string; name: string; ink: string; paper: string; accent: string; typeScale: 'compact' | 'balanced' | 'expressive'; radius: 'square' | 'soft' | 'round'; buttonStyle: 'solid' | 'outline' | 'pill' };

export const designPresets: DesignPreset[] = [
  { id: 'signal', name: 'Signal', ink: '#111827', paper: '#FFFDF7', accent: '#2448FF', typeScale: 'expressive', radius: 'square', buttonStyle: 'solid' },
  { id: 'citrus', name: 'Citrus', ink: '#172014', paper: '#F5F8E8', accent: '#D7FF3F', typeScale: 'balanced', radius: 'soft', buttonStyle: 'solid' },
  { id: 'night-shift', name: 'Night shift', ink: '#FFFDF7', paper: '#111827', accent: '#FF745E', typeScale: 'expressive', radius: 'soft', buttonStyle: 'outline' },
  { id: 'studio', name: 'Studio', ink: '#2B2118', paper: '#FFF7ED', accent: '#E99A42', typeScale: 'compact', radius: 'round', buttonStyle: 'pill' },
];

export function getDesignPreset(id: string): DesignPreset {
  return designPresets.find((preset) => preset.id === id) ?? designPresets[0];
}
