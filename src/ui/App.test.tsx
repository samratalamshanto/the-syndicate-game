import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../store/useGameStore';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      game: null,
      language: 'en',
      theme: 'dark',
      playerCount: 4,
      botDifficulty: 'medium',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders setup, switches Bangla, and starts a playable game', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getAllByRole('heading', { name: /the syndicate/i }).length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText(/language/i), 'bn');
    expect(screen.getByRole('button', { name: 'গেম শুরু' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'গেম শুরু' }));

    expect(screen.getAllByText('আপনার পালা').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /১ নিন/i })).toBeEnabled();
  });

  it('shows the human hand, hides opponent cards, and guides target selection', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start game/i }));

    expect(screen.getByRole('heading', { name: /your cards/i })).toBeInTheDocument();
    expect(screen.getAllByText(/choose one action below/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hidden/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /hacker: steal 2/i }));

    await waitFor(() => expect(screen.getAllByText(/now choose a player/i).length).toBeGreaterThan(0));
  });

  it('opens actions on the human turn and advances bot turns automatically', async () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    expect(screen.getByRole('heading', { name: /pick your move/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^take 1/i }));
    await act(async () => {
      vi.advanceTimersByTime(60);
    });

    expect(screen.queryByRole('button', { name: /run bot turn/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/bot 1 thinking/i).length).toBeGreaterThan(0);

    for (let index = 0; index < 5; index += 1) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByRole('heading', { name: /pick your move/i })).toBeInTheDocument();
  });

  it('keeps the active game page within a phone-width viewport', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 390 });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width: 640px') ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    expect(screen.getByRole('heading', { name: /your cards/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /pick your move/i })).toBeInTheDocument();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it('opens the in-game guide with the action flow and role reference', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start game/i }));
    await user.click(screen.getByRole('button', { name: /how to play/i }));

    expect(screen.getAllByRole('heading', { name: /how to play/i }).length).toBeGreaterThan(0);
    // These labels now also appear in the in-game phase indicator, so allow multiple.
    expect(screen.getAllByText('Action').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Challenge').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Resolve').length).toBeGreaterThan(0);
    expect(screen.getByText(/wrongly challenge/i)).toBeInTheDocument();
    expect(screen.getAllByText('Take 3 money.').length).toBeGreaterThan(0);
  });

  it('dismisses the in-game guide from a phone-width viewport', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 });
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 375 });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width: 640px') ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start game/i }));
    await user.click(screen.getByRole('button', { name: /how to play/i }));

    const dialog = screen.getByRole('dialog', { name: /how to play/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();

    fireEvent.click(dialog.parentElement!);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /how to play/i })).not.toBeInTheDocument());
  });
});
