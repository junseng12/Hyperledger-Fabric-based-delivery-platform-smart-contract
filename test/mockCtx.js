// mockCtx.js
const sinon = require("sinon");

//Hyperledger Fabric에서 체인코드를 실행할 때 사용하는 Stub 객체를 가짜로 만든 클래스
//실제 네트워크 없이도 putState나 getState 같은 체인 연산을 테스트할 수 있도록

class ChaincodeStubMock {
  constructor() {
    this.putState = sinon.stub(); // 체인에 데이터를 저장하는 함수 흉내
    this.getState = sinon.stub(); // 체인에서 데이터를 조회하는 함수 흉내
    this.getStateByRange = sinon.stub(); // 전체 데이터 범위 조회 함수 흉내
  }
}

class ClientIdentityMock {
  constructor() {
    this.getID = sinon.stub(); // 사용자 ID 확인하는 부분을 가짜로 흉내
  }
}

class ContextMock {
  constructor() {
    this.stub = new ChaincodeStubMock(); // 체인 연산용 가짜 객체 연결
    this.clientIdentity = new ClientIdentityMock(); // 사용자 인증 가짜 객체
  }
}

module.exports = ContextMock;
