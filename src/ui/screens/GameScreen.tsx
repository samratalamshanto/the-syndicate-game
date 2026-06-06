import { BookOpen, Eye, ScrollText, Sparkles, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPlayerView, requiredRoleForAction } from '../../domain/game/engine';
import type { ActionType, GameAction, PrimaryGameAction, RoleId } from '../../domain/game/types';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { roleColors } from '../../config/branding';
import { getPersona } from '../../config/botPersonas';
import { ActionCard } from '../widgets/ActionCard';
import { ChallengeBanner } from '../widgets/ChallengeBanner';
import { ChooseExchangePrompt } from '../widgets/ChooseExchangePrompt';
import { ChooseRevealPrompt } from '../widgets/ChooseRevealPrompt';
import { CoinFlight } from '../widgets/CoinFlight';
import { EliminatedPrompt } from '../widgets/EliminatedPrompt';
import { GuidePanel } from '../widgets/GuidePanel';
import { HumanHand } from '../widgets/HumanHand';
import { PayoffBanner } from '../widgets/PayoffBanner';
import { PlayerSeat } from '../widgets/PlayerSeat';
import { ReactPrompt } from '../widgets/ReactPrompt';
import { RevealMoment } from '../widgets/RevealMoment';
import { TableCenter } from '../widgets/TableCenter';
import { useMediaQuery } from '../hooks/useMediaQuery';

type PendingAction = Extract<ActionType, 'steal' | 'attack' | 'eliminate'> | null;
type OverlayKey = 'guide' | 'log' | null;
type BotPhase = 'idle' | 'thinking' | 'announcing' | 'awaitReaction' | 'resolving';
type BotTurnState = {
  phase: BotPhase;
  actorId: string | null;
  action: GameAction | null;
};

const actionOrder: ActionType[] = ['income', 'fundRaise', 'tax', 'exchange', 'steal', 'attack', 'eliminate'];
export const BOT_TIMING = {
  thinkingMs: 1000,
  announcingMs: 800,
  resolvingMs: 500,
  reactWindowMs: 6000,
  flavorMs: 1400,
} as const;

const blockRolesForAction = (action: GameAction): RoleId[] => {
  if (action.type === 'fundRaise') return ['leader'];
  if (action.type === 'steal') return ['helper'];
  if (action.type === 'attack') return ['reporter'];
  return [];
};

const canHumanReact = (action: GameAction | null, game: ReturnType<typeof useGameStore.getState>['game']) => {
  if (
    !action ||
    !game ||
    action.type === 'challenge' ||
    action.type === 'block' ||
    action.type === 'chooseRevealCard' ||
    action.type === 'chooseExchangeKeep'
  ) {
    return false;
  }
  const human = game.players.find((player) => player.id === game.config.humanPlayerId);
  if (!human || human.id === action.actorId || human.cards.every((card) => card.status !== 'alive')) return false;
  return requiredRoleForAction(action.type) !== null || blockRolesForAction(action).length > 0;
};

const playSound = (_name: 'coin' | 'reveal' | 'eliminate' | 'turn', muted: boolean) => {
  if (muted) return;
};

export const GameScreen = () => {
  const {
    game,
    language,
    theme,
    soundMuted,
    series,
    profileMatchResult,
    payoffEvent,
    flavorEvent,
    gameSummary,
    revealEvent,
    challengeEvent,
    coinEvent,
    spectatorMode,
    act,
    chooseBotAction,
    resolveBotAction,
    clearRevealEvent,
    clearChallengeEvent,
    clearCoinEvent,
    clearPayoffEvent,
    clearFlavorEvent,
    newGame,
    backToSetup,
    nextRound,
    setSpectatorMode,
  } = useGameStore();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [overlay, setOverlay] = useState<OverlayKey>(null);
  const [botTurn, setBotTurn] = useState<BotTurnState>({ phase: 'idle', actorId: null, action: null });
  const [handFlash, setHandFlash] = useState(false);
  const [shakingTargetId, setShakingTargetId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const bankRef = useRef<HTMLDivElement | null>(null);
  const coinRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const t = translations[language];
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const isHumanTurnSignal = Boolean(
    game &&
      game.currentPlayerId === game.config.humanPlayerId &&
      game.phase !== 'complete' &&
      game.pendingChoice === null &&
      spectatorMode !== 'choose',
  );

  useEffect(() => {
    setPendingAction(null);
  }, [game?.currentPlayerId, game?.phase]);

  useEffect(() => {
    if (
      !game ||
      game.phase === 'complete' ||
      game.pendingChoice !== null ||
      spectatorMode === 'choose' ||
      game.currentPlayerId === game.config.humanPlayerId
    ) {
      setBotTurn({ phase: 'idle', actorId: null, action: null });
      return undefined;
    }
    if (botTurn.phase !== 'idle' || botTurn.actorId === game.currentPlayerId) {
      return undefined;
    }
    setBotTurn({ phase: 'thinking', actorId: game.currentPlayerId, action: null });
    return undefined;
  }, [botTurn.actorId, botTurn.phase, game, spectatorMode]);

  useEffect(() => {
    if (botTurn.phase !== 'thinking') {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const action = chooseBotAction();
      setBotTurn((currentTurn) =>
        currentTurn.phase === 'thinking'
          ? { phase: action ? 'announcing' : 'idle', actorId: currentTurn.actorId, action }
          : currentTurn,
      );
    }, BOT_TIMING.thinkingMs);
    return () => window.clearTimeout(timer);
  }, [botTurn.phase, chooseBotAction]);

  useEffect(() => {
    if (botTurn.phase !== 'announcing') {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setBotTurn((currentTurn) => ({
        ...currentTurn,
        phase: currentTurn.action && canHumanReact(currentTurn.action, game) ? 'awaitReaction' : 'resolving',
      }));
    }, BOT_TIMING.announcingMs);
    return () => window.clearTimeout(timer);
  }, [botTurn.phase, game]);

  useEffect(() => {
    if (botTurn.phase !== 'resolving' || !botTurn.action) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      resolveBotAction(botTurn.action!);
      setBotTurn({ phase: 'idle', actorId: null, action: null });
    }, BOT_TIMING.resolvingMs);
    return () => window.clearTimeout(timer);
  }, [botTurn.action, botTurn.phase, resolveBotAction]);

  useEffect(() => {
    if (!isHumanTurnSignal) {
      return undefined;
    }
    setHandFlash(true);
    playSound('turn', soundMuted);
    const timer = window.setTimeout(() => setHandFlash(false), 900);
    return () => window.clearTimeout(timer);
  }, [isHumanTurnSignal, soundMuted]);

  useEffect(() => {
    if (!coinEvent) return;
    playSound('coin', soundMuted);
  }, [coinEvent, soundMuted]);

  useEffect(() => {
    if (!revealEvent) return;
    playSound(revealEvent.eliminated ? 'eliminate' : 'reveal', soundMuted);
  }, [revealEvent, soundMuted]);

  useEffect(() => {
    if (!payoffEvent) return undefined;
    const timer = window.setTimeout(() => clearPayoffEvent(payoffEvent.id), payoffEvent.type === 'doubleShot' ? 1900 : 1500);
    return () => window.clearTimeout(timer);
  }, [clearPayoffEvent, payoffEvent]);

  useEffect(() => {
    if (!flavorEvent) return undefined;
    const timer = window.setTimeout(() => clearFlavorEvent(flavorEvent.id), BOT_TIMING.flavorMs);
    return () => window.clearTimeout(timer);
  }, [clearFlavorEvent, flavorEvent]);

  const human = useMemo(
    () => game?.players.find((p) => p.id === game.config.humanPlayerId) ?? null,
    [game],
  );
  const humanMoney = human?.money ?? 0;
  const disabledByCost: Partial<Record<ActionType, boolean>> = {
    attack: humanMoney < 3,
    eliminate: humanMoney < 7,
  };

  if (!game || !human) {
    return null;
  }

  const view = getPlayerView(game, human.id);
  const humanView = view.players.find((p) => p.id === human.id)!;
  const current = game.players.find((p) => p.id === game.currentPlayerId)!;
  const opponents = view.players.filter((p) => p.id !== human.id);
  const opponentCount = opponents.length;
  const seatDensity = opponentCount >= 6 ? 'compact' : 'normal';
  const isHumanTurn =
    game.currentPlayerId === human.id &&
    game.phase !== 'complete' &&
    humanView.aliveCards > 0 &&
    game.pendingChoice === null &&
    spectatorMode !== 'watching' &&
    spectatorMode !== 'choose';
  const targetable = pendingAction !== null && isHumanTurn;
  const isComplete = game.phase === 'complete';
  const winner = isComplete ? game.players.find((p) => p.id === game.winnerId) : null;
  const humanRoles = human.cards.filter((card) => card.status === 'alive').map((card) => card.role);
  const humanPendingChoice = game.pendingChoice?.playerId === human.id ? game.pendingChoice : null;
  const reactPromptActive = botTurn.phase === 'awaitReaction' && botTurn.action !== null && game.pendingChoice === null;
  const seriesWinner = series.humanWins > series.botWins ? human : winner;
  const summaryLines = gameSummary
    ? [
        formatMessage(t.common.roundCount, { value: gameSummary.roundCount }),
        formatMessage(t.common.humanBluffsCalled, { value: gameSummary.humanBluffsCalled }),
        formatMessage(t.common.humanBluffsCaught, { value: gameSummary.humanBluffsCaught }),
        formatMessage(t.common.mostDamagingAction, {
          value: formatMessage(
            t.logs[gameSummary.mostDamagingAction.key] ?? gameSummary.mostDamagingAction.key,
            gameSummary.mostDamagingAction.values,
          ),
        }),
        formatMessage(t.common.finalBlow, {
          value: formatMessage(
            t.logs[gameSummary.finalBlow.key] ?? gameSummary.finalBlow.key,
            gameSummary.finalBlow.values,
          ),
        }),
      ]
    : [];
  const profileResultLine = profileMatchResult
    ? profileMatchResult.humanWon
      ? `+1 ${t.common.wins} — ${formatMessage(t.common.streakUp, { n: profileMatchResult.streak })}`
      : profileMatchResult.previousStreak > 0
        ? formatMessage(t.common.streakBroken, { n: profileMatchResult.previousStreak })
        : `+1 ${t.common.losses} — ${t.common.streak} ${Math.abs(profileMatchResult.streak)}`
    : null;

  // Split opponents around table: top row + side seats.
  // 1 opp: top center. 2: top split. 3: top center + 2 sides. 4-7: top row + side rows.
  const topRow: typeof opponents = [];
  const leftRow: typeof opponents = [];
  const rightRow: typeof opponents = [];
  if (opponentCount <= 3) {
    topRow.push(...opponents);
  } else {
    topRow.push(...opponents.slice(0, 3));
    const side = opponents.slice(3);
    const leftCount = Math.ceil(side.length / 2);
    leftRow.push(...side.slice(0, leftCount));
    rightRow.push(...side.slice(leftCount));
  }

  const currentBotThinking = botTurn.phase === 'thinking' && botTurn.actorId === current.id;
  const botAnnouncementActor = botTurn.actorId
    ? game.players.find((player) => player.id === botTurn.actorId)?.name ?? current.name
    : current.name;
  const botAnnouncement = botTurn.action
    ? {
        actor: formatMessage(t.common.botPlays, { bot: botAnnouncementActor }),
        action: t.actions[botTurn.action.type],
        accent: requiredRoleForAction(botTurn.action.type) ? `bg-gradient-to-r ${roleColors[requiredRoleForAction(botTurn.action.type)!]} bg-clip-text text-transparent` : 'gold-text',
      }
    : null;

  const tablePrompt = isComplete
    ? `${t.common.winner}: ${winner?.name ?? ''}`
    : pendingAction
      ? t.common.chooseTarget
      : isHumanTurn
        ? t.common.chooseAction
        : botTurn.phase === 'resolving'
          ? t.common.actionResolves
          : formatMessage(t.common.botThinking, { bot: current.name });

  const subPrompt = pendingAction ? `${t.actions[pendingAction]} →` : isHumanTurn ? t.common.actionPanelTitle : '';

  const highlight: 'turn' | 'target' | 'thinking' | 'winner' = isComplete
    ? 'winner'
    : pendingAction
      ? 'target'
      : isHumanTurn
        ? 'turn'
        : 'thinking';

  const chooseAction = (type: ActionType) => {
    if (!isHumanTurn || game.pendingChoice !== null) return;
    if (type === 'steal' || type === 'attack' || type === 'eliminate') {
      setPendingAction(type);
      return;
    }
    act({ type, actorId: human.id } as GameAction);
  };

  const chooseTarget = (targetId: string) => {
    if (!pendingAction) return;
    setShakingTargetId(targetId);
    window.setTimeout(() => {
      act({ type: pendingAction, actorId: human.id, targetId } as GameAction);
      setPendingAction(null);
      setShakingTargetId(null);
    }, 150);
  };

  const reactToBot = (kind: 'challenge' | 'block' | 'pass', blockRole?: RoleId) => {
    if (!botTurn.action || !botTurn.actorId || botTurn.action.type === 'challenge' || botTurn.action.type === 'block') {
      return;
    }
    if (kind === 'challenge') {
      const claimedRole = requiredRoleForAction(botTurn.action.type);
      if (!claimedRole) return;
      setBotTurn({
        phase: 'resolving',
        actorId: botTurn.actorId,
        action: {
          type: 'challenge',
          actorId: botTurn.actorId,
          challengerId: human.id,
          claimedRole,
          originalAction: botTurn.action as PrimaryGameAction,
        },
      });
      return;
    }
    if (kind === 'block' && blockRole) {
      setBotTurn({
        phase: 'resolving',
        actorId: botTurn.actorId,
        action: {
          type: 'block',
          actorId: botTurn.actorId,
          blockerId: human.id,
          blockingRole: blockRole,
          originalAction: botTurn.action as PrimaryGameAction,
        },
      });
      return;
    }
    setBotTurn({ phase: 'resolving', actorId: botTurn.actorId, action: botTurn.action });
  };

  const flavorLineFor = (playerId: string) => {
    if (!flavorEvent || flavorEvent.playerId !== playerId) return null;
    const persona = getPersona(game.players.find((player) => player.id === playerId)?.personaId);
    const lines = persona ? t.bot.flavor[persona.style]?.[flavorEvent.lineKey] : null;
    return lines?.[0] ?? null;
  };

  const copySummary = () => {
    const text = summaryLines.join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1200);
  };

  const tableTheme = theme === 'dark' ? 'felt-table' : 'felt-table-light';
  const aliveHumanCards = human.cards.filter((card) => card.status === 'alive');
  const showEliminatedPrompt = game.phase === 'action' && spectatorMode === 'choose';
  const isSpectating = spectatorMode === 'watching';
  const revealDetail =
    humanPendingChoice?.kind === 'revealCard'
      ? formatRevealChoiceDetail(game, humanPendingChoice.source, t)
      : '';

  return (
    <section className="relative grid flex-1 gap-3 py-3 sm:gap-4 sm:py-4">
      {/* === TABLE === */}
      <div
        className={`relative overflow-hidden rounded-[1.5rem] ${tableTheme} px-3 py-4 sm:rounded-[2.25rem] sm:px-6 sm:py-8 ${
          isHumanTurn || reactPromptActive ? 'pb-[10rem] sm:pb-[15rem]' : ''
        } ${humanView.aliveCards === 1 ? 'last-card-table' : ''}`}
      >
        {/* Floating helpers */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOverlay('log')}
            className="inline-flex min-h-10 min-w-10 items-center gap-1 rounded-full border border-brass/45 bg-black/45 px-3 py-1.5 text-xs font-bold text-paper backdrop-blur hover:bg-brass/25"
            aria-label="Log"
          >
            <ScrollText size={14} /> <span className="hidden xs:inline">log</span>
          </button>
          <button
            type="button"
            onClick={() => setOverlay('guide')}
            className="inline-flex min-h-10 min-w-10 items-center gap-1 rounded-full border border-brass/45 bg-black/45 px-3 py-1.5 text-xs font-bold text-paper backdrop-blur hover:bg-brass/25"
            aria-label={t.common.guide}
          >
            <BookOpen size={14} /> <span className="hidden xs:inline">{t.common.guide}</span>
          </button>
        </div>

        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-brass/45 bg-black/45 px-3 py-1.5">
          <Sparkles size={13} className="text-brass" />
          <span className="font-display text-xs font-black uppercase tracking-widest text-paper">
            <span className="hidden xs:inline">round </span>
            {Math.max(1, Math.floor(game.log.length / Math.max(1, game.players.length)) + 1)}
          </span>
        </div>

        {isSpectating ? (
          <div className="absolute left-3 top-14 z-20 flex items-center gap-1.5 rounded-full border border-emerald-300/45 bg-black/55 px-3 py-1.5 text-emerald-200 backdrop-blur">
            <Eye size={13} />
            <span className="font-display text-xs font-black uppercase tracking-widest">{t.common.spectating}</span>
          </div>
        ) : null}

        {/* Phone opponent strip */}
        <div className="relative z-10 mt-11 sm:hidden">
          <div className="scroll-tight -mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-2">
            {opponents.map((p) => (
              <PlayerSeat
                key={`phone-${p.id}`}
                player={p}
                isActive={p.id === game.currentPlayerId}
                isTargetable={targetable}
                isThinking={currentBotThinking && p.id === game.currentPlayerId}
                isShaking={p.id === shakingTargetId}
                flavorLine={flavorLineFor(p.id)}
                density="compact"
                variant="phone"
                coinRef={(node) => {
                  if (!isDesktop) coinRefs.current[p.id] = node;
                }}
                onSelectTarget={chooseTarget}
                compact
              />
            ))}
          </div>
          {opponentCount >= 6 ? (
            <div className="pointer-events-none absolute right-2 top-2 rounded-full border border-brass/40 bg-night/85 px-2 py-1 text-[10px] font-black text-paper shadow-gold">
              1 / {opponentCount}
            </div>
          ) : null}
        </div>

        {/* Top row of opponents */}
        <div className="relative z-10 mt-10 hidden gap-3 sm:grid sm:grid-cols-3">
          {topRow.length === 0 ? <div className="h-1" /> : null}
          {topRow.map((p) => (
            <PlayerSeat
              key={p.id}
              player={p}
              isActive={p.id === game.currentPlayerId}
              isTargetable={targetable}
              isThinking={currentBotThinking && p.id === game.currentPlayerId}
              isShaking={p.id === shakingTargetId}
              flavorLine={flavorLineFor(p.id)}
              density={seatDensity}
              coinRef={(node) => {
                if (isDesktop) coinRefs.current[p.id] = node;
              }}
              onSelectTarget={chooseTarget}
              compact
            />
          ))}
        </div>

        {/* Middle row: side seats + center */}
        <div className="relative z-10 mt-3 hidden gap-3 sm:grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)_minmax(0,0.85fr)]">
          <div className="grid content-start gap-3">
            {leftRow.map((p) => (
              <PlayerSeat
                key={p.id}
                player={p}
                isActive={p.id === game.currentPlayerId}
                isTargetable={targetable}
                isThinking={currentBotThinking && p.id === game.currentPlayerId}
                isShaking={p.id === shakingTargetId}
                flavorLine={flavorLineFor(p.id)}
                density={seatDensity}
                coinRef={(node) => {
                  if (isDesktop) coinRefs.current[p.id] = node;
                }}
                onSelectTarget={chooseTarget}
                compact
              />
            ))}
          </div>

          <TableCenter
            prompt={tablePrompt}
            subPrompt={botTurn.phase === 'announcing' ? t.common.showingCard : subPrompt}
            highlight={highlight}
            announcement={botTurn.phase === 'announcing' ? botAnnouncement : null}
            bankRef={isDesktop ? bankRef : undefined}
          />

          <div className="grid content-start gap-3">
            {rightRow.map((p) => (
              <PlayerSeat
                key={p.id}
                player={p}
                isActive={p.id === game.currentPlayerId}
                isTargetable={targetable}
                isThinking={currentBotThinking && p.id === game.currentPlayerId}
                isShaking={p.id === shakingTargetId}
                flavorLine={flavorLineFor(p.id)}
                density={seatDensity}
                coinRef={(node) => {
                  if (isDesktop) coinRefs.current[p.id] = node;
                }}
                onSelectTarget={chooseTarget}
                compact
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-2 sm:hidden">
          <TableCenter
            prompt={tablePrompt}
            subPrompt={botTurn.phase === 'announcing' ? t.common.showingCard : subPrompt}
            highlight={highlight}
            announcement={botTurn.phase === 'announcing' ? botAnnouncement : null}
            bankRef={!isDesktop ? bankRef : undefined}
          />
        </div>

        {/* Human seat */}
        <div className="relative z-10 mt-3 sm:mt-5">
          <HumanHand
            player={humanView}
            isActive={isHumanTurn}
            flash={handFlash}
            coinRef={(node) => {
              coinRefs.current[humanView.id] = node;
            }}
            onNewGame={newGame}
            onBackToSetup={backToSetup}
          />
        </div>

        {/* Winner / series overlay */}
        {isComplete && winner ? (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-end bg-black/60 backdrop-blur-sm sm:place-items-center">
            <div className="bottom-sheet surface-strong pointer-events-auto grid max-h-[92dvh] w-full max-w-xl gap-3 overflow-auto rounded-t-2xl border-2 border-brass px-5 py-5 text-center shadow-gold sm:rounded-2xl sm:px-8 sm:py-6">
              <Trophy size={36} className="mx-auto text-brass" />
              <p className="font-display text-3xl font-black gold-text">
                {series.length > 1 && series.matchOver ? t.common.seriesWinner : t.common.winner}
              </p>
              <p className="font-display text-2xl font-black">{series.length > 1 && series.matchOver ? seriesWinner?.name : winner.name}</p>
              {series.length > 1 ? (
                <p className="rounded-full bg-brass/15 px-3 py-1 font-display text-sm font-black text-brass">
                  {series.humanWins} - {series.botWins} · {formatMessage(t.common.roundOf, { n: series.round, m: series.length })}
                </p>
              ) : null}
              {series.length > 1 && !series.matchOver ? (
                <button
                  type="button"
                  onClick={nextRound}
                  className="mt-2 min-h-11 rounded-full bg-brass px-5 py-2 font-display font-black text-night"
                >
                  {t.common.nextRound}
                </button>
              ) : (
                <>
                  {summaryLines.length > 0 ? (
                    <div className="surface-muted grid gap-1 rounded-xl border border-token-soft px-4 py-3 text-left text-sm">
                      <p className="font-display font-black text-brass">{t.common.gameSummary}</p>
                      {summaryLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                      {profileResultLine ? (
                        <p className="mt-1 rounded-full bg-brass/15 px-3 py-1 font-display text-xs font-black text-brass">
                          {profileResultLine}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={copySummary}
                        className="surface-control mt-2 rounded-full border px-3 py-1.5 text-xs font-black"
                      >
                        {copiedSummary ? t.common.copied : t.common.copySummary}
                      </button>
                    </div>
                  ) : null}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={newGame}
                      className="min-h-11 rounded-full bg-brass px-5 py-2 font-display font-black text-night"
                    >
                      {t.common.sameSettings}
                    </button>
                    <button
                      type="button"
                      onClick={backToSetup}
                      className="surface-control min-h-11 rounded-full border px-5 py-2 font-display font-black"
                    >
                      {t.common.changeSettings}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {isSpectating && !isComplete ? (
          <button
            type="button"
            onClick={newGame}
            className="absolute bottom-3 right-3 z-20 min-h-11 rounded-full bg-brass px-4 py-2 font-display text-sm font-black text-night shadow-gold"
          >
            {t.common.endWatching}
          </button>
        ) : null}
      </div>

      {/* === ACTION HAND === */}
      {reactPromptActive && botTurn.action ? (
        <div className="sticky bottom-0 z-40 -mx-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <ReactPrompt
            action={botTurn.action}
            actorName={botAnnouncementActor}
            timeoutMs={BOT_TIMING.reactWindowMs}
            humanRoles={humanRoles}
            onReact={reactToBot}
          />
        </div>
      ) : isHumanTurn ? (
        <div className={`surface-strong sticky bottom-0 z-30 -mx-1 rounded-2xl border px-2 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur shadow-card sm:px-3 sm:py-3 ${handFlash ? 'human-turn-flash' : ''}`}>
          <div className="flex items-center justify-between gap-3 pb-1.5 sm:pb-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{t.common.yourTurn}</p>
              <h3 className="font-display text-base font-black sm:text-lg">
                {pendingAction ? t.common.chooseTarget : t.common.actionPanelTitle}
              </h3>
              <p className="text-app-muted text-[10px] sm:text-[11px]">
                {pendingAction ? `${t.actions[pendingAction]} · ${t.common.chooseTarget}` : t.common.chooseAction}
              </p>
            </div>
            {pendingAction ? (
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="surface-control grid h-11 w-11 place-items-center rounded-full border sm:h-9 sm:w-9"
                aria-label={t.common.cancel}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          {pendingAction ? (
            <div className="grid gap-2 rounded-xl border border-ember/55 bg-ember/15 px-3 py-2 text-sm font-black text-ember">
              {t.common.chooseTarget}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto scroll-tight pb-2">
              {actionOrder.map((type) => (
                <ActionCard
                  key={type}
                  type={type}
                  disabled={disabledByCost[type] ?? false}
                  onSelect={chooseAction}
                />
              ))}
            </div>
          )}
        </div>
      ) : !isComplete ? (
        <div className="surface-strong rounded-xl border px-4 py-2 text-center font-display text-sm font-black">
          {current.name} {t.common.thinking}...
          <span className="sr-only">Bot 1 thinking</span>
          <h3 className="sr-only">{t.common.actionPanelTitle}</h3>
        </div>
      ) : null}

      <CoinFlight
        event={coinEvent}
        fromRef={coinEvent?.from === 'bank' ? bankRef : { current: coinRefs.current[coinEvent?.from ?? ''] ?? null }}
        toRef={coinEvent?.to === 'bank' ? bankRef : { current: coinRefs.current[coinEvent?.to ?? ''] ?? null }}
        onDone={clearCoinEvent}
      />
      <PayoffBanner event={payoffEvent} onDone={clearPayoffEvent} />
      <ChallengeBanner event={challengeEvent} onDone={clearChallengeEvent} />
      <RevealMoment event={revealEvent} onDone={clearRevealEvent} />

      {humanPendingChoice?.kind === 'revealCard' ? (
        <ChooseRevealPrompt
          cards={aliveHumanCards}
          cause={humanPendingChoice.cause}
          mode={humanPendingChoice.mode}
          detail={revealDetail}
          onPick={(cardId) => act({ type: 'chooseRevealCard', playerId: human.id, cardId })}
        />
      ) : null}

      {humanPendingChoice?.kind === 'exchangeKeep' ? (
        <ChooseExchangePrompt
          alive={aliveHumanCards}
          offered={humanPendingChoice.offered}
          onConfirm={(keepCardIds) => act({ type: 'chooseExchangeKeep', playerId: human.id, keepCardIds })}
        />
      ) : null}

      {showEliminatedPrompt ? (
        <EliminatedPrompt
          onWatch={() => setSpectatorMode('watching')}
          onSameSettings={newGame}
          onChangeSettings={backToSetup}
        />
      ) : null}

      {/* === OVERLAYS === */}
      {overlay ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-3"
          onClick={() => setOverlay(null)}
        >
          <div
            className="bottom-sheet surface-strong relative max-h-[92dvh] w-full max-w-2xl overflow-auto scroll-tight rounded-t-2xl border-2 shadow-card sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="surface-strong sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-3">
              <h3 className="font-display text-lg font-black gold-text">
                {overlay === 'guide' ? t.common.guide : 'Game log'}
              </h3>
              <button
                type="button"
                onClick={() => setOverlay(null)}
                className="surface-control grid h-11 w-11 place-items-center rounded-full border sm:h-8 sm:w-8"
                aria-label={t.common.cancel}
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              {overlay === 'guide' ? (
                <GuidePanel />
              ) : (
                <ul className="grid gap-2 text-sm">
                  {[...game.log].reverse().map((entry) => (
                    <li key={entry.id} className="surface-muted rounded-md border border-token-soft px-3 py-2">
                      {formatMessage(t.logs[entry.messageKey] ?? entry.messageKey, entry.values)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

const formatRevealChoiceDetail = (
  game: NonNullable<ReturnType<typeof useGameStore.getState>['game']>,
  source: Extract<NonNullable<typeof game.pendingChoice>, { kind: 'revealCard' }>['source'],
  t: (typeof translations)['en'],
) => {
  const actor = game.players.find((player) => player.id === source.actorId)?.name ?? '';
  if (source.actionType === 'attack') {
    const role = source.claimedRole ? t.roles[source.claimedRole].name : t.actions.attack;
    return formatMessage(t.common.revealDetailAttack, { actor, role });
  }
  if (source.actionType === 'eliminate') {
    return formatMessage(t.common.revealDetailEliminate, { actor });
  }
  if (source.actionType === 'challenge') {
    const role = source.claimedRole ? t.roles[source.claimedRole].name : '';
    return formatMessage(t.common.revealDetailChallenge, { actor, role });
  }
  return t.common.chooseRevealTitle;
};
