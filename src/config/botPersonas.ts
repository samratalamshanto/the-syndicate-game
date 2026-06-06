export type BotPersonaStyle = 'cautious' | 'aggressive' | 'unpredictable' | 'mirror';

export type BotPersona = {
  id: string;
  name: string;
  taglineKey: string;
  avatarSeed: string;
  style: BotPersonaStyle;
};

export const botPersonas: BotPersona[] = [
  { id: 'whisper', name: 'Whisper', taglineKey: 'whisper', avatarSeed: 'mint-shadow', style: 'cautious' },
  { id: 'iron', name: 'Iron', taglineKey: 'iron', avatarSeed: 'steel-flame', style: 'aggressive' },
  { id: 'vix', name: 'Vix', taglineKey: 'vix', avatarSeed: 'violet-spark', style: 'unpredictable' },
  { id: 'pari', name: 'Pari', taglineKey: 'pari', avatarSeed: 'gold-mist', style: 'mirror' },
  { id: 'tariq', name: 'Tariq', taglineKey: 'tariq', avatarSeed: 'teal-dagger', style: 'aggressive' },
  { id: 'nova', name: 'Nova', taglineKey: 'nova', avatarSeed: 'blue-orbit', style: 'unpredictable' },
  { id: 'mori', name: 'Mori', taglineKey: 'mori', avatarSeed: 'amber-quiet', style: 'cautious' },
  { id: 'echo', name: 'Echo', taglineKey: 'echo', avatarSeed: 'rose-glass', style: 'mirror' },
];

export const getPersona = (personaId?: string) =>
  botPersonas.find((persona) => persona.id === personaId) ?? null;
