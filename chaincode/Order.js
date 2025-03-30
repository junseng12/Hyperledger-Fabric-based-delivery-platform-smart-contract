/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class OrderContract extends Contract {
  // mapping to walletAddress

  async initLedger(ctx) {
    console.info("============= START : Initialize Ledger ===========");

    const orders = [
      {
        orderId: "ORD100", // ✅ 반드시 포함되어야 함
        ordTime: "2023-04-09 17:13:25",
        restaurantID: "REST001",
        customerID: "CUST001",
        orderItems: [{ menu: "Fried chicken", amount: 1 }],
        orderToken: 15,
        evaluationToken: 2,
        deliverymanID: "DLV001",
        orderRequest: "Please get rid of daikon",
        orderStatus: "배달 중",
        deliverymanContactInfo: "010-8849-2320",
        deliveryAddress: "경기 수원시 팔달구 월드컵로 321번길 17",
        deliveryToken: 2,
        deliveryLocation: "경기 수원시 팔달구 월드컵로 315번길 2",
      },
      {
        orderId: "ORD101",
        ordTime: "2023-04-12 08:49:33",
        restaurantID: "REST001",
        customerID: "CUST002",
        orderItems: [
          { menu: "Spicy Tteokbokki", amount: 2 },
          { menu: "Fish cake", amount: 2 },
          { menu: "Set of fried foods", amount: 2 },
        ],
        orderToken: 22,
        evaluationToken: 3,
        deliverymanID: "",
        orderRequest: "Please add a lot of fried vegetables",
        orderStatus: "조리 시작",
        deliverymanContactInfo: "010-2554-0032",
        deliveryAddress: "경기 부천시 장말로 71",
        deliveryToken: 2,
        deliveryLocation: "경기 부천시 일신동 항동로 3",
      },
    ];

    // ✅ restaurantID 기준으로 묶기
    const groupedByRestaurant = {};

    for (const order of orders) {
      const restId = order.restaurantID;
      if (!groupedByRestaurant[restId]) {
        groupedByRestaurant[restId] = [];
      }
      groupedByRestaurant[restId].push(order);
    }

    // ✅ 저장 (restaurantID → orderList)
    for (const [restaurantID, orderList] of Object.entries(
      groupedByRestaurant
    )) {
      await ctx.stub.putState(
        restaurantID,
        Buffer.from(JSON.stringify(orderList))
      );
      console.log(`📦 저장 완료: ${restaurantID} → ${orderList.length}개 주문`);
    }

    console.info("============= END : Initialize Ledger ===========");
  }

  async queryOrd(ctx, restaurantID, orderId) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(`No orders found for restaurant ${restaurantID}`);
    }

    const orderList = JSON.parse(orderBytes.toString());
    const order = orderList.find((o) => o.orderId === orderId);

    if (!order) {
      throw new Error(
        `Order ${orderId} not found in restaurant ${restaurantID}`
      );
    }

    return JSON.stringify(order);
  }

  //주문자(고객)
  // Need to Ord attribute change
  // JSON 1개만 파라미터로 받아서 내부에서 파싱
  async createOrd(ctx, orderJson) {
    console.info("============= START : Create Ord ===========");

    const order = JSON.parse(orderJson);
    const {
      orderId,
      restaurantID,
      customerID,
      orderItems,
      orderToken,
      evaluationToken,
      deliverymanID,
      orderRequest,
      deliverymanContactInfo,
      deliveryAddress,
      deliveryToken,
      deliveryLocation,
    } = order;

    if (
      !orderId ||
      !restaurantID ||
      !customerID ||
      !orderItems ||
      orderItems.length === 0
    ) {
      throw new Error("Missing required fields");
    }

    // ✅ 기존 주문 리스트 불러오기
    const orderBytes = await ctx.stub.getState(restaurantID);
    let orderList = [];

    if (orderBytes && orderBytes.length > 0) {
      orderList = JSON.parse(orderBytes.toString());

      // ✅ 중복 주문 ID 확인
      const exists = orderList.find((o) => o.orderId === orderId);
      // 주문 존재하면 보여주고 아니면 (없음)
      console.log("✔️ 기존 주문 여부:", exists ? exists.toString() : "(없음)");
      if (exists && exists.length > 0) {
        throw new Error(`Order ${orderId} already exists`);
      }
    }

    // ✅ 새로운 주문 객체 생성
    const newOrder = {
      orderId,
      ordTime: new Date().toISOString(),
      restaurantID,
      customerID,
      orderItems,
      orderToken,
      evaluationToken,
      deliverymanID,
      orderRequest,
      orderStatus: "주문 요청 중",
      deliverymanContactInfo,
      deliveryAddress,
      deliveryToken,
      deliveryLocation,
    };

    // ✅ 주문 추가 후 저장
    orderList.push(newOrder);

    console.log("📝 저장할 데이터:", JSON.stringify(newOrder, null, 2));
    await ctx.stub.putState(
      restaurantID,
      Buffer.from(JSON.stringify(orderList))
    );

    console.info("=== END : Create Order ===");
    console.log("✅ 저장 완료:", JSON.stringify(newOrder, null, 2));
    return JSON.stringify(newOrder);
  }

  async queryAllOrds(ctx) {
    const allResults = [];

    // 모든 key-value 쌍 조회 - for-await-of 반복문을 통해 범위 내의 모든 주문들을 순차적으로 조회해서 allResults 배열에 저장함
    //실제 서비스에서 쓰려면:
    //주문 ID 키 설계 개선
    // 조건부 검색이 필요하다면 → CouchDB + Rich Query 고려
    // 데이터 많아지면 → Pagination 필수
    for await (const { key, value } of ctx.stub.getStateByRange("", "")) {
      try {
        const orders = JSON.parse(value.toString());

        // ✅ 배열이면 여러 주문, 단일 객체면 하나의 주문
        if (Array.isArray(orders)) {
          orders.forEach((o) => {
            allResults.push({ restaurantID: key, order: o });
          });
        } else {
          allResults.push({ restaurantID: key, order: orders });
        }
      } catch (err) {
        console.error(`❌ 파싱 오류 [${key}]:`, err.message);
      }
    }
    console.info(allResults);
    return JSON.stringify(allResults);
  }

  // 식당(가맹점) - 주문 수락 함수
  async setOrdapprove(ctx, customerID, restaurantID) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(`Order to ${restaurantID} does not exist`);
    }

    const order = JSON.parse(orderBytes.toString());
    const clientOrder = order.find((ord) => ord.customerID === customerID);

    if (!clientOrder) {
      throw new Error(
        `No order for Customer ${customerID} in restaurant ${restaurantID}`
      );
    }

    clientOrder.orderStatus = "주문 수락";
    await ctx.stub.putState(customerID, JSON.stringify(order));
    console.info("============= END : setOrdapprove ===========");
  }

  // 주문 거절(Delete) 함수
  async setOrdreject(ctx, customerID, restaurantID) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(`No order to ${restaurantID} exists`);
    }

    const order = JSON.parse(orderBytes.toString());
    const clientOrder = order.find((ord) => ord.customerID === customerID);

    if (!clientOrder) {
      throw new Error(
        `No order for Customer ${customerID} in restaurant ${restaurantID}`
      );
    }

    // ✅ 주문 거절은 "주문 요청 중" 상태에서만 가능
    if (clientOrder.orderStatus !== "주문 요청 중") {
      throw new Error(
        `Order for ${customerID} is not in a rejectable state: ${clientOrder.orderStatus}`
      );
    }

    // 주문 상태 변경
    clientOrder.orderStatus = "주문 거절";
    if (clientOrder.restaurantID !== restaurantID) {
      throw new Error(`Order does not belong to restaurant ${restaurantID}`);
    }

    await ctx.stub.putState(customerID, JSON.stringify(order));
    console.log(
      `Order for Customer ${customerID} in restaurant ${restaurantID} has been rejected.`
    );
    console.log("============= END : setOrdreject ===========");
  }

  // 주문 상태 변경 함수
  async setOrdchange(ctx, customerID, restaurantID, newStatus) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(
        `Order list for restaurant ${restaurantID} does not exist`
      );
    }

    const order = JSON.parse(orderBytes.toString());

    const validTransitions = {
      "주문 요청 중": "조리 시작",
      "조리 시작": "조리 완료",
      // "조리 완료": "배달 중", // 필요시 확장
    };

    const clientOrder = order.find((ord) => ord.customerID === customerID);
    if (!clientOrder) {
      throw new Error(
        `No order for Customer ${customerID} in restaurant ${restaurantID}`
      );
    }

    if (clientOrder.orderStatus === "주문 거절") {
      throw new Error("Rejected order cannot be updated.");
    }

    const currentStatus = clientOrder.orderStatus;
    const expectedNextStatus = validTransitions[currentStatus];

    if (expectedNextStatus !== newStatus) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'.`
      );
    }

    // ✅ 상태가 "주문 요청 중" → "조리 시작"으로 전환될 때 음식값 토큰 지급
    if (currentStatus === "주문 요청 중" && newStatus === "조리 시작") {
      const restaurantWallet = new WalletManager().getRestaurantWallet(
        restaurantID
      );
      await TokenERC20Contract.transfer(
        restaurantWallet,
        clientOrder.orderToken
      );
      clientOrder.orderToken = 0; // 토큰 지급 완료 → 0으로 초기화
      console.log(`🍽️ 음식값 토큰 지급 완료 → 식당 지갑: ${restaurantWallet}`);
    }

    // 상태 업데이트
    clientOrder.orderStatus = newStatus;

    // 상태 반영
    await ctx.stub.putState(restaurantID, Buffer.from(JSON.stringify(order)));

    console.log(`Order ${customerID} status has been updated to ${newStatus}`);
    console.log("============= END : setOrdchange ===========");
  }

  // 🛵 배달 수락 (배달원 등록)
  async acceptDelivery(ctx, restaurantID, orderId, deliverymanID) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(
        `Order list for restaurant ${restaurantID} does not exist`
      );
    }

    const orderList = JSON.parse(orderBytes.toString());
    const targetOrder = orderList.find((o) => o.orderId === orderId);

    if (!targetOrder) {
      throw new Error(`Order ${orderId} not found in ${restaurantID}`);
    }

    if (targetOrder.orderStatus !== "조리 완료") {
      throw new Error(
        "Only orders with status '조리 완료' can be accepted for delivery."
      );
    }

    if (targetOrder.deliverymanID && targetOrder.deliverymanID !== "") {
      throw new Error("Deliveryman already assigned.");
    }

    targetOrder.deliverymanID = deliverymanID;
    targetOrder.orderStatus = "배달 중";

    await ctx.stub.putState(
      restaurantID,
      Buffer.from(JSON.stringify(orderList))
    );

    console.log(`🚚 Deliveryman ${deliverymanID} assigned to order ${orderId}`);
    console.log("============= END : acceptDelivery ===========");
  }

  // 📦 배달 완료 처리
  async completeDelivery(ctx, customerID, restaurantID) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(
        `Order list for restaurant ${restaurantID} does not exist`
      );
    }

    const orderList = JSON.parse(orderBytes.toString());
    const clientOrder = orderList.find((ord) => ord.customerID === customerID);

    if (!clientOrder) {
      throw new Error(
        `No order for Customer ${customerID} in restaurant ${restaurantID}`
      );
    }

    if (clientOrder.orderStatus !== "배달 중") {
      throw new Error(
        `Order is not in delivery state: ${clientOrder.orderStatus}`
      );
    }

    clientOrder.orderStatus = "배달 완료";
    console.log(
      `💰 배달 토큰 지급됨: ${clientOrder.deliveryToken} tokens to deliveryman ${clientOrder.deliverymanID}`
    );
    clientOrder.deliveryToken = 0;

    await ctx.stub.putState(
      restaurantID,
      Buffer.from(JSON.stringify(orderList))
    );

    console.log(`📦 배달 완료 처리됨: Customer ${customerID}`);
    console.log("============= END : completeDelivery ===========");
  }

  //토큰 지급 함수
  //토큰 미지급 발생 시 관리자가 수동 호출해서 재처리 용도
  async getToken(ctx, customerID, restaurantID) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(`Order list for ${restaurantID} not found`);
    }

    const orderList = JSON.parse(orderBytes.toString());
    const targetOrder = orderList.find((ord) => ord.customerID === customerID);

    if (!targetOrder) {
      throw new Error(`No order found for customer ${customerID}`);
    }

    // ✅ 상태 조건 수정: 조리 완료일 때만 토큰 지급
    if (targetOrder.orderStatus !== "조리 완료") {
      throw new Error(
        `Order is not in '조리 완료' status: ${targetOrder.orderStatus}`
      );
    }

    // 💰 토큰 발행 및 지급 (mock 또는 실제 스마트 컨트랙트)
    const restaurantWallet = new WalletManager().getRestaurantWallet(
      restaurantID
    );

    await TokenERC20Contract.transfer(restaurantWallet, targetOrder.orderToken);

    // 토큰 값 초기화
    targetOrder.orderToken = 0;

    // ✅ 상태 업데이트 → 해당 주문이 포함된 전체 리스트 갱신
    await ctx.stub.putState(
      restaurantID,
      Buffer.from(JSON.stringify(orderList))
    );

    console.log(`✅ Tokens transferred for order of ${customerID}`);
  }

  // 배달자 토큰 지급 함수 (주문 상태: '배달 완료'일 때만 실행 가능)
  async rewardDeliveryMan(ctx, customerID, deliveryManID) {
    const orderBytes = await ctx.stub.getState(deliveryManID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(`No order list found for deliveryManID ${deliveryManID}`);
    }

    const orderList = JSON.parse(orderBytes.toString());
    const targetOrder = orderList.find((ord) => ord.customerID === customerID);

    if (!targetOrder) {
      throw new Error(`No order found for customer ${customerID}`);
    }

    if (targetOrder.orderStatus !== "배달 완료") {
      throw new Error(
        `Order for ${customerID} is not completed: ${targetOrder.orderStatus}`
      );
    }

    // 배달자 지갑 주소 가져오기
    const deliveryManWallet = new WalletManager().getDeliveryManWallet(
      deliveryManID
    );

    // 토큰 전송 (모의 처리)
    await TokenERC20Contract.transfer(
      deliveryManWallet,
      targetOrder.deliveryToken
    );

    // 지급된 토큰 초기화
    targetOrder.deliveryToken = 0;

    // WorldState 업데이트
    await ctx.stub.putState(
      deliveryManID,
      Buffer.from(JSON.stringify(orderList))
    );

    console.log(`✅ Delivery tokens transferred for order of ${customerID}`);
  }

  // 리뷰 작성 완료 후 평가 토큰 지급 함수
  async getEvaluationToken(ctx, customerID, restaurantID) {
    const orderBytes = await ctx.stub.getState(restaurantID);
    if (!orderBytes || orderBytes.length === 0) {
      throw new Error(`Order list for ${restaurantID} not found`);
    }

    const orderList = JSON.parse(orderBytes.toString());
    const targetOrder = orderList.find((ord) => ord.customerID === customerID);

    if (!targetOrder) {
      throw new Error(`No order found for customer ${customerID}`);
    }

    if (targetOrder.orderStatus !== "배달 완료") {
      throw new Error(
        `Evaluation token can only be issued after delivery is complete. Current status: ${targetOrder.orderStatus}`
      );
    }

    const customerWallet = new WalletManager().getClientWallet(customerID);

    await TokenERC20Contract.transfer(
      customerWallet,
      targetOrder.evaluationToken
    );

    // 평가 토큰 초기화
    targetOrder.evaluationToken = 0;

    // WorldState 업데이트
    await ctx.stub.putState(
      restaurantID,
      Buffer.from(JSON.stringify(orderList))
    );

    console.log(`🎉 Evaluation token sent to customer ${customerID}`);
  }
}

module.exports = OrderContract; // 테스트용
//module.exports.contracts = [Order]; // Fabric용
