const OrderContract = require("../chaincode/Order");
const ContextMock = require("./mockCtx");
const ctx = new ContextMock();

const sinon = require("sinon");

const contract = new OrderContract();

// 가짜 주문 데이터
let mutableOrderList = [
  {
    customerID: "CUST001",
    restaurantID: "REST999",
    orderItems: [{ menu: "Fried Chicken", amount: 1 }],
    orderToken: 10,
    evaluationToken: 2,
    deliveryManID: "DLV001",
    orderRequest: "맵지 않게 해주세요",
    orderStatus: "주문 요청 중",
    deliveryManContactInfo: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123",
    deliveryToken: 1,
    deliveryLocation: "서울 강남역 인근",
    orderTime: new Date().toISOString(),
  },
];

// WorldState 흉내
ctx.stub.getState
  .withArgs("REST999")
  .resolves(Buffer.from(JSON.stringify(mutableOrderList)));

ctx.stub.putState.callsFake((key, value) => {
  mutableOrderList = JSON.parse(value.toString());
});

// Mock external dependency
global.TokenERC20Contract = {
  mint: sinon.fake.resolves("minted-token"),
  transfer: sinon.fake.resolves("transfer-success"),
};

// 테스트 코드에서 실제 WalletManager 모듈이 없거나 아직 구현 안 되어있을 때,
// "이거 있다고 치자~!" 하고 가짜 클래스를 전역에 선언해주는 것 (global 객체에 넣으면 어디서든 접근 가능)
global.WalletManager = class {
  //아무 일 안 함 (빈 함수) — 실제 동작은 생략
  setClientWallet() {}
  //이것도 빈 함수
  setRestaurantWallet() {}
  //항상 "0xClientAddress"를 반환
  getClientWallet() {
    return "0xClientAddress";
  }
  //항상 "0xRestaurantAddress"를 반환
  getRestaurantWallet() {
    return "0xRestaurantAddress";
  }
};

// 테스트 실행
(async () => {
  try {
    await contract.getToken(ctx, "CUST001", "REST999");
    console.log("✅ 토큰 지급 테스트 성공");
    console.log("변경된 주문 상태:", JSON.stringify(mutableOrderList, null, 2));
  } catch (err) {
    console.error("❌ 토큰 지급 테스트 실패:", err.message);
  }
})();
