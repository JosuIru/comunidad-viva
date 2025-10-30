require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.POLYGON_DEPLOYER_PRIVATE_KEY
        ? [process.env.POLYGON_DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 137,
      gasPrice: 50000000000, // 50 gwei
    },
    // Polygon Mumbai Testnet
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.POLYGON_DEPLOYER_PRIVATE_KEY
        ? [process.env.POLYGON_DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 80001,
      gasPrice: 20000000000, // 20 gwei
    },
    // Local development
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    }
  },
  paths: {
    sources: "./contracts/polygon",
    tests: "./test/polygon",
    cache: "./cache/polygon",
    artifacts: "./artifacts/polygon"
  }
};
