@AGENTS.md

# 🔒 보안 규칙 (절대 위반 금지)

## 비밀값 노출 금지

다음 값들은 **채팅·코드 예시·로그·문서·커밋 메시지** 어디에도 **원문 출력 금지**:

- API 키 (`*_API_KEY`, `*_CLIENT_SECRET`, `*_ACCESS_TOKEN` 등 모든 키류)
- `.env`·`.env.local`·`.env.*.local` 파일의 등호 뒤 값
- 서비스 계정 JSON (`tribal-*.json`, `*-service-account.json`, `google-*.json` 등)
- 사용자 비밀번호·토큰·인증서·개인키 (`*.pem`, `*.key`)

### 허용되는 것
- **변수명 자체** (예: `GEMINI_API_KEY`)는 자유롭게 사용 가능
- **마스킹 표기** (예: `val_len=20`, `AIza...8A`, `***`)
- **파일 경로 참조** (예: "`.env.local`의 GEMINI_API_KEY 값을 복사하세요")

### 금지 행동
- ❌ Read 결과를 그대로 채팅에 echo
- ❌ 사용자 안내 표에 실제 키 값 채워넣기
- ❌ 커밋 메시지·문서·디버그 출력에 키 노출
- ❌ "확인용"이라며 키 값을 다시 보여주기

## Git에 절대 올리지 않을 것

`.gitignore`에 다음 패턴이 항상 포함되어야 함 (이미 설정됨, 변경 시 검증 필수):

```
.env*.local
*-service-account.json
*credentials*.json
google-*.json
tribal-*.json
*.pem
*.key
data/raw/pulse_images/
```

추가 비밀 패턴 발견 시 즉시 `.gitignore`에 등록.

## 절차

1. **Read로 .env*.local 읽으면 즉시 키 라인은 마스킹 처리**해서만 사용자에게 보고
   - ❌ `GEMINI_API_KEY=AIza...`
   - ✅ `GEMINI_API_KEY: 길이 39자 (SET)`
2. **사용자에게 키 값 전달이 필요하면** "`.env.local`에서 직접 복사하세요" 식 파일 참조만
3. **새 비밀 파일 발견 시** 우선 `.gitignore`에 추가 → 그 다음 작업
4. **실수로 노출했을 때** 즉시 사과 + 영향받는 키 **재발급 권고**
