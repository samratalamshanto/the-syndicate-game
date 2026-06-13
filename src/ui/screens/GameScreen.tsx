import { BookOpen, Clock3, Eye, ScrollText, Sparkles, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPlayerView, requiredRoleForAction } from '../../domain/game/engine';
import type { ActionType, GameAction, PrimaryGameAction, RoleId } from '../../domain/game/types';
import { formatMessage, translations } from '../../i18n/translations';
import type { BotReaction } from '../../ports/BotStrategy';
import { useGameStore } from '../../store/useGameStore';
import { roleColors } from '../../config/branding';
import { getPersona } from '../../config/botPersonas';
import { CardLossMoment } from '../widgets/CardLossMoment';
import { ChallengeBanner } from '../widgets/ChallengeBanner';
import { ChooseExchangePrompt } from '../widgets/ChooseExchangePrompt';
import { ChooseReplacementPrompt } from '../widgets/ChooseReplacementPrompt';
import { ChooseRevealPrompt } from '../widgets/ChooseRevealPrompt';
import { CoinFlight } from '../widgets/CoinFlight';
import { EliminatedPrompt } from '../widgets/EliminatedPrompt';
import { GuidePanel } from '../widgets/GuidePanel';
import { HumanHand } from '../widgets/HumanHand';
import { Modal } from '../widgets/Modal';
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
type BotCounterNotice = {
  botId: string;
  message: 'considering' | 'accepts' | 'counters';
} | null;

const actionOrder: ActionType[] = ['income', 'fundRaise', 'tax', 'exchange', 'steal', 'attack', 'eliminate'];
const actionCosts: Record<ActionType, number> = {
  income: 0,
  fundRaise: 0,
  tax: 0,
  exchange: 0,
  steal: 0,
  attack: 3,
  eliminate: 7,
};
const compactActionText = (type: ActionType, t: (typeof translations)['en']) => {
  if (type === 'income') return { title: t.actions.income, note: '+1 · safe' };
  if (type === 'fundRaise') return { title: t.actions.fundRaise.includes(':') ? t.actions.fundRaise.split(':').at(-1)?.trim() ?? t.actions.fundRaise : t.actions.fundRaise, note: '+2 · blockable' };
  if (type === 'tax') return { title: t.roles.leader.name, note: '+3' };
  if (type === 'exchange') return { title: t.roles.helper.name, note: 'exchange cards' };
  if (type === 'steal') return { title: t.roles.thief.name, note: 'steal 2' };
  if (type === 'attack') return { title: t.roles.officer.name, note: 'pay 3' };
  return { title: t.actions.eliminate, note: 'pay 7' };
};
export const BOT_TIMING = {
  thinkingMs: 1400,
  announcingMs: 1200,
  resolvingMs: 900,
  reactWindowMs: 6000,
  flavorMs: 1800,
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
    action.type === 'chooseExchangeKeep' ||
    action.type === 'chooseReplacementCard' ||
    action.type === 'chooseCounterChallenge'
  ) {
    return false;
  }
  const human = game.players.find((player) => player.id === game.config.humanPlayerId);
  if (!human || human.id === action.actorId || human.cards.every((card) => card.status !== 'alive')) return false;
  return requiredRoleForAction(action.type) !== null || blockRolesForAction(action).length > 0;
};

const botReactionAction = (
  game: NonNullable<ReturnType<typeof useGameStore.getState>['game']>,
  action: PrimaryGameAction,
  chooseBotReaction: (botId: string, pendingAction: PrimaryGameAction) => BotReaction,
): GameAction | null => {
  const actorIndex = game.players.findIndex((player) => player.id === action.actorId);
  const orderedPlayers = Array.from({ length: game.players.length - 1 }, (_, offset) => {
    const index = (actorIndex + offset + 1) % game.players.length;
    return game.players[index];
  });

  for (const player of orderedPlayers) {
    if (player.kind !== 'bot' || player.cards.every((card) => card.status !== 'alive')) {
      continue;
    }
    const reaction = chooseBotReaction(player.id, action);
    if (reaction.kind === 'challenge') {
      const claimedRole = requiredRoleForAction(action.type);
      if (claimedRole) {
        return {
          type: 'challenge',
          actorId: action.actorId,
          challengerId: player.id,
          claimedRole,
          originalAction: action,
        };
      }
    }
    if (reaction.kind === 'block') {
      return {
        type: 'block',
        actorId: action.actorId,
        blockerId: player.id,
        blockingRole: reaction.blockingRole,
        originalAction: action,
      };
    }
  }
  return null;
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
    cardLossEvent,
    challengeEvent,
    coinEvent,
    spectatorMode,
    act,
    chooseBotAction,
    chooseBotReaction,
    chooseBotCounterChallenge,
    resolveBotAction,
    clearRevealEvent,
    clearCardLossEvent,
    clearChallengeEvent,
    clearCoinEvent,
    clearPayoffEvent,
    clearFlavorEvent,
    newGame,
    backToSetup,
    nextRound,
    setSpectatorMode,
    reactTimerSeconds,
    setReactTimerSeconds,
  } = useGameStore();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [overlay, setOverlay] = useState<OverlayKey>(null);
  const [botTurn, setBotTurn] = useState<BotTurnState>({ phase: 'idle', actorId: null, action: null });
  const [botCounterNotice, setBotCounterNotice] = useState<BotCounterNotice>(null);
  const [handFlash, setHandFlash] = useState(false);
  const [shakingTargetId, setShakingTargetId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const bankRef = useRef<HTMLDivElement | null>(null);
  const coinRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const t = translations[language];
  const isWide = useMediaQuery('(min-width: 640px)');
  const isShort = useMediaQuery('(max-height: 560px)');
  // Narrow phones stack vertically; wide-but-short (a phone held sideways) gets the
  // compact around-the-table board; anything taller keeps the desktop board.
  const layoutMode: 'portrait' | 'landscape' | 'desktop' = !isWide ? 'portrait' : isShort ? 'landscape' : 'desktop';
  const isDesktop = layoutMode === 'desktop';
  const reactWindowMs = reactTimerSeconds > 0 ? reactTimerSeconds * 1000 : 0;
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
        ...(currentTurn.action && canHumanReact(currentTurn.action, game)
          ? { phase: 'awaitReaction' as const }
          : {
              phase: 'resolving' as const,
              action: currentTurn.action && game
                ? botReactionAction(game, currentTurn.action as PrimaryGameAction, chooseBotReaction) ?? currentTurn.action
                : currentTurn.action,
            }),
      }));
    }, BOT_TIMING.announcingMs);
    return () => window.clearTimeout(timer);
  }, [botTurn.phase, chooseBotReaction, game]);

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
    if (!cardLossEvent) return;
    playSound(cardLossEvent.eliminated ? 'eliminate' : 'reveal', soundMuted);
  }, [cardLossEvent, soundMuted]);

  useEffect(() => {
    if (!game) {
      return undefined;
    }
    const pending = game?.pendingChoice;
    if (pending?.kind !== 'counterChallenge') {
      return undefined;
    }
    const actor = game.players.find((player) => player.id === pending.playerId);
    if (actor?.kind !== 'bot') {
      return undefined;
    }
    setBotCounterNotice({ botId: actor.id, message: 'considering' });
    const timer = window.setTimeout(() => {
      const challenge = chooseBotCounterChallenge(actor.id, pending.blockingRole);
      setBotCounterNotice({ botId: actor.id, message: challenge ? 'counters' : 'accepts' });
      act({ type: 'chooseCounterChallenge', playerId: actor.id, challenge });
      window.setTimeout(() => setBotCounterNotice(null), 1000);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [act, chooseBotCounterChallenge, game]);

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
  const unaffordableBy = (type: ActionType) => Math.max(0, actionCosts[type] - humanMoney);

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
  const counterChallengeChoice = humanPendingChoice?.kind === 'counterChallenge' ? humanPendingChoice : null;
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
  const dailyResultLine =
    game.config.seed && gameSummary
      ? `Syndicate Daily ${game.config.seed} · ${winner?.id === game.config.humanPlayerId ? 'won' : 'lost'} in ${gameSummary.roundCount} rounds · ${gameSummary.humanBluffsCalled} bluffs called`
      : null;
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
  if (opponentCount === 1) {
    topRow.push(opponents[0]);
  } else if (opponentCount === 2) {
    leftRow.push(opponents[0]);
    rightRow.push(opponents[1]);
  } else if (opponentCount === 3) {
    // 4-player table: opponents seated left / top / right around the human (bottom).
    leftRow.push(opponents[0]);
    topRow.push(opponents[1]);
    rightRow.push(opponents[2]);
  } else {
    topRow.push(...opponents.slice(0, 3));
    const side = opponents.slice(3);
    const leftCount = Math.ceil(side.length / 2);
    leftRow.push(...side.slice(0, leftCount));
    rightRow.push(...side.slice(leftCount));
  }

  // Landscape-phone board: human at the bottom (S), opponents at top (N), left (W), right (E).
  // The top row is capped (it can only fit a couple of seats across); extra opponents
  // are balanced onto the side columns so larger tables never overflow the board.
  const LANDSCAPE_TOP_MAX = 3;
  const lbLeft: typeof opponents = [];
  const lbTop: typeof opponents = [];
  const lbRight: typeof opponents = [];
  if (opponentCount === 1) {
    lbTop.push(opponents[0]);
  } else if (opponentCount === 2) {
    lbLeft.push(opponents[0]);
    lbRight.push(opponents[1]);
  } else {
    lbLeft.push(opponents[0]);
    lbRight.push(opponents[opponents.length - 1]);
    for (const opponent of opponents.slice(1, -1)) {
      if (lbTop.length < LANDSCAPE_TOP_MAX) lbTop.push(opponent);
      else if (lbLeft.length <= lbRight.length) lbLeft.push(opponent);
      else lbRight.push(opponent);
    }
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
    : botCounterNotice
      ? formatMessage(
          botCounterNotice.message === 'considering'
            ? t.common.botConsidering
            : botCounterNotice.message === 'counters'
              ? t.common.botCounters
              : t.common.botAccepts,
          { bot: game.players.find((player) => player.id === botCounterNotice.botId)?.name ?? '' },
        )
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

  const resolveWithBotReaction = (action: PrimaryGameAction) => {
    act(botReactionAction(game, action, chooseBotReaction) ?? action);
  };

  const chooseAction = (type: ActionType) => {
    if (!isHumanTurn || game.pendingChoice !== null) return;
    if (type === 'steal' || type === 'attack' || type === 'eliminate') {
      setPendingAction(type);
      return;
    }
    resolveWithBotReaction({ type, actorId: human.id } as PrimaryGameAction);
  };

  const chooseTarget = (targetId: string) => {
    if (!pendingAction) return;
    setShakingTargetId(targetId);
    window.setTimeout(() => {
      resolveWithBotReaction({ type: pendingAction, actorId: human.id, targetId } as PrimaryGameAction);
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
    setBotTurn({
      phase: 'resolving',
      actorId: botTurn.actorId,
      action: botReactionAction(game, botTurn.action as PrimaryGameAction, chooseBotReaction) ?? botTurn.action,
    });
  };

  const chooseCounterChallenge = (challenge: boolean) => {
    if (!counterChallengeChoice) return;
    act({ type: 'chooseCounterChallenge', playerId: human.id, challenge });
  };

  const flavorLineFor = (playerId: string) => {
    if (!flavorEvent || flavorEvent.playerId !== playerId) return null;
    const persona = getPersona(game.players.find((player) => player.id === playerId)?.personaId);
    const lines = persona ? t.bot.flavor[persona.style]?.[flavorEvent.lineKey] : null;
    return lines && lines.length > 0 ? lines[Math.floor(Math.random() * lines.length)] : null;
  };

  const copySummary = () => {
    const text = summaryLines.join('\n');
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1200);
  };

  const copyDailyResult = () => {
    if (!dailyResultLine) return;
    navigator.clipboard?.writeText(dailyResultLine).catch(() => {});
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
  const timerLabel =
    reactTimerSeconds === 0
      ? t.common.timerOff
      : formatMessage(t.common.timerSeconds, { n: reactTimerSeconds });
  const updateTimerSeconds = (value: string) => {
    const seconds = Math.max(0, Math.min(60, Number(value) || 0));
    setReactTimerSeconds(seconds);
  };
  const actionDecisionPad = isHumanTurn ? (
    <div className="action-pad mx-auto w-full max-w-5xl rounded-2xl border px-3 py-3 sm:px-4 sm:py-4">
      <div className="action-pad-header mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="action-pad-heading flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{t.common.yourTurn}</p>
          <h3 className="font-display text-base font-black leading-tight text-app sm:text-lg">
            {pendingAction ? t.common.chooseTarget : t.common.actionPanelTitle}
          </h3>
          <p className="text-app-muted text-xs sm:text-sm">
            {pendingAction ? `${t.actions[pendingAction]} · ${t.common.chooseTarget}` : t.common.chooseAction}
          </p>
        </div>
        {pendingAction ? (
          <button
            type="button"
            onClick={() => setPendingAction(null)}
            className="surface-control grid h-10 w-10 shrink-0 place-items-center rounded-full border"
            aria-label={t.common.cancel}
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {pendingAction ? (
        <div className="rounded-xl border border-ember/55 bg-ember/15 px-3 py-2 text-sm font-black text-ember">
          {t.common.chooseTarget}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-7">
          {actionOrder.map((type) => {
            const role = requiredRoleForAction(type);
            const disabled = disabledByCost[type] ?? false;
            const label = compactActionText(type, t);
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                aria-label={t.actions[type]}
                onClick={() => chooseAction(type)}
                className={`action-choice min-h-[4.25rem] rounded-xl border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-brass ${
                  disabled ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <span className="block truncate font-display text-base font-black leading-tight text-app sm:text-lg">
                  {label.title}
                </span>
                <span className={`mt-1 block truncate text-xs font-black ${disabled ? 'text-ember' : role ? 'text-brass' : 'text-success'}`}>
                  {disabled ? formatMessage(t.common.needCoins, { n: unaffordableBy(type) }) : label.note}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  ) : null;
  const reactionDecisionPad = reactPromptActive && botTurn.action ? (
    <ReactPrompt
      action={botTurn.action}
      actorName={botAnnouncementActor}
      timeoutMs={reactWindowMs}
      humanRoles={humanRoles}
      onReact={reactToBot}
    />
  ) : null;
  const counterChallengeDecisionPad = counterChallengeChoice ? (
    <div className="action-pad mx-auto w-full max-w-3xl rounded-2xl border px-3 py-3 sm:px-4 sm:py-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{t.common.react}</p>
        <h3 className="font-display text-lg font-black leading-tight text-app sm:text-xl">{t.common.counterChallengePrompt}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => chooseCounterChallenge(true)}
          className="min-h-14 rounded-xl bg-alert px-4 py-3 font-display text-sm font-black text-white shadow-chipDanger transition hover:brightness-105 sm:text-base"
        >
          {t.common.challengeAction}
        </button>
        <button
          type="button"
          onClick={() => chooseCounterChallenge(false)}
          className="action-choice min-h-14 rounded-xl border px-4 py-3 font-display text-sm font-black text-app transition sm:text-base"
        >
          {t.common.pass}
        </button>
      </div>
    </div>
  ) : null;

  const renderBoardSeat = (p: (typeof opponents)[number]) => (
    <PlayerSeat
      key={p.id}
      player={p}
      isActive={p.id === game.currentPlayerId}
      isTargetable={targetable}
      isThinking={currentBotThinking && p.id === game.currentPlayerId}
      isShaking={p.id === shakingTargetId}
      flavorLine={flavorLineFor(p.id)}
      variant="felt"
      mini
      coinRef={(node) => {
        coinRefs.current[p.id] = node;
      }}
      onSelectTarget={chooseTarget}
    />
  );

  return (
    <section
      className={
        layoutMode === 'landscape'
          ? 'relative flex min-h-0 flex-1 flex-col py-2'
          : 'relative grid flex-1 gap-3 py-3 sm:gap-4 sm:py-4'
      }
    >
      {/* === TABLE === */}
      <div
        className={`relative overflow-hidden rounded-[1.5rem] ${tableTheme} ${layoutMode === 'landscape' ? 'flex min-h-0 flex-1 flex-col px-3 py-2' : 'px-3 py-4 sm:px-6 sm:py-8'} sm:rounded-[2.25rem] ${humanView.aliveCards === 1 ? 'last-card-table' : ''}`}
      >
        <div className="felt-atmosphere" aria-hidden="true" />
        {/* Floating helpers */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOverlay('log')}
            className="surface-control inline-flex min-h-10 min-w-10 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-[var(--control-hover)]"
            aria-label="Log"
          >
            <ScrollText size={14} /> <span className="hidden xs:inline">log</span>
          </button>
          <button
            type="button"
            onClick={() => setOverlay('guide')}
            className="surface-control inline-flex min-h-10 min-w-10 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-[var(--control-hover)]"
            aria-label={t.common.guide}
          >
            <BookOpen size={14} /> <span className="hidden xs:inline">{t.common.guide}</span>
          </button>
        </div>

        <div className="surface-control absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border px-3 py-1.5">
          <Sparkles size={13} className="text-brass" />
          <span className="font-display text-xs font-black uppercase tracking-widest">
            <span className="hidden xs:inline">round </span>
            {Math.floor(game.turnCount / Math.max(1, game.players.length)) + 1}
          </span>
        </div>

        {isSpectating ? (
          <div className="surface-control absolute left-3 top-14 z-20 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-success backdrop-blur">
            <Eye size={13} />
            <span className="font-display text-xs font-black uppercase tracking-widest">{t.common.spectating}</span>
          </div>
        ) : null}

        <label
          className={`surface-control absolute left-3 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-black text-accent backdrop-blur ${isSpectating ? 'top-24' : 'top-14'}`}
          aria-label={`${t.common.timer}: ${timerLabel}`}
          title={timerLabel}
        >
          <Clock3 size={15} />
          <input
            type="number"
            min={0}
            max={60}
            value={reactTimerSeconds}
            onChange={(event) => updateTimerSeconds(event.target.value)}
            className="w-10 bg-transparent text-center font-mono text-sm font-black text-app outline-none"
          />
          <span className="text-xs text-app-muted">s</span>
        </label>

        {/* Phone opponent strip */}
        {layoutMode === 'portrait' ? (
          <div className="relative z-10 mt-11">
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
                    coinRefs.current[p.id] = node;
                  }}
                  onSelectTarget={chooseTarget}
                  compact
                />
              ))}
            </div>
            {opponentCount >= 6 ? (
              <div className="surface-strong pointer-events-none absolute right-2 top-2 rounded-full border px-2 py-1 text-[10px] font-black shadow-gold">
                1 / {opponentCount}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Desktop table seats */}
        {isDesktop ? (
        <div className="table-stage relative z-10">
          <div className="absolute left-1/2 top-3 flex w-[min(44rem,70vw)] -translate-x-1/2 items-start justify-center gap-3">
            {topRow.map((p, index) => (
              <PlayerSeat
                key={p.id}
                player={p}
                isActive={p.id === game.currentPlayerId}
                isTargetable={targetable}
                isThinking={currentBotThinking && p.id === game.currentPlayerId}
                isShaking={p.id === shakingTargetId}
                flavorLine={flavorLineFor(p.id)}
                density={seatDensity}
                variant="felt"
                className={`table-seat table-seat-top ${index === 0 && topRow.length > 1 ? '-rotate-3' : index === topRow.length - 1 && topRow.length > 1 ? 'rotate-3' : ''}`}
                coinRef={(node) => {
                  if (isDesktop) coinRefs.current[p.id] = node;
                }}
                onSelectTarget={chooseTarget}
                compact
              />
            ))}
          </div>

          <div className="absolute left-0 top-1/2 grid w-[min(14rem,19vw)] -translate-y-1/2 content-center gap-4">
            {leftRow.map((p, index) => (
              <PlayerSeat
                key={p.id}
                player={p}
                isActive={p.id === game.currentPlayerId}
                isTargetable={targetable}
                isThinking={currentBotThinking && p.id === game.currentPlayerId}
                isShaking={p.id === shakingTargetId}
                flavorLine={flavorLineFor(p.id)}
                density={seatDensity}
                variant="felt"
                className={`table-seat table-seat-side -rotate-90 ${index % 2 === 0 ? '-translate-x-2' : 'translate-x-2'}`}
                coinRef={(node) => {
                  if (isDesktop) coinRefs.current[p.id] = node;
                }}
                onSelectTarget={chooseTarget}
                compact
              />
            ))}
          </div>

          <div className="absolute right-0 top-1/2 grid w-[min(14rem,19vw)] -translate-y-1/2 content-center gap-4">
            {rightRow.map((p, index) => (
              <PlayerSeat
                key={p.id}
                player={p}
                isActive={p.id === game.currentPlayerId}
                isTargetable={targetable}
                isThinking={currentBotThinking && p.id === game.currentPlayerId}
                isShaking={p.id === shakingTargetId}
                flavorLine={flavorLineFor(p.id)}
                density={seatDensity}
                variant="felt"
                className={`table-seat table-seat-side rotate-90 ${index % 2 === 0 ? 'translate-x-2' : '-translate-x-2'}`}
                coinRef={(node) => {
                  if (isDesktop) coinRefs.current[p.id] = node;
                }}
                onSelectTarget={chooseTarget}
                compact
              />
            ))}
          </div>

          <div className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            actionDecisionPad || reactionDecisionPad || counterChallengeDecisionPad ? 'top-[43%] w-[min(58rem,76vw)]' : 'top-1/2 w-[min(37rem,43vw)]'
          }`}>
            {actionDecisionPad ?? reactionDecisionPad ?? counterChallengeDecisionPad ?? (
              <TableCenter
                prompt={tablePrompt}
                subPrompt={botTurn.phase === 'announcing' ? t.common.showingCard : subPrompt}
                highlight={highlight}
                announcement={botTurn.phase === 'announcing' ? botAnnouncement : null}
                bankRef={isDesktop ? bankRef : undefined}
              />
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 w-[min(30rem,48vw)] -translate-x-1/2">
            <HumanHand
              player={humanView}
              isActive={isHumanTurn}
              flash={handFlash}
              variant="felt"
              coinRef={(node) => {
                coinRefs.current[humanView.id] = node;
              }}
              onNewGame={newGame}
              onBackToSetup={backToSetup}
            />
          </div>
        </div>
        ) : null}

        {/* Landscape-phone board: compact N/W/E/S seating that fits a short viewport */}
        {layoutMode === 'landscape' ? (
        <div className="landscape-board relative z-10 mt-1 min-h-0 flex-1">
          <div className="board-top flex items-start justify-center gap-2">
            {lbTop.map((p) => renderBoardSeat(p))}
          </div>
          <div className="board-left grid content-center gap-2">
            {lbLeft.map((p) => renderBoardSeat(p))}
          </div>
          <div className="board-right grid content-center gap-2">
            {lbRight.map((p) => renderBoardSeat(p))}
          </div>
          <div className="board-center">
            {actionDecisionPad ?? reactionDecisionPad ?? counterChallengeDecisionPad ?? (
              <TableCenter
                prompt={tablePrompt}
                subPrompt={botTurn.phase === 'announcing' ? t.common.showingCard : subPrompt}
                highlight={highlight}
                announcement={botTurn.phase === 'announcing' ? botAnnouncement : null}
                bankRef={bankRef}
              />
            )}
          </div>
          <div className="board-hand">
            <HumanHand
              player={humanView}
              isActive={isHumanTurn}
              flash={handFlash}
              variant="felt"
              dense
              coinRef={(node) => {
                coinRefs.current[humanView.id] = node;
              }}
              onNewGame={newGame}
              onBackToSetup={backToSetup}
            />
          </div>
        </div>
        ) : null}

        {layoutMode === 'portrait' ? (
        <div className="relative z-10 mt-2">
          {actionDecisionPad ?? reactionDecisionPad ?? counterChallengeDecisionPad ?? (
            <TableCenter
              prompt={tablePrompt}
              subPrompt={botTurn.phase === 'announcing' ? t.common.showingCard : subPrompt}
              highlight={highlight}
              announcement={botTurn.phase === 'announcing' ? botAnnouncement : null}
              bankRef={bankRef}
            />
          )}
        </div>
        ) : null}

        {/* Human seat */}
        {layoutMode === 'portrait' ? (
        <div className="relative z-10 mt-3">
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
        ) : null}

        <Modal
          open={Boolean(isComplete && winner)}
          onClose={backToSetup}
          title={series.length > 1 && series.matchOver ? t.common.seriesWinner : t.common.winner}
          subtitle={series.length > 1 ? `${series.humanWins} - ${series.botWins} · ${formatMessage(t.common.roundOf, { n: series.round, m: series.length })}` : undefined}
          icon={<Trophy size={18} />}
          size="md"
          actions={
            series.length > 1 && !series.matchOver ? (
              <button
                type="button"
                onClick={nextRound}
                className="min-h-11 w-full rounded-full bg-accent px-5 py-2 font-display font-black"
              >
                {t.common.nextRound}
              </button>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={newGame}
                  className="min-h-11 rounded-full bg-accent px-5 py-2 font-display font-black"
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
            )
          }
        >
          {winner ? (
            <div className="grid gap-3 text-center">
              <p className="font-display text-2xl font-black tracking-wide gold-text">{series.length > 1 && series.matchOver ? seriesWinner?.name : winner.name}</p>
              {summaryLines.length > 0 ? (
                <div className="surface-muted grid gap-1 rounded-xl border border-token-soft px-4 py-3 text-left text-sm">
                  <p className="modal-h2">{t.common.gameSummary}</p>
                  {summaryLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {profileResultLine ? (
                    <p className="mt-1 rounded-full bg-brass/15 px-3 py-1 font-display text-xs font-black text-brass">
                      {profileResultLine}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copySummary}
                      className="surface-control rounded-full border px-3 py-1.5 text-xs font-black"
                    >
                      {copiedSummary ? t.common.copied : t.common.copySummary}
                    </button>
                    {dailyResultLine ? (
                      <button
                        type="button"
                        onClick={copyDailyResult}
                        className="surface-control rounded-full border px-3 py-1.5 text-xs font-black"
                      >
                        {copiedSummary ? t.common.dailyCopied : t.common.copyResult}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Modal>

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
      {layoutMode !== 'landscape' && !counterChallengeChoice && !reactPromptActive && !isHumanTurn && !isComplete ? (
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
      <CardLossMoment event={cardLossEvent} onDone={clearCardLossEvent} />
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
      {humanPendingChoice?.kind === 'replaceProvenCard' ? (
        <ChooseReplacementPrompt
          offered={humanPendingChoice.offered}
          onPick={(cardId) => act({ type: 'chooseReplacementCard', playerId: human.id, cardId })}
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
      <Modal
        open={overlay !== null}
        onClose={() => setOverlay(null)}
        title={overlay === 'guide' ? t.common.guide : t.common.log}
        subtitle={overlay === 'guide' ? t.common.guideTeaser : undefined}
        icon={overlay === 'guide' ? <BookOpen size={18} /> : <ScrollText size={18} />}
        size={overlay === 'guide' ? 'lg' : 'md'}
      >
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
      </Modal>
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
