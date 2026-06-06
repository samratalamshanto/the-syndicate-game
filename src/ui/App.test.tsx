import { act, fireEvent, render, screen } from '@testing-library/react';
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

    expect(screen.getAllByText(/now choose a player/i).length).toBeGreaterThan(0);
  });

  it('opens actions on the human turn and advances bot turns automatically', async () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    expect(screen.getByRole('heading', { name: /pick your move/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^take 1/i }));

    expect(screen.queryByRole('button', { name: /run bot turn/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/bot 1 thinking/i).length).toBeGreaterThan(0);

    for (let index = 0; index < 5; index += 1) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByRole('heading', { name: /pick your move/i })).toBeInTheDocument();
  });
});
