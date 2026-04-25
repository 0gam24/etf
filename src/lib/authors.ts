/**
 * 사이트 저자 페르소나 (프론트엔드용).
 *
 *   ⚠️ 단일 소스: agents/personas.js
 *      name·age·title·bio·expertise·signature 등 공용 필드는 personas.js에서 import.
 *      이 파일은 **accent 컬러** overlay + 프론트엔드용 타입만 책임집니다.
 *      프로필 내용 수정은 agents/personas.js에서 하세요.
 */

// personas.js는 CommonJS. Next.js(esModuleInterop)에서 default import로 받아옴.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import personasModule from '../../agents/personas';

interface RawPersona {
  id: string;
  name: string;
  age: number;
  title: string;
  bio: string;
  expertise: string[];
  closingSignature: string;
  categories?: string[];
  sectorFocus?: string[];
  voiceHints?: string[];
}

const PERSONAS_RAW = (personasModule as unknown as {
  PERSONAS: Record<string, RawPersona>;
  pickPersona: (opts: { category?: string; sector?: string; date?: string | Date | number }) => RawPersona;
}).PERSONAS;
const PICK_PERSONA = (personasModule as unknown as {
  pickPersona: (opts: { category?: string; sector?: string; date?: string | Date | number }) => RawPersona;
}).pickPersona;

/** 저자별 카드 액센트 컬러 (프론트 전용 overlay) */
const ACCENT_MAP: Record<string, string> = {
  pb_kim:          '#D4AF37',
  mom_park:        '#F472B6',
  data_lee:        '#60A5FA',
  homemaker_jung:  '#34D399',
  biz_cho:         '#F59E0B',
  dev_song:        '#A78BFA',
  analyst_han:     '#EF4444',
};

export interface Author {
  id: string;
  name: string;
  age: number;
  title: string;
  bio: string;
  expertise: string[];
  signature: string;
  accent: string;
}

function toAuthor(p: RawPersona): Author {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    title: p.title,
    bio: p.bio,
    expertise: p.expertise,
    signature: p.closingSignature,
    accent: ACCENT_MAP[p.id] || '#D4AF37',
  };
}

export const AUTHORS: Record<string, Author> = Object.fromEntries(
  Object.entries(PERSONAS_RAW).map(([id, p]) => [id, toAuthor(p)]),
);

export const AUTHOR_LIST: Author[] = Object.values(AUTHORS);
export const AUTHOR_COUNT = AUTHOR_LIST.length;

/**
 * 메인 Chapter 6용 — 카테고리/섹터/날짜를 받아 오늘의 1인 + voiceHints 한 줄을 픽.
 *  - 페르소나 선택은 agents/personas.js의 pickPersona 룰을 그대로 사용 (글 배정 룰과 일치)
 *  - voiceLine은 해당 인물의 voiceHints에서 날짜 모듈로 결정적 픽 (페이지 새로고침에도 안정)
 */
export function pickDailyAuthor(opts: {
  category?: string;
  sector?: string;
  date?: string | Date | number;
}): { author: Author; voiceLine: string } {
  const raw = PICK_PERSONA(opts) || (Object.values(PERSONAS_RAW)[0] as RawPersona);
  const author = AUTHORS[raw.id] || toAuthor(raw);
  const hints = raw.voiceHints || [];
  let day: number;
  if (typeof opts.date === 'string' && /^\d{4}-?\d{2}-?\d{2}/.test(opts.date)) {
    day = parseInt(opts.date.replace(/[-/]/g, '').slice(6, 8), 10) || new Date().getDate();
  } else if (opts.date instanceof Date) {
    day = opts.date.getDate();
  } else if (typeof opts.date === 'number') {
    day = new Date(opts.date).getDate();
  } else {
    day = new Date().getDate();
  }
  const voiceLine = hints.length ? hints[day % hints.length] : '오늘 시장의 흐름을 한 줄로 정리해 보겠습니다.';
  return { author, voiceLine };
}
