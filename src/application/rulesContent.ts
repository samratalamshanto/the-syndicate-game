import type { Language } from '../i18n/translations';

export type RuleSection = {
  title: string;
  lines: string[];
};

export const rulesContent = (language: Language): RuleSection[] =>
  language === 'bn'
    ? [
        {
          title: 'মূল লক্ষ্য',
          lines: [
            'প্রতিটি খেলোয়াড়ের ২টি গোপন কার্ড থাকে। ২টি হারালে আপনি আউট।',
            'টাকা জমিয়ে আক্রমণ করুন, ব্লাফ ধরুন, এবং শেষ খেলোয়াড় হিসেবে টিকে থাকুন।',
          ],
        },
        {
          title: 'চ্যালেঞ্জের নিয়ম',
          lines: [
            'কেউ চরিত্র দাবি করলে অন্য খেলোয়াড় চ্যালেঞ্জ করতে পারে।',
            'দাবি মিথ্যা হলে দাবিকারী একটি কার্ড হারায়।',
            'দাবি সত্য হলে চ্যালেঞ্জকারী একটি কার্ড হারায়। দাবিকারী প্রমাণিত কার্ড ডেকে ফেরত দিয়ে ডেক থেকে নতুন কার্ড বেছে নেয়।',
          ],
        },
        {
          title: 'উদাহরণ',
          lines: [
            'আপনি CEO দাবি করলেন। বট চ্যালেঞ্জ করল। আপনার CEO সত্য হলে বট একটি কার্ড হারাবে, তারপর আপনি CEO কার্ড ডেকে ফেরত দিয়ে নতুন কার্ড বেছে নেবেন।',
            'আপনি Minister আক্রমণ চ্যালেঞ্জ করে ভুল হলে, চ্যালেঞ্জের জন্য একটি কার্ড হারাবেন এবং আক্রমণের জন্য আরেকটি কার্ড ঝুঁকিতে যাবে।',
          ],
        },
      ]
    : [
        {
          title: 'Goal',
          lines: [
            'Each player has 2 secret cards. Lose both and you are out.',
            'Build money, pressure the table, catch bluffs, and be the last player standing.',
          ],
        },
        {
          title: 'Challenge Rule',
          lines: [
            'When a player claims a role, anyone may challenge that claim.',
            'If the claim was false, the actor loses one card.',
            'If the claim was true, the challenger loses one card. The actor returns the proven card to the deck, then chooses a replacement card from the deck.',
          ],
        },
        {
          title: 'Examples',
          lines: [
            'You claim CEO. A bot challenges. If your CEO is real, the bot loses one card, then you return CEO to the deck and choose a replacement.',
            'If you wrongly challenge a Minister attack, you lose one card for the failed challenge and another card is at risk from the attack.',
          ],
        },
      ];

const imageBytesFromDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const wrapCanvasText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (context.measureText(next).width <= maxWidth || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
};

const renderRulesCanvas = (language: Language) => {
  const sections = rulesContent(language);
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create PDF canvas');
  }
  context.fillStyle = '#f6edd6';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#111318';
  context.font = '700 48px Georgia, "Noto Serif Bengali", serif';
  context.fillText(language === 'bn' ? 'সিন্ডিকেট নিয়ম' : 'Syndicate Rules', 72, 110);
  let y = 178;
  for (const section of sections) {
    context.fillStyle = '#9b6a16';
    context.font = '700 32px Georgia, "Noto Serif Bengali", serif';
    context.fillText(section.title, 72, y);
    y += 46;
    context.fillStyle = '#27231d';
    context.font = '400 25px system-ui, "Noto Sans Bengali", sans-serif';
    for (const line of section.lines) {
      for (const wrapped of wrapCanvasText(context, line, 1060)) {
        context.fillText(wrapped, 92, y);
        y += 36;
      }
      y += 12;
    }
    y += 22;
  }
  return canvas;
};

export const downloadRulesPdf = (language: Language) => {
  const canvas = renderRulesCanvas(language);
  const imageBytes = imageBytesFromDataUrl(canvas.toDataURL('image/jpeg', 0.92));
  const content = `q 612 0 0 792 0 0 cm /RulesImage Do Q`;
  const encoder = new TextEncoder();
  const imageBuffer = imageBytes.buffer.slice(imageBytes.byteOffset, imageBytes.byteOffset + imageBytes.byteLength) as ArrayBuffer;
  const parts: BlobPart[] = [];
  const offsets: number[] = [0];
  let byteOffset = 0;
  const pushString = (value: string) => {
    parts.push(value);
    byteOffset += encoder.encode(value).byteLength;
  };
  const pushObject = (value: string) => {
    offsets.push(byteOffset);
    pushString(`${value}\n`);
  };

  pushString('%PDF-1.4\n%Rules\n');
  pushObject('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  pushObject('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  pushObject('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /RulesImage 4 0 R >> >> /Contents 5 0 R >> endobj');
  offsets.push(byteOffset);
  pushString(`4 0 obj << /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.byteLength} >> stream\n`);
  parts.push(imageBuffer);
  byteOffset += imageBytes.byteLength;
  pushString('\nendstream endobj\n');
  pushObject(`5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`);

  const xrefOffset = byteOffset;
  pushString(`xref\n0 6\n0000000000 65535 f \n`);
  pushString(offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join(''));
  pushString(`trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  const blob = new Blob(parts, { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = language === 'bn' ? 'syndicate-rules-bn.pdf' : 'syndicate-rules-en.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
