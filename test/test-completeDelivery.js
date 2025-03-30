const OrderContract = require("../chaincode/Order");
const ContextMock = require("./mockCtx");
const ctx = new ContextMock();

const contract = new OrderContract();

// 🧪 테스트용 주문 목록 데이터
const fakeOrderList = [
  {
    customerID: "CUST001",
    restaurantID: "REST001",
    orderItems: [{ menu: "Fried Chicken", amount: 1 }],
    orderToken: 10,
    evaluationToken: 2,
    deliveryManID: "DLV001",
    orderRequest: "맵지 않게 해주세요",
    orderStatus: "배달 중", // ✅ 올바른 상태
    deliveryManContactInfo: "010-1234-5678",
    deliveryAddress: "서울시 강남구 테헤란로 123",
    deliveryToken: 1,
    deliveryLocation: "서울 강남역 인근",
    orderTime: new Date().toISOString(),
  },
  {
    customerID: "CUST002",
    restaurantID: "REST001",
    orderItems: [{ menu: "Pizza", amount: 2 }],
    orderToken: 15,
    evaluationToken: 3,
    deliveryManID: "DLV001",
    orderRequest: "도착 시 벨 눌러주세요",
    orderStatus: "조리 완료", // ❌ 잘못된 상태
    deliveryManContactInfo: "010-9876-5432",
    deliveryAddress: "서울시 종로구 종각역",
    deliveryToken: 1,
    deliveryLocation: "종로타워 앞",
    orderTime: new Date().toISOString(),
  },
];

// ✅ 동적으로 상태 반영되도록 설정
let mutableOrderList = JSON.parse(JSON.stringify(fakeOrderList));

ctx.stub.getState
  .withArgs("DLV001")
  .callsFake(() => Buffer.from(JSON.stringify(mutableOrderList)));

ctx.stub.putState.callsFake((key, value) => {
  // 실제로 변경된 값을 반영
  mutableOrderList = JSON.parse(value.toString());
});

// 테스트 실행
(async () => {
  console.log("✅ 배달 완료 상태 변경 테스트");

  try {
    await contract.completeDelivery(ctx, "CUST001", "DLV001", "배달 완료");
    console.log("✅ 배달 완료 정상 전이 성공");
  } catch (err) {
    console.error("❌ 배달 완료 실패:", err.message);
  }

  console.log("\n🚫 잘못된 상태에서 배달 완료 시도");

  try {
    await contract.completeDelivery(ctx, "CUST002", "DLV001", "배달 완료");
    console.log("❌ 잘못된 상태 전이 허용됨 (오류)");
  } catch (err) {
    console.log("✅ 전이 차단 성공:", err.message);
  }

  console.log("\n🧪 테스트 종료");
})();
