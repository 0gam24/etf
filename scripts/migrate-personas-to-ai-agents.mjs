#!/usr/bin/env node
/**
 * 기존 발행 글의 author 메타 일괄 마이그레이션 — 인간 페르소나 → AI 분석 에이전트.
 *
 *   적용 범위 (한 글당):
 *     1) frontmatter `author:` 필드 → 새 AI 에이전트 이름
 *     2) frontmatter `schemas:` JSON-LD 안의 author.{name, jobTitle, description, url}
 *     3) 본문 closing signature ("— 김성훈, 은퇴 자산 설계 전문") → AI 에이전트 형식
 *
 *   ⚠️ 본문에 자연 문장으로 작성된 fake bio (예: "제가 25년 PB로…")는 자동 처리 X.
 *      Grep으로 audit 후 수동 정정 권장.
 *
 *   실행: node scripts/migrate-personas-to-ai-agents.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');

// authorId → { 기존 인간 정보 / 새 AI 에이전트 정보 }
const MAP = {
  pb_kim: {
    oldName: '김성훈', oldTitle: '前 증권사 프라이빗 뱅커 (25년 차)', oldDesc: '대형 증권사 PB본부에서 VVIP 자산 관리를 25년 담당. 현재는 은퇴 자산 설계 전문 칼럼니스트로 활동.',
    oldClosing: '— 김성훈, 은퇴 자산 설계 전문',
    newName: 'AI 에이전트 K', newTitle: '은퇴 자산 설계 분석 모델',
    newDesc: 'KRX 공공데이터·운용사 공식 공시·한국은행 ECOS를 입력으로, 분배 안정성 등급(12개월 분배 변동성 + 기초자산 변동성)과 계좌별(IRP·ISA·연금저축·일반) 세후 수익률을 산출하는 분석 모델.',
    newClosing: '— AI 에이전트 K · 은퇴 자산 설계 모델',
  },
  mom_park: {
    oldName: '박미라', oldTitle: '대기업 워킹맘 15년 차 / 생활 재테크 블로거', oldDesc: '두 아이를 키우며 직장과 투자를 병행한 15년. 실전 연금저축·ISA 활용 후기를 공유.',
    oldClosing: '— 박미라, 워킹맘 15년 차 투자 블로거',
    newName: 'AI 에이전트 P', newTitle: 'ISA·연금저축 비교 분석 모델',
    newDesc: '계좌 유형별 한도·세제·인출 조건을 데이터화하여 동일 종목·금액 기준 ISA / 연금저축 / IRP / 일반계좌의 누적 세후 수익률 차이를 산출하는 모델.',
    newClosing: '— AI 에이전트 P · ISA·연금저축 비교 모델',
  },
  data_lee: {
    oldName: '이재환', oldTitle: '퀀트 데이터 분석가 / AICPA', oldDesc: '금융 데이터 분석 경력 10년. 공공데이터와 한국은행 통계로 섹터 로테이션을 추적하는 것이 취미.',
    oldClosing: '— 이재환, 데이터 분석가 / AICPA',
    newName: 'AI 에이전트 L', newTitle: '퀀트 시그널·거래량 분석 모델',
    newDesc: 'KRX 일별 거래량·등락률·거래대금 시계열에서 5/20/60일 이동평균 대비 이탈률을 계산해 섹터 로테이션·이상 거래 시그널을 추출하는 퀀트 모델.',
    newClosing: '— AI 에이전트 L · 퀀트 시그널 분석 모델',
  },
  homemaker_jung: {
    oldName: '정유진', oldTitle: '전업주부 → 개인투자자 10년 차', oldDesc: '아이 학원비와 노후 준비를 월배당 ETF로 병행. 남편 월급 외 "내 현금흐름"을 10년간 만들어온 실전 후기.',
    oldClosing: '— 정유진, 전업주부 투자자',
    newName: 'AI 에이전트 J', newTitle: '월배당 캐시플로 시뮬레이션 모델',
    newDesc: '목표 월 현금흐름(예: 월 100만원)을 입력받아 분배율·계좌·종목 조합에 따라 필요 원금을 역산하고, 월별 분배 캘린더를 분산 매칭하는 시뮬레이션 모델.',
    newClosing: '— AI 에이전트 J · 월배당 캐시플로 시뮬레이션 모델',
  },
  biz_cho: {
    oldName: '조태훈', oldTitle: '자영업자(외식업 23년) / 노란우산·IRP 실사용자', oldDesc: '음식점 23년 운영하며 소득공제·절세의 중요성을 뼈저리게 체감. 개인사업자 절세 실전 노하우 공유.',
    oldClosing: '— 조태훈, 외식업 23년 자영업자',
    newName: 'AI 에이전트 C', newTitle: '개인사업자 절세·노란우산·IRP 분석 모델',
    newDesc: '개인사업자의 종합소득·노란우산 납입·IRP 기여를 결합해 연간 절세 효과(과표·세액공제)를 산출하고, ETF 매수 권장 계좌를 제안하는 모델.',
    newClosing: '— AI 에이전트 C · 개인사업자 절세 모델',
  },
  dev_song: {
    oldName: '송재혁', oldTitle: 'IT 개발자 / 반도체 기업 재직 10년', oldDesc: '반도체·AI 공급망을 가까이서 지켜본 엔지니어. 기술주·테마 ETF를 현업 시각에서 분석.',
    oldClosing: '— 송재혁, 반도체 기업 개발자 10년 차',
    newName: 'AI 에이전트 S', newTitle: 'AI·반도체 공급망 분석 모델',
    newDesc: '엔비디아·HBM·CXL 등 AI 인프라 공급망 키워드 뉴스 빈도와 KRX 반도체·AI ETF 거래량을 결합해 테마 모멘텀을 산출하는 모델.',
    newClosing: '— AI 에이전트 S · AI·반도체 공급망 모델',
  },
  analyst_han: {
    oldName: '한혜린', oldTitle: '증권사 리서치센터 애널리스트', oldDesc: '국내 대형 증권사 리서치센터에서 섹터 애널리스트로 근무. 기관·외국인 수급과 매크로 지표 해석 전문.',
    oldClosing: '— 한혜린, 증권사 리서치 애널리스트',
    newName: 'AI 에이전트 H', newTitle: '매크로·외국인 수급 분석 모델',
    newDesc: '외국인·기관 매매동향과 환율·금리·CPI 등 매크로 지표를 결합해 섹터 자금 흐름과 리스크 신호를 산출하는 모델.',
    newClosing: '— AI 에이전트 H · 매크로·외국인 수급 모델',
  },
};

// 이름 → authorId 역인덱스 (frontmatter에 authorId 없을 경우 fallback)
const NAME_TO_ID = Object.fromEntries(
  Object.entries(MAP).map(([id, m]) => [m.oldName, id]),
);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(full);
  }
  return files;
}

/**
 * frontmatter / body를 분리해서 둘 다 변환.
 * frontmatter는 line-based 처리 (YAML 안의 schemas는 한 줄 JSON).
 */
function migrate(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { changed: false, content };

  const [, fm, body] = fmMatch;
  let mutated = false;
  let agent = null;

  // 1) frontmatter line-based 처리
  const lines = fm.split('\n');
  // authorId 우선 식별
  for (const line of lines) {
    const m = line.match(/^authorId:\s*"([^"]+)"/);
    if (m && MAP[m[1]]) { agent = MAP[m[1]]; break; }
  }
  // authorId 없으면 author 이름으로 추정
  if (!agent) {
    for (const line of lines) {
      const m = line.match(/^author:\s*"([^"]+)"/);
      if (m && NAME_TO_ID[m[1]]) { agent = MAP[NAME_TO_ID[m[1]]]; break; }
    }
  }
  if (!agent) return { changed: false, content };

  // 2) frontmatter 라인 변환
  const newLines = lines.map(line => {
    // author: "김성훈" → author: "AI 에이전트 K"
    if (/^author:\s*"/.test(line)) {
      const next = line.replace(/^author:\s*"[^"]*"/, `author: "${agent.newName}"`);
      if (next !== line) mutated = true;
      return next;
    }
    // schemas: ... — JSON 한 줄. JSON.parse 후 author.* 갱신.
    if (/^schemas:\s*\[/.test(line)) {
      const jsonStr = line.replace(/^schemas:\s*/, '');
      try {
        const arr = JSON.parse(jsonStr);
        let touched = false;
        for (const sch of arr) {
          if (sch && typeof sch === 'object' && sch.author && sch.author['@type'] === 'Person') {
            if (sch.author.name === agent.oldName) { sch.author.name = agent.newName; touched = true; }
            if (sch.author.jobTitle === agent.oldTitle) { sch.author.jobTitle = agent.newTitle; touched = true; }
            if (sch.author.description === agent.oldDesc) { sch.author.description = agent.newDesc; touched = true; }
          }
        }
        if (touched) {
          mutated = true;
          return `schemas: ${JSON.stringify(arr)}`;
        }
      } catch (err) {
        console.warn(`  schemas JSON parse 실패: ${err.message}`);
      }
      return line;
    }
    return line;
  });

  // 3) 본문 closing signature 변환 + bio 단편 변환
  let newBody = body;
  if (newBody.includes(agent.oldClosing)) {
    newBody = newBody.split(agent.oldClosing).join(agent.newClosing);
    mutated = true;
  }
  // 흔한 fake-bio 단편 — 안전한 정형 패턴만 치환
  // "— 김성훈" 단독 라인 (closing에 약식으로 나오는 경우)
  const bareSig = `— ${agent.oldName}`;
  if (newBody.includes(bareSig) && !newBody.includes(agent.oldClosing)) {
    // closing이 이미 처리됐으면 중복 회피
    newBody = newBody.replace(new RegExp(`— ${agent.oldName}(?=[\\s\\n,.])`, 'g'), `— ${agent.newName}`);
    mutated = true;
  }

  if (!mutated) return { changed: false, content };
  return { changed: true, content: `---\n${newLines.join('\n')}\n---\n${newBody}` };
}

function main() {
  const files = walk(CONTENT_DIR);
  console.log(`📚 ${files.length}개 MDX 파일 검사`);

  let changed = 0;
  for (const file of files) {
    const orig = fs.readFileSync(file, 'utf-8');
    const { changed: did, content: next } = migrate(orig);
    if (did) {
      fs.writeFileSync(file, next, 'utf-8');
      console.log(`  ✏️  ${path.relative(ROOT, file)}`);
      changed++;
    }
  }

  console.log(`\n✅ ${changed}/${files.length}개 파일 갱신`);

  // 잔존 인간 이름 audit
  console.log('\n🔍 잔존 인간 이름 audit (본문 자연 문장에 박힌 fake bio):');
  const personas = Object.values(MAP).map(m => m.oldName);
  for (const file of files) {
    const c = fs.readFileSync(file, 'utf-8');
    const hits = personas.filter(p => c.includes(p));
    if (hits.length) console.log(`  ⚠️  ${path.relative(ROOT, file)} → ${hits.join(', ')}`);
  }
}

main();
