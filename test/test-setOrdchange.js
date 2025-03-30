const OrderContract = require("../chaincode/Order");
const ContextMock = require("./mockCtx");
const ctx = new ContextMock();
const contract = new OrderContract();

// 🧪 테스트용 전체 주문 데이터 형식 (거절 상태 포함)
const fakeOrderList = [
  {
    customerID: "CUST001",
    restaurantID: "REST999",
    orderItems: [{ menu: "Fried Chicken", amount: 1 }],
    orderToken: 10,
    evaluationToken: 2,
    deliveryManID: "DLV001",
    orderRequest: "맵지 않게 해주세요",
    orderStatus: "주문 요청 중",
    deliveryManContact: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123",
    deliveryToken: 1,
    deliveryLocation: "서울 강남역 인근",
    orderTime: new Date().toISOString(),
  },
  {
    customerID: "CUST002",
    restaurantID: "REST999",
    orderItems: [{ menu: "Tteokbokki", amount: 2 }],
    orderToken: 8,
    evaluationToken: 1,
    deliveryManID: "DLV002",
    orderRequest: "치즈 추가",
    orderStatus: "조리 시작",
    deliveryManContact: "010-2345-6789",
    deliveryAddress: "서울시 마포구 연남동 456",
    deliveryToken: 1,
    deliveryLocation: "홍대입구역 근처",
    orderTime: new Date().toISOString(),
  },
  {
    customerID: "CUST003",
    restaurantID: "REST999",
    orderItems: [{ menu: "Pizza", amount: 1 }],
    orderToken: 12,
    evaluationToken: 3,
    deliveryManID: "DLV003",
    orderRequest: "피클 빼주세요",
    orderStatus: "조리 완료",
    deliveryManContact: "010-3456-7890",
    deliveryAddress: "서울시 종로구 종각역 7번 출구",
    deliveryToken: 2,
    deliveryLocation: "종로타워 앞",
    orderTime: new Date().toISOString(),
  },
  {
    customerID: "CUST004",
    restaurantID: "REST999",
    orderItems: [{ menu: "Burger Set", amount: 1 }],
    orderToken: 9,
    evaluationToken: 1,
    deliveryManID: "DLV004",
    orderRequest: "소스 많이",
    orderStatus: "주문 거절",
    deliveryManContact: "010-4567-8901",
    deliveryAddress: "서울시 관악구 봉천동",
    deliveryToken: 1,
    deliveryLocation: "서울대입구역",
    orderTime: new Date().toISOString(),
  },
];

// ✅ 동적으로 상태 반영되도록 설정
let mutableOrderList = JSON.parse(JSON.stringify(fakeOrderList));

ctx.stub.getState
  .withArgs("REST999")
  .callsFake(() => Buffer.from(JSON.stringify(mutableOrderList)));

ctx.stub.putState.callsFake((key, value) => {
  // 실제로 변경된 값을 반영
  mutableOrderList = JSON.parse(value.toString());
});

(async () => {
  console.log("✅ 유효한 상태 전이 테스트 시작");

  try {
    await contract.setOrdchange(ctx, "CUST001", "REST999", "조리 시작");
    await contract.setOrdchange(ctx, "CUST002", "REST999", "조리 완료");
    await contract.setOrdchange(ctx, "CUST003", "REST999", "배달 중");
    console.log("✅ 유효한 상태 전이 테스트 성공");
  } catch (err) {
    console.error("❌ 유효한 상태 전이 실패:", err.message);
  }

  console.log("\n🚫 잘못된 상태 전이 테스트 시작");

  try {
    await contract.setOrdchange(ctx, "CUST001", "REST999", "배달 중"); // ❌ 조리 시작 → 배달 중은 불가
  } catch (err) {
    console.log("✅ 잘못된 전이 탐지됨:", err.message);
  }

  try {
    await contract.setOrdchange(ctx, "CUST004", "REST999", "조리 시작"); // ❌ 거절 상태 → 전이 금지
  } catch (err) {
    console.log("✅ 거절 상태에 대한 전이 차단됨:", err.message);
  }

  console.log("\n🧪 테스트 종료");
})();
