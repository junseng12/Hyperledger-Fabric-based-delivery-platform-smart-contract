// test/test-setOrdreject.js

const OrderContract = require("../chaincode/Order");
const ContextMock = require("./mockCtx");
const ctx = new ContextMock();

const contract = new OrderContract();

// 테스트용 가짜 주문 목록 데이터
const fakeOrderList = [
  {
    orderId: "ORD001",
    restaurantID: "REST999",
    customerID: "CUST001",
    orderItems: [
      { menu: "치킨", amount: 2 },
      { menu: "콜라", amount: 1 },
    ],
    orderToken: 15,
    evaluationToken: 3,
    deliveryManID: "DLV1001",
    orderRequest: "양념은 덜 맵게 해주세요",
    orderStatus: "주문 요청 중",
    deliveryManContact: "010-1234-5678",
    deliveryAddress: "서울 강남구 테헤란로 123",
    deliveryToken: 2,
    deliveryLocation: "서울 강남구 역삼동",
  },
  {
    orderId: "ORD002",
    restaurantID: "REST999",
    customerID: "CUST002",
    orderItems: [
      { menu: "떡볶이", amount: 1 },
      { menu: "오뎅", amount: 2 },
    ],
    orderToken: 10,
    evaluationToken: 2,
    deliveryManID: "DLV1002",
    orderRequest: "맵기 보통으로 부탁드려요",
    orderStatus: "배달 완료",
    deliveryManContact: "010-5678-1234",
    deliveryAddress: "경기 성남시 분당구 정자동 456",
    deliveryToken: 1,
    deliveryLocation: "분당 정자동 커먼타운",
  },
];

const storedOrderBuffer = Buffer.from(JSON.stringify(fakeOrderList));

ctx.stub.getState.withArgs("REST999").resolves(storedOrderBuffer);
ctx.stub.putState.resolves();

(async () => {
  try {
    await contract.setOrdreject(ctx, "CUST001", "REST999");
    console.log("🚫 주문 거절 완료 - CUST001");
  } catch (error) {
    console.error("❌ 주문 거절 실패:", error);
  }
})();
