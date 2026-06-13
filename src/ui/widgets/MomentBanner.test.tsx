import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore, type CardLossEvent, type ChallengeEvent, type PayoffEvent, type RevealEvent } from '../../store/useGameStore';
import { ChallengeBanner } from './ChallengeBanner';
import { CardLossMoment } from './CardLossMoment';
import { MOMENT_TIMING, MomentBanner } from './MomentBanner';
import { PayoffBanner } from './PayoffBanner';
import { RevealMoment } from './RevealMoment';

describe('MomentBanner', () => {
  beforeEach(() => {
    useGameStore.setState({ language: 'en', theme: 'dark', game: null });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onDone after timeoutMs', () => {
    const onDone = vi.fn();
    render(<MomentBanner onDone={onDone} timeoutMs={MOMENT_TIMING.normal} headline="Test" />);

    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(MOMENT_TIMING.normal);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('restarts timer when key changes for back-to-back events', () => {
    const onDone = vi.fn();
    const { rerender } = render(
      <MomentBanner key="e1" onDone={onDone} timeoutMs={MOMENT_TIMING.normal} headline="First" />,
    );

    vi.advanceTimersByTime(900);
    rerender(<MomentBanner key="e2" onDone={onDone} timeoutMs={MOMENT_TIMING.normal} headline="Second" />);
    vi.advanceTimersByTime(900);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(900);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('renders challenge headline and fires onDone after long timing', () => {
    const onDone = vi.fn();
    const event: ChallengeEvent = {
      id: 'challenge-1',
      challenger: 'Whisper',
      actor: 'Iron',
      claimedRole: 'leader',
      originalActionType: 'tax',
      targetName: null,
      loserName: 'Iron',
      outcome: 'liar',
    };

    render(<ChallengeBanner event={event} onDone={onDone} />);

    expect(screen.getByText(/caught Iron bluffing CEO/i)).toBeInTheDocument();
    vi.advanceTimersByTime(MOMENT_TIMING.long);
    expect(onDone).toHaveBeenCalledWith(event.id);
  });

  it('renders payoff headline and fires onDone after short timing', () => {
    const onDone = vi.fn();
    const event: PayoffEvent = { id: 'payoff-1', type: 'blocked', role: 'helper' };

    render(<PayoffBanner event={event} onDone={onDone} />);

    expect(screen.getByText(/blocked/i)).toBeInTheDocument();
    vi.advanceTimersByTime(MOMENT_TIMING.short);
    expect(onDone).toHaveBeenCalledWith(event.id);
  });

  it('renders card-loss headline and fires onDone after normal timing', () => {
    const onDone = vi.fn();
    const event: CardLossEvent = {
      id: 'loss-1',
      playerId: 'player-2',
      playerName: 'Iron',
      role: 'officer',
      actionType: 'attack',
      eliminated: false,
    };

    render(<CardLossMoment event={event} onDone={onDone} />);

    // The lost card returns to the deck face-down, so its role is not revealed.
    expect(screen.getByText(/Iron lost a card/i)).toBeInTheDocument();
    vi.advanceTimersByTime(MOMENT_TIMING.normal);
    expect(onDone).toHaveBeenCalledWith(event.id);
  });

  it('renders reveal headline and fires onDone after normal timing', () => {
    const onDone = vi.fn();
    const event: RevealEvent = {
      id: 'reveal-1',
      playerId: 'player-2',
      playerName: 'Iron',
      role: 'leader',
      actionType: 'challenge',
      eliminated: false,
    };

    render(<RevealMoment event={event} onDone={onDone} />);

    expect(screen.getByText(/Iron revealed CEO/i)).toBeInTheDocument();
    vi.advanceTimersByTime(MOMENT_TIMING.normal);
    expect(onDone).toHaveBeenCalledWith(event.id);
  });
});
