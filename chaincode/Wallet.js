//-------------------------------------Wallet Management Class-----------------------------//
class WalletManager {
  constructor() {
    this.clientWallets = {};
    this.restaurantWallets = {};
  }

  setClientWallet(clientId, walletAddress) {
    this.clientWallets[clientId] = walletAddress;
  }

  setRestaurantWallet(restaurantId, walletAddress) {
    this.restaurantWallets[restaurantId] = walletAddress;
  }

  getClientWallet(clientId) {
    return this.clientWallets[clientId];
  }

  getRestaurantWallet(restaurantId) {
    return this.restaurantWallets[restaurantId];
  }
}

module.exports = WalletManager;
