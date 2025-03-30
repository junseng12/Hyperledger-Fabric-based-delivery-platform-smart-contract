// 📁 test/test-acceptDelivery.js

const OrderContract = require("../chaincode/Order");
const ContextMock = require("./mockCtx");
const ctx = new ContextMock();
const contract = new OrderContract();

// 🧪 테스트용 가짜 주문 데이터
const fakeOrder = {
  ordTime: new Date().toISOString(),
  restaurantID: "REST999",
  customerID: "CUST001",
  orderItems: [{ menu: "Pizza", amount: 2 }],
  orderToken: 10,
  evaluationToken: 2,
  deliverymanID: "",
  orderRequest: "매운맛으로 해주세요",
  orderStatus: "조리 완료",
  deliverymanContactInfo: "010-1234-5678",
  deliveryAddress: "서울시 강서구 화곡동",
  deliveryToken: 1,
  deliveryLocation: "까치산역",
};

ctx.stub.getState
  .withArgs("ORDER123")
  .resolves(Buffer.from(JSON.stringify(fakeOrder)));
ctx.stub.putState.resolves();

(async () => {
  console.log("🧪 배달 수락 테스트 시작");

  try {
    await contract.acceptDelivery(ctx, "ORDER123", "DLV777");
    console.log("✅ 배달 수락 성공 (owner 값 변경됨)");
  } catch (err) {
    console.error("❌ 배달 수락 실패:", err.message);
  }

  console.log("🧪 테스트 종료");
})();
