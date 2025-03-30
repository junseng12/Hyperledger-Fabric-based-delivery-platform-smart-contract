// test-queryOrd.js

const OrderContract = require("../chaincode/Order"); // 스마트 컨트랙트 로드
// const ctx = require("./mockCtx"); // 모의 Context 객체 불러오기
const ContextMock = require("./mockCtx");
const ctx = new ContextMock();

const contract = new OrderContract();

// ORD001 키로 조회될 가짜 주문 객체 설정
const mockOrder = {
  orderId: "ORD001",
  ordTime: new Date().toISOString(),
  restaurantID: "REST123",
  customerID: "CUST456",
  orderItems: [
    { menu: "Burger", amount: 2 },
    { menu: "Fries", amount: 1 },
  ],
  orderToken: 10,
  evaluationToken: 2,
  deliveryManID: "DLV789",
  orderRequest: "No onions, please",
  orderStatus: "주문 요청 중",
  deliveryManContact: "010-1234-5678",
  deliveryAddress: "123 Seoul Street",
  deliveryToken: 1,
  deliveryLocation: "Seoul Downtown",
};

// ctx.stub.getState에 응답값 세팅 (ORD001을 요청하면 mockOrder 반환)
ctx.stub.getState
  .withArgs("ORD001")
  .resolves(Buffer.from(JSON.stringify(mockOrder)));

(async () => {
  try {
    const result = await contract.queryOrd(ctx, "ORD001");
    console.log("🔍 주문 조회 결과:", result);
  } catch (error) {
    console.error("❌ 주문 조회 실패:", error);
  }
})();
