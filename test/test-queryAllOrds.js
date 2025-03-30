const OrderContract = require("../chaincode/Order");
// const ctx = require("./mockCtx");
const ContextMock = require("./mockCtx"); // ✅ 클래스 import
const ctx = new ContextMock(); // ✅ 인스턴스 생성

const contract = new OrderContract();

// 📦 테스트용 mock 주문 데이터
const mockOrders = [
  {
    Key: "ORD100",
    Record: {
      orderId: "ORD100",
      ordTime: "2025-03-30T10:00:00.000Z",
      restaurantID: "REST100",
      customerID: "CUST100",
      orderItems: [{ menu: "Sushi", amount: 3 }],
      orderToken: 12,
      evaluationToken: 2,
      orderRequest: "Extra wasabi",
      orderStatus: "조리 시작",
      deliveryAddress: "123 Tokyo St.",
      deliveryToken: 2,
      deliveryLocation: "Shibuya",
    },
  },
  {
    Key: "ORD101",
    Record: {
      orderId: "ORD101",
      ordTime: "2025-03-30T10:10:00.000Z",
      restaurantID: "REST101",
      customerID: "CUST101",
      orderItems: [
        { menu: "Ramen", amount: 1 },
        { menu: "Gyoza", amount: 2 },
      ],
      orderToken: 15,
      evaluationToken: 3,
      orderRequest: "No garlic",
      orderStatus: "주문 요청 중",
      deliveryAddress: "456 Kyoto Ave.",
      deliveryToken: 1,
      deliveryLocation: "Gion",
    },
  },
];

// 📍 ctx.stub.getStateByRange에 대한 시뮬레이션
ctx.stub.getStateByRange.callsFake(() => {
  const asyncIterator = {
    i: 0,
    async next() {
      if (this.i < mockOrders.length) {
        const order = mockOrders[this.i++];
        return {
          value: {
            key: order.Key,
            value: Buffer.from(JSON.stringify(order.Record)),
          },
          done: false,
        };
      }
      return { done: true };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
  return asyncIterator;
});

// 🧪 테스트 실행
(async () => {
  try {
    const result = await contract.queryAllOrds(ctx);
    console.log(
      "📋 전체 주문 조회 결과:\n",
      JSON.stringify(JSON.parse(result), null, 2)
    );
  } catch (error) {
    console.error("❌ 전체 주문 조회 실패:", error);
  }
})();
