import { brandMode } from '../config/branding';
import type { RoleId } from '../domain/game/types';

export type Language = 'en' | 'bn';

type RoleCopy = {
  name: string;
  power: string;
  counter: string;
};

type AchievementCopy = {
  name: string;
  description: string;
};

type Translation = {
  gameTitle: string;
  subtitle: string;
  setup: {
    title: string;
    players: string;
    difficulty: string;
    start: string;
  };
  common: {
    guide: string;
    guideTeaser: string;
    or: string;
    learnMoreRules: string;
    rulesExamples: string;
    downloadPdf: string;
    log: string;
    newGame: string;
    light: string;
    dark: string;
    language: string;
    yourTurn: string;
    botTurn: string;
    winner: string;
    money: string;
    hidden: string;
    alive: string;
    revealed: string;
    chooseAction: string;
    chooseTarget: string;
    noFunds: string;
    safeActions: string;
    roleActions: string;
    attackActions: string;
    group: {
      getMoney: string;
      trickBlock: string;
      strike: string;
    };
    needCoins: string;
    cantAfford: string;
    canChallenge: string;
    canBlock: string;
    noBlock: string;
    needsTarget: string;
    noTarget: string;
    runBotTurn: string;
    yourHand: string;
    table: string;
    cancel: string;
    actionPanelTitle: string;
    thinking: string;
    sound: string;
    muteSound: string;
    unmuteSound: string;
    botThinking: string;
    botPlays: string;
    actionResolves: string;
    challenge: string;
    showingCard: string;
    liar: string;
    truth: string;
    eliminated: string;
    revealedCard: string;
    targetLocked: string;
    tableDecision: string;
    powerClaimed: string;
    cardLoss: string;
    cardLossMoment: string;
    cardLossMomentRole: string;
    challengeDuelLine: string;
    challengeTargetLine: string;
    challengeNoTargetLine: string;
    challengeResultLiar: string;
    challengeResultTruth: string;
    challengeOneLineLiar: string;
    challengeOneLineTruth: string;
    challengeLoserLine: string;
    react: string;
    reactPrompt: string;
    challengeAction: string;
    blockAs: string;
    pass: string;
    inHand: string;
    outOfTime: string;
    counterChallengePrompt: string;
    series: string;
    singleGame: string;
    bestOf3: string;
    bestOf5: string;
    roundOf: string;
    seriesWinner: string;
    nextRound: string;
    lastCard: string;
    gotcha: string;
    blocked: string;
    youEliminated: string;
    survived: string;
    doubleShot: string;
    gameSummary: string;
    copySummary: string;
    copied: string;
    roundCount: string;
    humanBluffsCalled: string;
    humanBluffsCaught: string;
    mostDamagingAction: string;
    finalBlow: string;
    startNewGame: string;
    sameSettings: string;
    changeSettings: string;
    backToSetup: string;
    cardAtRisk: string;
    chooseRevealTitle: string;
    chooseLoseTitle: string;
    causeChallenge: string;
    causeAttack: string;
    causeEliminate: string;
    causeBlock: string;
    revealDetailAttack: string;
    revealDetailEliminate: string;
    revealDetailChallenge: string;
    chooseExchangeTitle: string;
    chooseExchangeHelp: string;
    chooseReplacementTitle: string;
    chooseReplacementHelp: string;
    fromDeck: string;
    selectedCount: string;
    selected: string;
    notSelected: string;
    confirm: string;
    youAreOut: string;
    spectateOrRestart: string;
    watchMatch: string;
    spectating: string;
    endWatching: string;
    lifetime: string;
    wins: string;
    losses: string;
    streak: string;
    streakBest: string;
    matchesPlayed: string;
    streakUp: string;
    streakBroken: string;
    resetProfile: string;
    confirmReset: string;
    perPersona: string;
    achievementUnlocked: string;
    achievements: string;
    daily: string;
    todaysBest: string;
    copyResult: string;
    dailyCopied: string;
    botConsidering: string;
    botAccepts: string;
    botCounters: string;
    timer: string;
    timerOff: string;
    timerSeconds: string;
    pauseTimer: string;
    resumeTimer: string;
    yourMove: string;
    next: string;
    youLabel: string;
    secondsShort: string;
    lastEvent: {
      claim: string;
      challengeWon: string;
      challengeLost: string;
      blocked: string;
      gameStart: string;
      generic: string;
    };
    required: {
      challenge: string;
      block: string;
      pass: string;
      pickAction: string;
      chooseTarget: string;
      counterChallenge: string;
    };
  };
  actions: Record<string, string>;
  actionHelp: Record<string, string>;
  achievements: Record<string, AchievementCopy>;
  roles: Record<RoleId, RoleCopy>;
  guide: {
    title: string;
    intro: string;
    turn: string;
    challenge: string;
    money: string;
    doubleLoss: string;
  };
  bot: {
    personas: Record<string, string>;
    style: Record<string, string>;
    flavor: Record<string, Record<string, string[]>>;
  };
  logs: Record<string, string>;
};

const dailyEn: Translation = {
  gameTitle: 'Who Is Lying?',
  subtitle: 'A quick bluffing card game of money, trust, and hidden roles.',
  setup: {
    title: 'Create Game',
    players: 'Players',
    difficulty: 'Bot level',
    start: 'Start game',
  },
  common: {
    guide: 'How to play',
    guideTeaser: 'Learn in 60 seconds',
    or: 'or',
    learnMoreRules: 'Full rules + examples',
    rulesExamples: 'Rules & examples',
    downloadPdf: 'Download PDF',
    log: 'Game log',
    newGame: 'New game',
    light: 'Day',
    dark: 'Dark',
    language: 'Language',
    yourTurn: 'Your turn',
    botTurn: 'Bot turn',
    winner: 'Winner',
    money: 'Money',
    hidden: 'Hidden',
    alive: 'Alive',
    revealed: 'Revealed',
    chooseAction: 'Choose one action below.',
    chooseTarget: 'Now choose a player.',
    noFunds: 'no funds',
    safeActions: 'Fund actions',
    roleActions: 'Role / bluff actions',
    attackActions: 'Attack actions',
    group: {
      getMoney: 'Get money',
      trickBlock: 'Trick & block',
      strike: 'Strike',
    },
    needCoins: 'Need {n} more',
    cantAfford: 'You need {n} more coins.',
    canChallenge: 'Can be challenged',
    canBlock: 'Can be blocked',
    noBlock: 'Cannot be blocked',
    needsTarget: 'Needs target',
    noTarget: 'No target',
    runBotTurn: 'Run bot turn',
    yourHand: 'Your cards',
    table: 'Table',
    cancel: 'Cancel',
    actionPanelTitle: 'Pick your move',
    thinking: 'thinking',
    sound: 'Sound',
    muteSound: 'Mute sound',
    unmuteSound: 'Enable sound',
    botThinking: '{bot} is thinking...',
    botPlays: '{bot} plays',
    actionResolves: 'Result lands',
    challenge: 'Challenge!',
    showingCard: 'Showing their hand...',
    liar: 'Liar!',
    truth: 'Truth!',
    eliminated: 'Eliminated',
    revealedCard: '{player} revealed {role}',
    targetLocked: 'Target locked',
    tableDecision: 'Table decision',
    powerClaimed: 'Power claimed',
    cardLoss: 'Card loss',
    cardLossMoment: '{player} lost a card',
    cardLossMomentRole: '{player} lost {role}',
    challengeDuelLine: '{challenger} challenged {actor}',
    challengeTargetLine: '{action} against {target}',
    challengeNoTargetLine: '{action}',
    challengeResultLiar: "{actor}'s {role} claim was false.",
    challengeResultTruth: "{actor}'s {role} claim was true.",
    challengeOneLineLiar: '{challenger} caught {actor} bluffing {role}.',
    challengeOneLineTruth: "{challenger} doubted {actor}'s {role}. {challenger} was wrong.",
    challengeLoserLine: '{player} lost a card',
    react: 'React',
    reactPrompt: 'How do you react?',
    challengeAction: 'Challenge bluff',
    blockAs: 'Block as {role}',
    pass: 'Pass',
    inHand: 'in hand',
    outOfTime: 'Time up — passed.',
    counterChallengePrompt: 'Counter-challenge the block?',
    series: 'Series',
    singleGame: 'Single game',
    bestOf3: 'Best of 3',
    bestOf5: 'Best of 5',
    roundOf: 'Round {n} of {m}',
    seriesWinner: 'Series winner',
    nextRound: 'Next round',
    lastCard: 'Last card',
    gotcha: 'Gotcha!',
    blocked: 'Blocked!',
    youEliminated: 'You eliminated {persona}',
    survived: 'Survived',
    doubleShot: 'Double shot',
    gameSummary: 'Replay summary',
    copySummary: 'Copy summary',
    copied: 'Copied',
    roundCount: 'Round count: {value}',
    humanBluffsCalled: 'Bluffs you called: {value}',
    humanBluffsCaught: 'Your bluffs caught: {value}',
    mostDamagingAction: 'Most damaging action: {value}',
    finalBlow: 'Final blow: {value}',
    startNewGame: 'Start a new game?',
    sameSettings: 'Same settings',
    changeSettings: 'Change settings',
    backToSetup: 'Back to setup',
    cardAtRisk: 'Card at risk',
    chooseRevealTitle: 'Choose a card to reveal',
    chooseLoseTitle: 'Choose a card to lose',
    causeChallenge: 'You lost the challenge.',
    causeAttack: 'You were attacked.',
    causeEliminate: 'You were eliminated.',
    causeBlock: 'Your block was challenged and failed.',
    revealDetailAttack: '{actor} called {role} and paid 3. The card goes back to the deck hidden.',
    revealDetailEliminate: '{actor} paid 7. The card goes back to the deck hidden.',
    revealDetailChallenge: '{actor} challenged your {role} claim and caught it.',
    chooseExchangeTitle: 'Choose cards to keep',
    chooseExchangeHelp: 'Pick {n} to keep. The rest go back to the deck.',
    chooseReplacementTitle: 'Choose your replacement card',
    chooseReplacementHelp: 'Your proven card goes back to the deck. Pick 1 replacement.',
    fromDeck: 'From the deck',
    selectedCount: '{n} of {total} selected',
    selected: 'selected',
    notSelected: 'not selected',
    confirm: 'Confirm',
    youAreOut: "You're out",
    spectateOrRestart: 'Watch the match or start a new one?',
    watchMatch: 'Watch the match',
    spectating: 'Spectating',
    endWatching: 'End watching',
    lifetime: 'Lifetime',
    wins: 'Wins',
    losses: 'Losses',
    streak: 'Streak',
    streakBest: 'Best',
    matchesPlayed: 'Matches played',
    streakUp: 'Streak {n}',
    streakBroken: 'Streak broken (was {n})',
    resetProfile: 'Reset profile',
    confirmReset: 'Reset all stats? This cannot be undone.',
    perPersona: 'Per-bot record',
    achievementUnlocked: 'Achievement unlocked',
    achievements: 'Achievements',
    daily: 'Daily Challenge',
    todaysBest: "Today's best",
    copyResult: 'Copy daily result',
    dailyCopied: 'Result copied.',
    botConsidering: '{bot} is considering...',
    botAccepts: '{bot} accepted the block.',
    botCounters: '{bot} CHALLENGED the block!',
    timer: 'Timer',
    timerOff: 'Timer off',
    timerSeconds: '{n}s timer',
    pauseTimer: 'Pause timer',
    resumeTimer: 'Resume timer',
    yourMove: 'YOUR MOVE',
    next: 'Next',
    youLabel: 'You',
    secondsShort: '{n}s',
    lastEvent: {
      claim: '{actor} claimed {role} → wants {amount} coins',
      challengeWon: '{actor} caught {target} bluffing — {target} lost a card',
      challengeLost: '{actor} challenged {target} — {actor} lost a card',
      blocked: "{actor} blocked {target}'s {action}",
      gameStart: "Game started — {actor}'s turn",
      generic: '{event}',
    },
    required: {
      challenge: 'Challenge?',
      block: 'Block?',
      pass: 'Let it pass?',
      pickAction: 'Pick your move',
      chooseTarget: 'Choose target',
      counterChallenge: 'Counter-challenge?',
    },
  },
  actions: {
    income: 'Take 1',
    fundRaise: 'Take 2',
    tax: 'Leader: take 3',
    steal: 'Thief: steal 2',
    exchange: 'Helper: exchange',
    attack: 'Police: pay 3',
    eliminate: 'Pay 7',
  },
  actionHelp: {
    income: 'Take 1 money. Safe. No one can block or challenge it.',
    fundRaise: 'Take 2 money. A Leader can block this.',
    tax: 'Claim Leader and take 3 money. Others may challenge if they think you are lying.',
    steal: 'Claim Thief, then choose a player. Steal up to 2 money.',
    exchange: 'Claim Helper and exchange your cards with the deck.',
    attack: 'Claim Police, pay 3, then choose a player to lose one card.',
    eliminate: 'Pay 7 and choose a player. This cannot be blocked or challenged.',
  },
  achievements: {
    firstWin: { name: 'First Win', description: 'Win your first match.' },
    streak3: { name: 'Three in a Row', description: 'Build a 3-win streak.' },
    streak5: { name: 'Five in a Row', description: 'Build a 5-win streak.' },
    firstBluffCalled: { name: 'Bluff Caller', description: 'Catch a false role claim.' },
    untouchable: { name: 'Untouchable', description: 'Win without losing a card.' },
    eliminator: { name: 'Eliminator', description: 'Eliminate 3 or more bots in one match.' },
    survivor: { name: 'Survivor', description: 'Win with one card left.' },
    hardModeWin: { name: 'Hard Mode Cleared', description: 'Win against hard bots.' },
    bestOf5Win: { name: 'Marathon Winner', description: 'Win a Best of 5 series.' },
    readPersona_whisper: { name: 'Read Whisper', description: 'Beat Whisper in a match.' },
    readPersona_iron: { name: 'Read Iron', description: 'Beat Iron in a match.' },
    readPersona_vix: { name: 'Read Vix', description: 'Beat Vix in a match.' },
    readPersona_pari: { name: 'Read Pari', description: 'Beat Pari in a match.' },
    readPersona_tariq: { name: 'Read Tariq', description: 'Beat Tariq in a match.' },
    readPersona_nova: { name: 'Read Nova', description: 'Beat Nova in a match.' },
    readPersona_mori: { name: 'Read Mori', description: 'Beat Mori in a match.' },
    readPersona_echo: { name: 'Read Echo', description: 'Beat Echo in a match.' },
  },
  roles: {
    leader: { name: 'Leader', power: 'Take 3 money.', counter: 'Blocks Take 2.' },
    officer: { name: 'Police', power: 'Pay 3 to remove one card.', counter: 'Blocked by Reporter.' },
    thief: { name: 'Thief', power: 'Steal up to 2 money.', counter: 'Blocked by Helper.' },
    helper: { name: 'Helper', power: 'Exchange cards.', counter: 'Blocks Thief.' },
    reporter: { name: 'Reporter', power: 'Protects a player.', counter: 'Blocks Police.' },
  },
  guide: {
    title: 'Learn in 60 seconds',
    intro: 'Each player has 2 secret cards. Lose both cards and you are out.',
    turn: 'On your turn, choose one action. Some actions need a role, but you may bluff.',
    challenge: 'Anyone can challenge a role claim. Liar loses a card. Wrong challenger loses a card.',
    money: 'You can see only your own money. Opponent totals stay hidden.',
    doubleLoss: 'If {officer} is real and you wrongly challenge, you lose one card for the challenge and one more from the attack.',
  },
  bot: {
    personas: {
      whisper: 'Waits until you blink.',
      iron: 'Pressure first, questions later.',
      vix: 'Never repeats a pattern.',
      pari: 'Copies your confidence.',
      tariq: 'Turns money into threats.',
      nova: 'Makes chaos look planned.',
      mori: 'Quiet until it matters.',
      echo: 'Mirrors every weakness.',
    },
    style: {
      cautious: 'Cautious',
      aggressive: 'Aggressive',
      unpredictable: 'Unpredictable',
      mirror: 'Mirror',
    },
    flavor: {
      cautious: {
        claim: ['Trust me.', 'Just routine.', 'No rush.'],
        challengeWin: ['Read you.', 'Too loud.', 'Bad mask.'],
        challengeLose: ['...fair.', 'Noted.', 'I blinked.'],
        bluffSuccess: ['Still calm.', 'Clean pass.', 'Nobody moved.'],
      },
      aggressive: {
        claim: ['Move aside.', 'Pay attention.', 'Pressure time.'],
        challengeWin: ['Too easy.', 'Caught clean.', 'You cracked.'],
        challengeLose: ['Lucky hit.', 'Bold call.', 'Fine. Again.'],
        bluffSuccess: ['Cracked you.', 'Table folded.', 'Mine now.'],
      },
      unpredictable: {
        claim: ['Maybe true.', 'Try me.', 'Why not?'],
        challengeWin: ['Wrong door.', 'Strange choice.', 'Not today.'],
        challengeLose: ['Interesting.', 'That stung.', 'Good chaos.'],
        bluffSuccess: ['That worked.', 'Beautiful noise.', 'Still legal.'],
      },
      mirror: {
        claim: ['Your move.', 'Same energy.', 'I copy pressure.'],
        challengeWin: ['Saw that.', 'You showed me.', 'Pattern matched.'],
        challengeLose: ['I deserved that.', 'Good mirror.', 'You adapted.'],
        bluffSuccess: ['You taught me.', 'Same trick.', 'Your lesson worked.'],
      },
    },
  },
  logs: {
    gameStarted: 'Game started.',
    'action.income': '{actor} took {amount} money.',
    'action.fundRaise': '{actor} took {amount} money.',
    'action.tax': '{actor} claimed Leader and took {amount} money.',
    'action.steal': '{actor} stole {amount} money from {target}.',
    'action.exchange': '{actor} exchanged cards.',
    'action.attack': '{actor} attacked {target}.',
    'action.eliminate': '{actor} paid 7 to remove one card from {target}.',
    'challenge.actorLost': '{challenger} challenged {actor}. The claim was false.',
    'challenge.challengerLost': '{challenger} challenged {actor}. The claim was true.',
    'block.success': '{blocker} blocked {actor} as {role}.',
  },
};

const dailyBn: Translation = {
  gameTitle: 'কে মিথ্যা বলছে?',
  subtitle: 'টাকা, বিশ্বাস আর লুকানো পরিচয়ের দ্রুত ব্লাফিং কার্ড গেম।',
  setup: {
    title: 'গেম তৈরি করুন',
    players: 'প্লেয়ার',
    difficulty: 'বট লেভেল',
    start: 'গেম শুরু',
  },
  common: {
    guide: 'কিভাবে খেলবেন',
    guideTeaser: '৬০ সেকেন্ডে শিখুন',
    or: 'অথবা',
    learnMoreRules: 'পুরো নিয়ম + উদাহরণ',
    rulesExamples: 'নিয়ম ও উদাহরণ',
    downloadPdf: 'PDF ডাউনলোড',
    log: 'গেম লগ',
    newGame: 'নতুন গেম',
    light: 'দিন',
    dark: 'ডার্ক',
    language: 'ভাষা',
    yourTurn: 'আপনার পালা',
    botTurn: 'বটের পালা',
    winner: 'বিজয়ী',
    money: 'টাকা',
    hidden: 'লুকানো',
    alive: 'জীবিত',
    revealed: 'খোলা',
    chooseAction: 'নিচ থেকে একটি কাজ বেছে নিন।',
    chooseTarget: 'এখন একজন প্লেয়ার বেছে নিন।',
    noFunds: 'টাকা নেই',
    safeActions: 'ফান্ড কাজ',
    roleActions: 'চরিত্র / ব্লাফ কাজ',
    attackActions: 'আক্রমণ',
    group: {
      getMoney: 'টাকা নিন',
      trickBlock: 'চাল ও ব্লক',
      strike: 'আঘাত',
    },
    needCoins: 'আরও {n} লাগবে',
    cantAfford: 'আপনার আরও {n} টাকা লাগবে।',
    canChallenge: 'চ্যালেঞ্জ করা যাবে',
    canBlock: 'ব্লক করা যাবে',
    noBlock: 'ব্লক করা যাবে না',
    needsTarget: 'টার্গেট লাগবে',
    noTarget: 'টার্গেট লাগে না',
    runBotTurn: 'বটের পালা চালান',
    yourHand: 'আপনার কার্ড',
    table: 'বোর্ড',
    cancel: 'বাতিল',
    actionPanelTitle: 'আপনার চাল বেছে নিন',
    thinking: 'ভাবছে',
    sound: 'সাউন্ড',
    muteSound: 'সাউন্ড বন্ধ',
    unmuteSound: 'সাউন্ড চালু',
    botThinking: '{bot} ভাবছে...',
    botPlays: '{bot} চাল দিয়েছে',
    actionResolves: 'ফলাফল হলো',
    challenge: 'চ্যালেঞ্জ!',
    // TODO: native bn review before merge.
    showingCard: 'কার্ড উন্মোচন হচ্ছে...',
    liar: 'মিথ্যা!',
    truth: 'সত্য!',
    eliminated: 'এলিমিনেটেড',
    revealedCard: '{player} {role} দেখিয়েছে',
    targetLocked: 'টার্গেট ঠিক হয়েছে',
    tableDecision: 'বোর্ডের সিদ্ধান্ত',
    powerClaimed: 'দাবি করা ক্ষমতা',
    cardLoss: 'কার্ড হারাবে',
    // TODO: native bn review before merge.
    cardLossMoment: '{player} একটি কার্ড হারিয়েছে',
    // TODO: native bn review before merge.
    cardLossMomentRole: '{player} {role} হারিয়েছে',
    challengeDuelLine: '{challenger} {actor} কে চ্যালেঞ্জ করেছে',
    challengeTargetLine: '{target} এর বিরুদ্ধে {action}',
    challengeNoTargetLine: '{action}',
    challengeResultLiar: '{actor} এর {role} দাবি মিথ্যা ছিল।',
    challengeResultTruth: '{actor} এর {role} দাবি সত্য ছিল।',
    // TODO: native bn review before merge.
    challengeOneLineLiar: '{challenger} {actor}-এর {role} মিথ্যা ধরেছে।',
    // TODO: native bn review before merge.
    challengeOneLineTruth: '{challenger} {actor}-এর {role} সন্দেহ করেছে। {challenger} ভুল ছিল।',
    challengeLoserLine: '{player} একটি কার্ড হারিয়েছে',
    react: 'প্রতিক্রিয়া',
    reactPrompt: 'কীভাবে প্রতিক্রিয়া দেবেন?',
    challengeAction: 'মিথ্যা ধরুন',
    blockAs: '{role} হিসেবে ব্লক',
    pass: 'পাস',
    inHand: 'হাতে আছে',
    outOfTime: 'সময় শেষ — পাস।',
    counterChallengePrompt: 'ব্লক কাউন্টার চ্যালেঞ্জ?',
    series: 'সিরিজ',
    singleGame: 'একক গেম',
    bestOf3: 'সেরা ৩',
    bestOf5: 'সেরা ৫',
    roundOf: 'রাউন্ড {n}/{m}',
    seriesWinner: 'সিরিজ বিজয়ী',
    nextRound: 'পরবর্তী রাউন্ড',
    lastCard: 'শেষ কার্ড',
    gotcha: 'ধরেছি!',
    blocked: 'ব্লক!',
    youEliminated: 'আপনি {persona} কে বাদ দিয়েছেন',
    survived: 'বেঁচে গেলেন',
    doubleShot: 'ডাবল শট',
    gameSummary: 'রিপ্লে সারাংশ',
    copySummary: 'সারাংশ কপি',
    copied: 'কপি হয়েছে',
    roundCount: 'রাউন্ড সংখ্যা: {value}',
    humanBluffsCalled: 'আপনি ব্লাফ ধরেছেন: {value}',
    humanBluffsCaught: 'আপনার ব্লাফ ধরা পড়েছে: {value}',
    mostDamagingAction: 'সবচেয়ে ক্ষতিকর চাল: {value}',
    finalBlow: 'শেষ আঘাত: {value}',
    startNewGame: 'নতুন গেম শুরু?',
    sameSettings: 'একই সেটিংস',
    changeSettings: 'সেটিংস বদলান',
    backToSetup: 'সেটআপে ফিরুন',
    cardAtRisk: 'কার্ড ঝুঁকিতে',
    chooseRevealTitle: 'প্রকাশের জন্য একটি কার্ড বেছে নিন',
    chooseLoseTitle: 'হারানোর জন্য একটি কার্ড বেছে নিন',
    causeChallenge: 'আপনি চ্যালেঞ্জ হেরেছেন।',
    causeAttack: 'আপনাকে আক্রমণ করা হয়েছে।',
    causeEliminate: 'আপনাকে বাদ দেওয়া হয়েছে।',
    causeBlock: 'আপনার ব্লক ব্যর্থ হয়েছে।',
    revealDetailAttack: '{actor} {role} দাবি করে ৩ টাকা খরচ করেছে। কার্ডটি লুকিয়ে ডেকে ফিরবে।',
    revealDetailEliminate: '{actor} ৭ টাকা খরচ করেছে। কার্ডটি লুকিয়ে ডেকে ফিরবে।',
    revealDetailChallenge: '{actor} আপনার {role} দাবি চ্যালেঞ্জ করে ধরে ফেলেছে।',
    chooseExchangeTitle: 'রাখার জন্য কার্ড বেছে নিন',
    chooseExchangeHelp: '{n} টি রাখুন। বাকিগুলো ডেকে ফিরবে।',
    chooseReplacementTitle: 'নতুন কার্ড বেছে নিন',
    chooseReplacementHelp: 'আপনার প্রমাণিত কার্ড ডেকে ফিরবে। ১টি নতুন কার্ড নিন।',
    fromDeck: 'ডেক থেকে',
    selectedCount: '{total} এর মধ্যে {n} বেছেছেন',
    selected: 'বাছাই করা',
    notSelected: 'বাছাই করা নয়',
    confirm: 'নিশ্চিত',
    youAreOut: 'আপনি বাদ',
    spectateOrRestart: 'ম্যাচ দেখবেন না কি নতুন শুরু করবেন?',
    watchMatch: 'ম্যাচ দেখুন',
    spectating: 'দর্শক',
    endWatching: 'দেখা শেষ করুন',
    lifetime: 'মোট',
    wins: 'জয়',
    losses: 'পরাজয়',
    streak: 'ধারা',
    streakBest: 'সেরা',
    matchesPlayed: 'মোট ম্যাচ',
    streakUp: 'ধারা {n}',
    streakBroken: 'ধারা ভেঙেছে (ছিল {n})',
    resetProfile: 'প্রোফাইল রিসেট',
    confirmReset: 'সব পরিসংখ্যান রিসেট? এটি ফেরানো যাবে না।',
    perPersona: 'প্রতি বটের রেকর্ড',
    achievementUnlocked: 'অর্জন আনলক হয়েছে',
    achievements: 'অর্জন',
    daily: 'দৈনিক চ্যালেঞ্জ',
    todaysBest: 'আজকের সেরা',
    copyResult: 'দৈনিক ফল কপি',
    dailyCopied: 'ফল কপি হয়েছে।',
    botConsidering: '{bot} ভাবছে...',
    botAccepts: '{bot} ব্লক মেনেছে।',
    botCounters: '{bot} ব্লক চ্যালেঞ্জ করেছে!',
    timer: 'টাইমার',
    timerOff: 'টাইমার বন্ধ',
    timerSeconds: '{n}সে টাইমার',
    pauseTimer: 'টাইমার বিরতি',
    resumeTimer: 'টাইমার চালু',
    yourMove: 'আপনার চাল',
    next: 'পরবর্তী',
    youLabel: 'আপনি',
    secondsShort: '{n}সে',
    lastEvent: {
      // TODO: native bn review before merge.
      claim: '{actor} {role} দাবি করল → {amount} কয়েন চায়',
      // TODO: native bn review before merge.
      challengeWon: '{actor} {target} এর ব্লাফ ধরল — {target} একটি কার্ড হারাল',
      // TODO: native bn review before merge.
      challengeLost: '{actor} {target} কে চ্যালেঞ্জ করল — {actor} একটি কার্ড হারাল',
      // TODO: native bn review before merge.
      blocked: '{actor}, {target} এর {action} ব্লক করল',
      // TODO: native bn review before merge.
      gameStart: 'গেম শুরু — {actor} এর পালা',
      generic: '{event}',
    },
    required: {
      challenge: 'চ্যালেঞ্জ?',
      block: 'ব্লক?',
      pass: 'পাস?',
      pickAction: 'আপনার চাল বেছে নিন',
      chooseTarget: 'টার্গেট বেছে নিন',
      counterChallenge: 'কাউন্টার-চ্যালেঞ্জ?',
    },
  },
  actions: {
    income: '১ নিন',
    fundRaise: '২ নিন',
    tax: 'নেতা: ৩ নিন',
    steal: 'চোর: ২ চুরি',
    exchange: 'সাহায্যকারী: বদল',
    attack: 'পুলিশ: ৩ খরচ',
    eliminate: '৭ খরচ',
  },
  actionHelp: {
    income: '১ টাকা নিন। নিরাপদ। কেউ ব্লক বা চ্যালেঞ্জ করতে পারবে না।',
    fundRaise: '২ টাকা নিন। নেতা চাইলে এটা ব্লক করতে পারে।',
    tax: 'নেতা দাবি করে ৩ টাকা নিন। অন্যরা মিথ্যা মনে করলে চ্যালেঞ্জ করতে পারে।',
    steal: 'চোর দাবি করুন, তারপর একজন প্লেয়ার বেছে নিন। সর্বোচ্চ ২ টাকা চুরি হবে।',
    exchange: 'সাহায্যকারী দাবি করে ডেকের সাথে কার্ড বদল করুন।',
    attack: 'পুলিশ দাবি করে ৩ টাকা খরচ করুন, তারপর একজন প্লেয়ারের একটি কার্ড সরান।',
    eliminate: '৭ টাকা খরচ করে একজন প্লেয়ারের একটি কার্ড সরান। এটা ব্লক বা চ্যালেঞ্জ করা যাবে না।',
  },
  achievements: {
    firstWin: { name: 'প্রথম জয়', description: 'প্রথম ম্যাচ জিতুন।' },
    streak3: { name: 'পরপর তিন', description: '৩ জয়ের ধারা তৈরি করুন।' },
    streak5: { name: 'পরপর পাঁচ', description: '৫ জয়ের ধারা তৈরি করুন।' },
    firstBluffCalled: { name: 'মিথ্যা ধরেছেন', description: 'একটি মিথ্যা চরিত্র দাবি ধরুন।' },
    untouchable: { name: 'অবিচ্ছেদ্য', description: 'কার্ড না হারিয়ে জিতুন।' },
    eliminator: { name: 'নির্মূলকারী', description: 'এক ম্যাচে ৩ বা তার বেশি বট বাদ দিন।' },
    survivor: { name: 'বেঁচে গেছেন', description: 'একটি কার্ড বাকি রেখে জিতুন।' },
    hardModeWin: { name: 'কঠিন মোড জয়', description: 'কঠিন বটদের হারান।' },
    bestOf5Win: { name: 'ম্যারাথন বিজয়', description: 'সেরা ৫ সিরিজ জিতুন।' },
    readPersona_whisper: { name: 'Whisper কে পড়েছেন', description: 'এক ম্যাচে Whisper কে হারান।' },
    readPersona_iron: { name: 'Iron কে পড়েছেন', description: 'এক ম্যাচে Iron কে হারান।' },
    readPersona_vix: { name: 'Vix কে পড়েছেন', description: 'এক ম্যাচে Vix কে হারান।' },
    readPersona_pari: { name: 'Pari কে পড়েছেন', description: 'এক ম্যাচে Pari কে হারান।' },
    readPersona_tariq: { name: 'Tariq কে পড়েছেন', description: 'এক ম্যাচে Tariq কে হারান।' },
    readPersona_nova: { name: 'Nova কে পড়েছেন', description: 'এক ম্যাচে Nova কে হারান।' },
    readPersona_mori: { name: 'Mori কে পড়েছেন', description: 'এক ম্যাচে Mori কে হারান।' },
    readPersona_echo: { name: 'Echo কে পড়েছেন', description: 'এক ম্যাচে Echo কে হারান।' },
  },
  roles: {
    leader: { name: 'নেতা', power: '৩ টাকা নেয়।', counter: '২ টাকা নেওয়া ব্লক করে।' },
    officer: { name: 'পুলিশ', power: '৩ টাকা দিয়ে একটি কার্ড সরায়।', counter: 'সাংবাদিক ব্লক করে।' },
    thief: { name: 'চোর', power: 'সর্বোচ্চ ২ টাকা চুরি করে।', counter: 'সাহায্যকারী ব্লক করে।' },
    helper: { name: 'সাহায্যকারী', power: 'কার্ড বদল করে।', counter: 'চোরকে ব্লক করে।' },
    reporter: { name: 'সাংবাদিক', power: 'প্লেয়ারকে বাঁচায়।', counter: 'পুলিশকে ব্লক করে।' },
  },
  guide: {
    title: '৬০ সেকেন্ডে শিখুন',
    intro: 'প্রতিটি প্লেয়ারের ২টি গোপন কার্ড থাকে। ২টি হারালে আপনি আউট।',
    turn: 'আপনার পালায় একটি কাজ বেছে নিন। কিছু কাজে চরিত্র লাগে, কিন্তু ব্লাফ করা যায়।',
    challenge: 'যে কেউ চ্যালেঞ্জ করতে পারে। মিথ্যা হলে দাবিদার কার্ড হারায়। ভুল চ্যালেঞ্জ হলে চ্যালেঞ্জার কার্ড হারায়।',
    money: 'আপনি শুধু নিজের টাকা দেখবেন। অন্যদের মোট টাকা লুকানো থাকবে।',
    doubleLoss: '{officer} সত্যি হলে ভুল চ্যালেঞ্জে একটি কার্ড যায়, এরপর আক্রমণে আরেকটি কার্ড যেতে পারে।',
  },
  bot: {
    personas: {
      whisper: 'আপনি পলক ফেললেই চলে।',
      iron: 'আগে চাপ, পরে প্রশ্ন।',
      vix: 'কখনও একই ছক নয়।',
      pari: 'আপনার আত্মবিশ্বাস নকল করে।',
      tariq: 'টাকাকে হুমকিতে বদলায়।',
      nova: 'বিশৃঙ্খলাকেও পরিকল্পনা বানায়।',
      mori: 'চুপ, যতক্ষণ না দরকার।',
      echo: 'প্রতিটি দুর্বলতা ফেরত দেয়।',
    },
    style: {
      cautious: 'সতর্ক',
      aggressive: 'আক্রমণাত্মক',
      unpredictable: 'অনিশ্চিত',
      mirror: 'অনুকরণকারী',
    },
    flavor: {
      cautious: {
        claim: ['বিশ্বাস করুন।', 'সাধারণ চাল।', 'তাড়া নেই।'],
        challengeWin: ['ধরে ফেলেছি।', 'বেশি শব্দ।', 'মুখোশ খারাপ।'],
        challengeLose: ['...ঠিক আছে।', 'মনে রাখলাম।', 'পলক পড়েছে।'],
        bluffSuccess: ['শান্ত আছি।', 'পরিষ্কার পাস।', 'কেউ নড়েনি।'],
      },
      aggressive: {
        claim: ['সরে দাঁড়ান।', 'মন দিন।', 'চাপের সময়।'],
        challengeWin: ['খুব সহজ।', 'ধরা পড়লেন।', 'ভেঙে গেলেন।'],
        challengeLose: ['ভাগ্য ভালো।', 'সাহসী ডাক।', 'আবার হবে।'],
        bluffSuccess: ['ভেঙে দিলাম।', 'টেবিল ভাঁজ।', 'এখন আমার।'],
      },
      unpredictable: {
        claim: ['হতেও পারে।', 'চেষ্টা করুন।', 'কেন নয়?'],
        challengeWin: ['ভুল দরজা।', 'অদ্ভুত পছন্দ।', 'আজ নয়।'],
        challengeLose: ['মজার।', 'লাগল কিন্তু।', 'ভালো বিশৃঙ্খলা।'],
        bluffSuccess: ['কাজ হলো।', 'সুন্দর গোলমাল।', 'এখনও বৈধ।'],
      },
      mirror: {
        claim: ['আপনার চাল।', 'একই শক্তি।', 'চাপ কপি করি।'],
        challengeWin: ['দেখেছি।', 'আপনিই দেখালেন।', 'ছক মিলেছে।'],
        challengeLose: ['প্রাপ্য ছিল।', 'ভালো আয়না।', 'আপনি বদলেছেন।'],
        bluffSuccess: ['আপনিই শিখিয়েছেন।', 'একই কৌশল।', 'আপনার পাঠ কাজে।'],
      },
    },
  },
  logs: {
    gameStarted: 'গেম শুরু হয়েছে।',
    'action.income': '{actor} {amount} টাকা নিয়েছে।',
    'action.fundRaise': '{actor} {amount} টাকা নিয়েছে।',
    'action.tax': '{actor} নেতা দাবি করে {amount} টাকা নিয়েছে।',
    'action.steal': '{actor} {target} থেকে {amount} টাকা চুরি করেছে।',
    'action.exchange': '{actor} কার্ড বদল করেছে।',
    'action.attack': '{actor} {target} কে আক্রমণ করেছে।',
    'action.eliminate': '{actor} ৭ টাকা দিয়ে {target} এর একটি কার্ড সরিয়েছে।',
    'challenge.actorLost': '{challenger} {actor} কে চ্যালেঞ্জ করেছে। দাবি মিথ্যা ছিল।',
    'challenge.challengerLost': '{challenger} {actor} কে চ্যালেঞ্জ করেছে। দাবি সত্য ছিল।',
    'block.success': '{blocker} {actor} কে {role} হিসেবে ব্লক করেছে।',
  },
};

const syndicateEn: Translation = {
  ...dailyEn,
  gameTitle: 'The Syndicate',
  common: {
    ...dailyEn.common,
    showingCard: 'Revealing the play...',
  },
  actions: {
    income: 'Take 1',
    fundRaise: 'Fund Raise: take 2',
    tax: 'CEO: take 3',
    steal: 'Hacker: steal 2',
    exchange: 'Spy: exchange',
    attack: 'Minister: pay 3',
    eliminate: 'Eliminate: pay 7',
  },
  actionHelp: {
    income: 'Take 1 money. Safe. No one can block or challenge it.',
    fundRaise: 'Take 2 money. A CEO can block this.',
    tax: 'Claim CEO and take 3 money. Others may challenge if they think you are lying.',
    steal: 'Claim Hacker, then choose a player. Steal up to 2 money.',
    exchange: 'Claim Spy and exchange your cards with the deck.',
    attack: 'Claim Minister, pay 3, then choose a player to lose one card.',
    eliminate: 'Pay 7 and choose a player. This cannot be blocked or challenged.',
  },
  roles: {
    leader: { name: 'CEO', power: 'Take 3 money.', counter: 'Blocks Fund Raise.' },
    officer: { name: 'Minister', power: 'Pay 3 to remove one card.', counter: 'Blocked by Journalist.' },
    thief: { name: 'Hacker', power: 'Steal up to 2 money.', counter: 'Blocked by Spy.' },
    helper: { name: 'Spy', power: 'Exchange cards.', counter: 'Blocks Hacker.' },
    reporter: { name: 'Journalist', power: 'Protects a player.', counter: 'Blocks Minister.' },
  },
};

const syndicateBn: Translation = {
  ...dailyBn,
  gameTitle: 'দ্য সিন্ডিকেট',
  common: {
    ...dailyBn.common,
    // TODO: native bn review before merge.
    showingCard: 'সিন্ডিকেটের হাত প্রকাশ পাচ্ছে...',
  },
  actions: {
    income: '১ নিন',
    fundRaise: 'ফান্ড রেইজ: ২ নিন',
    tax: 'CEO: ৩ নিন',
    steal: 'হ্যাকার: ২ চুরি',
    exchange: 'স্পাই: বদল',
    attack: 'মিনিস্টার: ৩ খরচ',
    eliminate: 'এলিমিনেট: ৭ খরচ',
  },
  actionHelp: {
    income: '১ টাকা নিন। নিরাপদ। কেউ ব্লক বা চ্যালেঞ্জ করতে পারবে না।',
    fundRaise: '২ টাকা নিন। CEO চাইলে এটা ব্লক করতে পারে।',
    tax: 'CEO দাবি করে ৩ টাকা নিন। অন্যরা মিথ্যা মনে করলে চ্যালেঞ্জ করতে পারে।',
    steal: 'হ্যাকার দাবি করুন, তারপর একজন প্লেয়ার বেছে নিন। সর্বোচ্চ ২ টাকা চুরি হবে।',
    exchange: 'স্পাই দাবি করে ডেকের সাথে কার্ড বদল করুন।',
    attack: 'মিনিস্টার দাবি করে ৩ টাকা খরচ করুন, তারপর একজন প্লেয়ারের একটি কার্ড সরান।',
    eliminate: '৭ টাকা খরচ করে একজন প্লেয়ারের একটি কার্ড সরান। এটা ব্লক বা চ্যালেঞ্জ করা যাবে না।',
  },
  roles: {
    leader: { name: 'CEO', power: '৩ টাকা নেয়।', counter: 'ফান্ড রেইজ ব্লক করে।' },
    officer: { name: 'মিনিস্টার', power: '৩ টাকা দিয়ে একটি কার্ড সরায়।', counter: 'জার্নালিস্ট ব্লক করে।' },
    thief: { name: 'হ্যাকার', power: 'সর্বোচ্চ ২ টাকা চুরি করে।', counter: 'স্পাই ব্লক করে।' },
    helper: { name: 'স্পাই', power: 'কার্ড বদল করে।', counter: 'হ্যাকারকে ব্লক করে।' },
    reporter: { name: 'জার্নালিস্ট', power: 'প্লেয়ারকে বাঁচায়।', counter: 'মিনিস্টারকে ব্লক করে।' },
  },
};

export const translations: Record<Language, Translation> =
  brandMode === 'syndicate' ? { en: syndicateEn, bn: syndicateBn } : { en: dailyEn, bn: dailyBn };

export const formatMessage = (template: string, values?: Record<string, string | number>) =>
  Object.entries(values ?? {}).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template,
  );
