const { ethers, upgrades } = require("hardhat");

require('dotenv').config();
const proxyAddress = process.env.rinkebyProxyAddr;

async function main() {
  const CharlieNftNew = await ethers.getContractFactory("CharlieNft3");
  const upgradedhCarlieNft = await upgrades.upgradeProxy(proxyAddress, CharlieNftNew); 
  await upgradedhCarlieNft.deployed();
  console.log("upgradedhCarlieNft deployed to:", upgradedhCarlieNft.address);
}

main();