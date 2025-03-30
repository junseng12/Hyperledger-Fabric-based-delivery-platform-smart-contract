# 🚀 Hyperledger Fabric 기반 배달 플랫폼 스마트 컨트랙트

> 주문 · 배달 · 리뷰 · 토큰 지급을 블록체인으로 투명하게 관리하는 수수료 절감형 배달 시스템

---

## 📁 Project Structure

```
📦 root
 ┣ 📂 chaincode              # 스마트 컨트랙트 구현 (Order.js)
 ┣ 📂 test                   # 각 함수별 단위 테스트 및 통합 테스트
 ┣ 📜 mockCtx.js             # Fabric 테스트용 Context/Stub 모킹
 ┣ 📜 package.json           # npm 의존성 정의
 ┣ 📜 .gitignore             # Git 추적 제외 설정
 ┗ 📜 README.md              # 프로젝트 소개 문서
```

---

## ⚙️ Tech Stack

- **Hyperledger Fabric** – 블록체인 네트워크
- **Node.js** – 체인코드 개발
- **Mocha & Sinon** – 단위/통합 테스트 및 mocking
- **ERC-20 Token 모델 (Mock)** – 음식값/배달비/리뷰 토큰 지급

---

## ✅ 주요 기능

| 기능 이름 | 설명 |
|-----------|------|
| `createOrd` | 주문 생성 (WorldState에 저장) |
| `queryOrd` | 단일 주문 조회 |
| `queryAllOrds` | 전체 주문 목록 조회 |
| `setOrdapprove` / `setOrdreject` | 가맹점의 주문 수락 / 거절 처리 |
| `setOrdchange` | 주문 상태 단계별 변경 (주문 요청 중 → 조리 시작 → 조리 완료) + 음식값 토큰 지급 |
| `acceptDelivery` / `completeDelivery` | 배달원 수락 / 배달 완료 처리 + 배달 토큰 지급 |
| `getToken`, `rewardDeliveryMan`, `getEvaluationToken` | 수동 토큰 재지급 처리용 함수 (관리자 호출용) |

---

## 🧪 Test Strategy

- **단위 테스트**: `test/` 폴더 내 함수별 테스트 스크립트 존재
- **통합 테스트**: 전체 주문 흐름 테스트 (`integration-test-order.js`)
- **Mock 구성**:
  - `mockCtx.js`: Fabric Stub 모의 구성
  - `TokenERC20Contract`, `WalletManager`: 글로벌 객체로 mocking 처리

---

## 💻 실행 방법 (로컬 테스트 기준)


```bash
# 1. 패키지 설치
npm install

# 2. 단위 테스트 실행 (예시)
```bash
# 예: createOrd 함수 테스트
node test/test-createOrd.js
```

# 3. 통합 테스트 실행
```bash
node integration-test-order.js
```

# 4. 테스트가 끝나면 아래와 같은 로그를 확인할 수 있습니다:
```bash
🔹 1. 주문 생성(createOrd)
...
✅ 통합 테스트 완료. 최종 주문 상태:
{ ... }
```

# 5. 필요 시 `.env` 또는 `fabric-config`는 **테스트 목적상 필요 없음**
👉 Fabric 네트워크 없이 로컬 테스트 컨텍스트(`mockCtx.js`)로 실행됩니다.

---

## 🌱 향후 개선 예정

- [ ] 실제 ERC-20 Token 연동
- [ ] 고객/식당/배달원 인증 연동
- [ ] CouchDB 기반 조건 검색 도입
- [ ] 리뷰 작성 시 평가 로직 강화
- [ ] 주문 시간 기준 자동 만료 처리
