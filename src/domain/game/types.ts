export type RoleId = 'leader' | 'officer' | 'thief' | 'helper' | 'reporter';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type CardStatus = 'alive' | 'revealed';

export type PlayerKind = 'human' | 'bot';

export type GamePhase = 'setup' | 'action' | 'complete';

export type ActionType = 'income' | 'fundRaise' | 'tax' | 'steal' | 'exchange' | 'attack' | 'eliminate';

export type GameConfig = {
  playerCount: number;
  humanPlayerId: string;
  startingMoney: number;
  maxMoney: number;
  cardsPerPlayer: number;
  roleCopies: Record<RoleId, number>;
  botDifficulty: BotDifficulty;
};

export type CharacterCard = {
  id: string;
  role: RoleId;
  status: CardStatus;
};

export type Player = {
  id: string;
  name: string;
  kind: PlayerKind;
  money: number;
  cards: CharacterCard[];
  personaId?: string;
};

export type GameLogEntry = {
  id: string;
  messageKey: string;
  values?: Record<string, string | number>;
};

export type BotMemory = Record<string, unknown>;

export type PendingChoice =
  | null
  | {
      kind: 'revealCard';
      playerId: string;
      cause: 'challenge_lost' | 'attack' | 'eliminate' | 'block_lost';
      mode: 'reveal' | 'returnToDeck';
      followUp: PrimaryGameAction | null;
      source: {
        actorId: string;
        actionType: ActionType | 'challenge';
        claimedRole?: RoleId;
      };
    }
  | {
      kind: 'exchangeKeep';
      playerId: string;
      offered: CharacterCard[];
    };

export type GameState = {
  id: string;
  config: GameConfig;
  currentPlayerId: string;
  phase: GamePhase;
  winnerId: string | null;
  players: Player[];
  deck: CharacterCard[];
  log: GameLogEntry[];
  botMemory: BotMemory;
  pendingChoice: PendingChoice;
};

export type PlayerSummaryView = {
  id: string;
  name: string;
  kind: PlayerKind;
  money: number | null;
  aliveCards: number;
  revealedRoles: RoleId[];
  isEliminated: boolean;
  cards: CharacterCard[] | null;
  personaId?: string;
};

export type PlayerView = {
  viewerId: string;
  currentPlayerId: string;
  phase: GamePhase;
  winnerId: string | null;
  players: PlayerSummaryView[];
  log: GameLogEntry[];
};

export type PrimaryGameAction =
  | { type: 'income'; actorId: string }
  | { type: 'fundRaise'; actorId: string }
  | { type: 'tax'; actorId: string }
  | { type: 'exchange'; actorId: string }
  | { type: 'steal'; actorId: string; targetId: string }
  | { type: 'attack'; actorId: string; targetId: string }
  | { type: 'eliminate'; actorId: string; targetId: string };

export type GameAction =
  | PrimaryGameAction
  | { type: 'challenge'; actorId: string; challengerId: string; claimedRole: RoleId; originalAction: PrimaryGameAction }
  | { type: 'block'; actorId: string; blockerId: string; blockingRole: RoleId; originalAction: PrimaryGameAction }
  | { type: 'chooseRevealCard'; playerId: string; cardId: string }
  | { type: 'chooseExchangeKeep'; playerId: string; keepCardIds: string[] };

export type Challenge = {
  actorId: string;
  challengerId: string;
  claimedRole: RoleId;
};
