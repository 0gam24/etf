/**
 * MARKET PULSE 이미지 OCR — Gemini Vision API
 *
 *   입력: 로컬 이미지 경로
 *   출력: { rawText, tickers, topEtfs, sectorFlow } — 구조화 추출 실패 시 원문만 반환
 *
 *   환경변수: GEMINI_API_KEY
 */

const fs = require('fs');
const path = require('path');

const EXT_MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

function mimeOf(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return EXT_MIME[ext] || 'image/png';
}

/**
 * Gemini Vision으로 이미지 OCR 및 구조화
 */
async function ocrPulseImage(localPath) {
  if (!localPath || !fs.existsSync(localPath)) {
    return { ok: false, reason: 'no-image', rawText: '', topEtfs: [], sectorFlow: [] };
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: 'no-api-key', rawText: '', topEtfs: [], sectorFlow: [] };
  }

  try {
    const imageBase64 = fs.readFileSync(localPath).toString('base64');
    const mime = mimeOf(localPath);

    const prompt = `이 이미지는 한국 주식시장의 "MARKET PULSE" 일일 요약입니다.
다음을 JSON으로만 추출하세요. 절대 코드블록이나 설명을 붙이지 말고 순수 JSON만:

{
  "topEtfs": [
    { "rank": 1, "name": "KODEX 방산TOP10", "changeRate": 4.65 }
  ],
  "sectorFlow": [
    { "sector": "테크/AI", "changeRate": 0.85 },
    { "sector": "국내주식", "changeRate": 0.63 }
  ],
  "rawText": "이미지에서 읽은 전체 텍스트"
}

- 이미지에서 식별 가능한 만큼만 추출. 없는 항목은 빈 배열.
- 숫자는 % 기호 제외하고 소수로.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mime, data: imageBase64 } },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return { ok: false, reason: `gemini-${response.status}`, error: err.slice(0, 500), rawText: '', topEtfs: [], sectorFlow: [] };
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 코드블록 정리
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        ok: true,
        rawText: parsed.rawText || '',
        topEtfs: Array.isArray(parsed.topEtfs) ? parsed.topEtfs : [],
        sectorFlow: Array.isArray(parsed.sectorFlow) ? parsed.sectorFlow : [],
      };
    } catch (parseErr) {
      return { ok: false, reason: 'parse-failed', rawText: cleaned.slice(0, 2000), topEtfs: [], sectorFlow: [] };
    }
  } catch (err) {
    return { ok: false, reason: 'exception', error: err.message, rawText: '', topEtfs: [], sectorFlow: [] };
  }
}

module.exports = { ocrPulseImage };
