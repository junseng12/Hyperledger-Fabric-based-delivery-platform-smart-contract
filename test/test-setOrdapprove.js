// test/test-setOrdapprove.js

const OrderContract = require("../chaincode/Order");
// const ctx = require("./mockCtx");
const ContextMock = require("./mockCtx");
const ctx = new ContextMock();

const contract = new OrderContract();

// 가짜 주문 목록
const fakeOrderList = [
  {
    orderId: "ORD001",
    customerID: "CUST001",
    restaurantID: "REST999",
    orderStatus: "주문 요청 중",
    orderItems: [{ menu: "김밥", amount: 1 }],
  },
  {
    orderId: "ORD002",
    customerID: "CUST999",
    restaurantID: "REST999",
    orderStatus: "주문 요청 중",
    orderItems: [{ menu: "떡볶이", amount: 2 }],
  },
];

// 테스트용 버퍼로 변환
const storedOrderBuffer = Buffer.from(JSON.stringify(fakeOrderList));

// getState를 호출하면 해당 주문 목록이 있다고 가정
ctx.stub.getState.withArgs("REST999").resolves(storedOrderBuffer);

//putState()가 체인코드에서 호출될 때 에러 없이 정상적으로 실행되도록 만든 "더미 함수"
//putState() 실제 체인코드	주문 상태를 바꾼 후 WorldState에 반영하는 코드가 Order.js의 setOrdapprove 함수 내 정의됨
//테스트에서 putState()	실제 저장은 안 하지만, 호출만 해도 "잘 처리됐음"을 가정하는 더미 설정 (resolves() , 그래서 비워둠)
//왜 필요한가? 주문 수락 처리를 저장하려는 흐름을 끝까지 테스트하기 위해
ctx.stub.putState.resolves();

(async () => {
  try {
    // 테스트 실행
    await contract.setOrdapprove(ctx, "CUST001", "REST999");
    console.log("✅ 주문 수락 테스트 성공");
  } catch (error) {
    console.error("❌ 주문 수락 테스트 실패:", error);
  }
})();
