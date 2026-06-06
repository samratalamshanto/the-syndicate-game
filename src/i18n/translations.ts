import { brandMode } from '../config/branding';
import type { RoleId } from '../domain/game/types';

export type Language = 'en' | 'bn';

type RoleCopy = {
  name: string;
  power: string;
  counter: string;
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
    safeActions: string;
    roleActions: string;
    attackActions: string;
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
    challengeDuelLine: string;
    challengeTargetLine: string;
    challengeNoTargetLine: string;
    challengeResultLiar: string;
    challengeResultTruth: string;
    challengeLoserLine: string;
    react: string;
    reactPrompt: string;
    challengeAction: string;
    blockAs: string;
    pass: string;
    inHand: string;
    outOfTime: string;
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
  };
  actions: Record<string, string>;
  actionHelp: Record<string, string>;
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
    safeActions: 'Safe actions',
    roleActions: 'Role / bluff actions',
    attackActions: 'Attack actions',
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
    showingCard: 'Showing card...',
    liar: 'Liar!',
    truth: 'Truth!',
    eliminated: 'Eliminated',
    revealedCard: '{player} revealed {role}',
    targetLocked: 'Target locked',
    tableDecision: 'Table decision',
    powerClaimed: 'Power claimed',
    cardLoss: 'Card loss',
    challengeDuelLine: '{challenger} challenged {actor}',
    challengeTargetLine: '{action} against {target}',
    challengeNoTargetLine: '{action}',
    challengeResultLiar: "{actor}'s {role} claim was false.",
    challengeResultTruth: "{actor}'s {role} claim was true.",
    challengeLoserLine: '{player} loses a card',
    react: 'React',
    reactPrompt: 'How do you react?',
    challengeAction: 'Challenge bluff',
    blockAs: 'Block as {role}',
    pass: 'Pass',
    inHand: 'in hand',
    outOfTime: 'Time up — passed.',
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
        claim: ['Trust me.', 'Just routine.'],
        challengeWin: ['Read you.'],
        challengeLose: ['...fair.'],
        bluffSuccess: ['Still calm.'],
      },
      aggressive: {
        claim: ['Move aside.', 'Pay attention.'],
        challengeWin: ['Too easy.'],
        challengeLose: ['Lucky hit.'],
        bluffSuccess: ['Cracked you.'],
      },
      unpredictable: {
        claim: ['Maybe true.', 'Try me.'],
        challengeWin: ['Wrong door.'],
        challengeLose: ['Interesting.'],
        bluffSuccess: ['That worked.'],
      },
      mirror: {
        claim: ['Your move.', 'Same energy.'],
        challengeWin: ['Saw that.'],
        challengeLose: ['I deserved that.'],
        bluffSuccess: ['You taught me.'],
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
    safeActions: 'নিরাপদ কাজ',
    roleActions: 'চরিত্র / ব্লাফ কাজ',
    attackActions: 'আক্রমণ',
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
    showingCard: 'কার্ড দেখানো হচ্ছে...',
    liar: 'মিথ্যা!',
    truth: 'সত্য!',
    eliminated: 'এলিমিনেটেড',
    revealedCard: '{player} {role} দেখিয়েছে',
    targetLocked: 'টার্গেট ঠিক হয়েছে',
    tableDecision: 'বোর্ডের সিদ্ধান্ত',
    powerClaimed: 'দাবি করা ক্ষমতা',
    cardLoss: 'কার্ড হারাবে',
    challengeDuelLine: '{challenger} {actor} কে চ্যালেঞ্জ করেছে',
    challengeTargetLine: '{target} এর বিরুদ্ধে {action}',
    challengeNoTargetLine: '{action}',
    challengeResultLiar: '{actor} এর {role} দাবি মিথ্যা ছিল।',
    challengeResultTruth: '{actor} এর {role} দাবি সত্য ছিল।',
    challengeLoserLine: '{player} একটি কার্ড হারাবে',
    react: 'প্রতিক্রিয়া',
    reactPrompt: 'কীভাবে প্রতিক্রিয়া দেবেন?',
    challengeAction: 'মিথ্যা ধরুন',
    blockAs: '{role} হিসেবে ব্লক',
    pass: 'পাস',
    inHand: 'হাতে আছে',
    outOfTime: 'সময় শেষ — পাস।',
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
        claim: ['বিশ্বাস করুন।', 'সাধারণ চাল।'],
        challengeWin: ['ধরে ফেলেছি।'],
        challengeLose: ['...ঠিক আছে।'],
        bluffSuccess: ['শান্ত আছি।'],
      },
      aggressive: {
        claim: ['সরে দাঁড়ান।', 'মন দিন।'],
        challengeWin: ['খুব সহজ।'],
        challengeLose: ['ভাগ্য ভালো।'],
        bluffSuccess: ['ভেঙে দিলাম।'],
      },
      unpredictable: {
        claim: ['হতেও পারে।', 'চেষ্টা করুন।'],
        challengeWin: ['ভুল দরজা।'],
        challengeLose: ['মজার।'],
        bluffSuccess: ['কাজ হলো।'],
      },
      mirror: {
        claim: ['আপনার চাল।', 'একই শক্তি।'],
        challengeWin: ['দেখেছি।'],
        challengeLose: ['প্রাপ্য ছিল।'],
        bluffSuccess: ['আপনিই শিখিয়েছেন।'],
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
