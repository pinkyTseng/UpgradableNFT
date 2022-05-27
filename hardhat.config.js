require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require('solidity-coverage')
require("@nomiclabs/hardhat-etherscan");

require('dotenv').config();

let pk = process.env.ganachePK;
let INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
let etherscanApiKey = process.env.etherscanApi;
let rinkebyPK = process.env.rinkebyPK;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    myGanache: {
      url: "http://localhost:7545",
      accounts: [pk],
      // chainId: "*"
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [rinkebyPK],
      chainId: 4
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: etherscanApiKey
  }
};
