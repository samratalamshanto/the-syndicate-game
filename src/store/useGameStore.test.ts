import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore profile', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      game: null,
      playerCount: 3,
      botDifficulty: 'medium',
    });
  });

  it('records a human win when an action completes the match', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const target = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: humanId,
        players: game.players.map((player) => {
          if (player.id === humanId) {
            return { ...player, money: 7 };
          }
          if (player.id === target.id) {
            return {
              ...player,
              cards: player.cards.map((card, index) => ({ ...card, status: index === 0 ? 'alive' : 'revealed' })),
            };
          }
          return {
            ...player,
            cards: player.cards.map((card) => ({ ...card, status: 'revealed' })),
          };
        }),
      },
    });

    useGameStore.getState().act({ type: 'eliminate', actorId: humanId, targetId: target.id });

    expect(useGameStore.getState().game?.phase).toBe('complete');
    expect(useGameStore.getState().profile.lifetimeWins).toBe(1);
    expect(useGameStore.getState().profile.currentStreak).toBe(1);
  });

  it('saves pending human choices so a reload can resume the prompt', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const bot = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: bot.id,
        players: game.players.map((player) =>
          player.id === bot.id ? { ...player, money: 3 } : player,
        ),
      },
    });

    useGameStore.getState().act({ type: 'attack', actorId: bot.id, targetId: humanId });

    const saved = localStorage.getItem('who-is-lying:game');

    expect(useGameStore.getState().game?.pendingChoice?.kind).toBe('revealCard');
    expect(saved).toBeTruthy();
    expect(saved ? JSON.parse(decodeURIComponent(atob(saved))).pendingChoice.kind : null).toBe('revealCard');
  });

  it('asks eliminated humans whether to spectate or restart', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const bot = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: bot.id,
        players: game.players.map((player) => {
          if (player.id === humanId) {
            return {
              ...player,
              cards: player.cards.map((card, index) => ({ ...card, status: index === 0 ? 'revealed' : 'alive' })),
            };
          }
          if (player.id === bot.id) {
            return { ...player, money: 3 };
          }
          return player;
        }),
      },
    });

    useGameStore.getState().act({ type: 'attack', actorId: bot.id, targetId: humanId });

    expect(useGameStore.getState().spectatorMode).toBe('choose');
  });

  it('builds a detailed challenge event for the challenge popup', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const bot = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: bot.id,
        players: game.players.map((player) =>
          player.id === bot.id
            ? {
                ...player,
                cards: [
                  { id: 'bot-thief', role: 'thief', status: 'alive' },
                  { id: 'bot-helper', role: 'helper', status: 'alive' },
                ],
              }
            : player,
        ),
      },
    });

    useGameStore.getState().act({
      type: 'challenge',
      actorId: bot.id,
      challengerId: humanId,
      claimedRole: 'leader',
      originalAction: { type: 'tax', actorId: bot.id },
    });

    expect(useGameStore.getState().challengeEvent).toMatchObject({
      challenger: 'You',
      actor: bot.name,
      claimedRole: 'leader',
      originalActionType: 'tax',
      targetName: null,
      loserName: bot.name,
      outcome: 'liar',
    });
  });
});
