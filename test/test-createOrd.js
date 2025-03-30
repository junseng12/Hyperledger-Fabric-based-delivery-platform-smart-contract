const OrderContract = require("../chaincode/Order"); // 파일 경로 맞춰줘
// const ctx = require("./mockCtx");
const ContextMock = require("./mockCtx"); // ✅ 클래스 import
const ctx = new ContextMock(); // ✅ 인스턴스 생성

const contract = new OrderContract();

const mockOrder = {
  orderId: "ORD001",
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
  deliveryManContact: "010-1234-5678",
  deliveryAddress: "123 Seoul Street",
  deliveryToken: 1,
  deliveryLocation: "Seoul Downtown",
};

//Hyperledger Fabric 네트워크에 배포된 상태가 아니기 때문에, 실제 ledger에서 값을 가져올 수 없음
// -> 테스트를 위해 우리가 원하는 값이 반환되도록 미리 "약속(mock)"해주는 것
//Fabric의 getState()는 항상 Buffer 객체 반환
// -> World State에 해당 키가 없다면, Fabric은 빈 Buffer 반환
//Buffer.from("")는 실제 Fabric 네트워크에서 해당 주문 ID가 없는 경우와 같은 상황을 테스트에서 흉내낸(mock) 것
ctx.stub.getState.withArgs("ORD001").resolves(Buffer.from(""));

(async () => {
  try {
    const result = await contract.createOrd(ctx, JSON.stringify(mockOrder));
    console.log("🚀 Order successfully created:", result);
  } catch (error) {
    console.error("❌ Error creating order:", error);
  }
})();
