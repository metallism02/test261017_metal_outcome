# 자율성과지표 성과관리 대시보드 (Netlify 배포판)

로그인·접속코드·수정 PIN 없이 **링크만 있으면 누구나 보고, 실적을 입력·저장**할 수 있는 버전입니다.
입력한 값은 Netlify 공유 저장소(Netlify Blobs)에 저장되어 모든 접속자에게 같은 값이 보입니다.

## 폴더 구성
```
public/index.html            화면(웹앱)
netlify/functions/data.mjs   데이터 불러오기·저장 API (/api/data), 저장 시 자동 백업 50개
netlify/functions/report.mjs AI 요약보고서 문장 작성 API (/api/report)
netlify/lib/seed.mjs         초기 데이터(2026학년도 2분기)
netlify.toml, package.json   Netlify 설정
```

## 배포 방법 (GitHub → Netlify)
1. GitHub에서 새 저장소(Repository)를 만듭니다. 예: `kpi-dashboard`
2. **Add file → Upload files**로 이 폴더 안의 파일·폴더를 모두 끌어다 놓고 **Commit changes**
   (폴더째 올려야 합니다. `public`, `netlify` 폴더 구조가 유지되어야 함)
3. [app.netlify.com](https://app.netlify.com) 로그인 → **Add new site → Import an existing project → GitHub** → 저장소 선택
4. 설정은 `netlify.toml`이 자동으로 채워 주므로 그대로 **Deploy** 클릭
5. 1~2분 뒤 `https://○○○.netlify.app` 주소가 생기면 완료. Site settings에서 주소 이름을 바꿀 수 있습니다.

이후에는 GitHub에서 파일을 고치면 Netlify가 자동으로 다시 배포합니다.

## AI 요약보고서를 Claude가 작성하게 하려면 (선택)
Netlify → Site configuration → **Environment variables** → Add variable
- `ANTHROPIC_API_KEY` = 발급받은 API 키
- (선택) `ANTHROPIC_MODEL` = 사용할 모델 ID (기본값 `claude-sonnet-4-5`, docs.claude.com 모델 목록 참고)

추가 후 **Deploys → Trigger deploy**로 한 번 다시 배포합니다.
키를 넣지 않으면 '규칙 기반 자동 요약'으로 작성됩니다.
**API 키는 절대 GitHub 파일에 적지 마세요.** (환경변수에만 넣기)

## 주의
- 링크를 아는 사람은 **누구나 수정**할 수 있습니다. 링크는 사업단 내부에만 공유하세요.
- 동시에 두 사람이 저장하면 나중에 저장한 값이 남습니다. 이전 값은 백업(최근 50개)에 보관됩니다.
- 실수로 지웠다면 화면의 [실적 입력] → [데이터 불러오기]로 내보내 둔 파일을 다시 넣거나, [초기값 복원] 후 저장하세요.
- 학생 개인정보(명단, 학번 등)는 입력하지 마세요.
- 수치는 반드시 원본 자료와 대조해 최종 확인하세요.
