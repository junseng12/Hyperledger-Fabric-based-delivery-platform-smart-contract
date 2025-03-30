const OrderContract = require("./chaincode/Order");
const ContextMock = require("./test/mockCtx");
const sinon = require("sinon");

const ctx = new ContextMock();
const contract = new OrderContract();

// ✅ WorldState 흉내용 저장소
let mutableState = {};

ctx.stub.putState.callsFake((key, value) => {
  mutableState[key] = value;
});

ctx.stub.getState.callsFake((key) => {
  return mutableState[key] || null;
});

// 외부 의존성 모킹
global.TokenERC20Contract = {
  mint: sinon.fake.resolves("minted-token"),
  transfer: sinon.fake.resolves("transfer-success"),
};

global.WalletManager = class {
  setClientWallet() {}
  setRestaurantWallet() {}
  getClientWallet() {
    return "0xClientAddress";
  }
  getRestaurantWallet() {
    return "0xRestaurantAddress";
  }
};

(async () => {
  try {
    console.log("\n🔹 1. 주문 생성(createOrd)");
    await contract.createOrd(
      ctx,
      JSON.stringify({
        orderId: "ORD100",
        restaurantID: "REST999",
        customerID: "CUST001",
        orderItems: [{ menu: "Fried Chicken", amount: 1 }],
        orderToken: 10,
        evaluationToken: 2,
        deliveryManID: "",
        orderRequest: "맵지 않게 해주세요",
        deliveryManContactInfo: "010-1234-5678",
        deliveryAddress: "서울시 강남구 테헤란로 123",
        deliveryToken: 1,
        deliveryLocation: "서울 강남역 인근",
      })
    );

    console.log("\n🔹 2. 주문 조회(queryOrd)");
    const result = await contract.queryOrd(ctx, "REST999", "ORD100"); // 변경된 호출 방식
    console.log("결과:", result);

    console.log(
      "\n🔹 3. 상태 변경(setOrdchange: '주문 요청 중' → '조리 시작')"
    );
    await contract.setOrdchange(ctx, "CUST001", "REST999", "조리 시작");

    console.log("\n🔹 4. 상태 변경(setOrdchange: '조리 시작' → '조리 완료')");
    await contract.setOrdchange(ctx, "CUST001", "REST999", "조리 완료");

    // 여기선 오류 발생해야 정상 - 가게에서는 [조리 완료 -> 배달 중] 상태변화 불가
    // console.log("\n🔹 5. 상태 변경(setOrdchange: '조리 완료' → '배달 중')");
    // await contract.setOrdchange(ctx, "CUST001", "REST999", "배달 중");

    console.log("\n🔹 5. 상태 변경(setOrdchange: '조리 완료' → '배달 중')");
    await contract.acceptDelivery(ctx, "REST999", "ORD100", "DLV001");

    console.log("\n🔹 6. 배달 완료(completeDelivery)");
    await contract.completeDelivery(ctx, "CUST001", "REST999");

    console.log("\n✅ 통합 테스트 완료. 최종 주문 상태:");
    const finalState = JSON.parse(mutableState["REST999"].toString());
    console.log(JSON.stringify(finalState, null, 2));
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error.message);
  }
})();
