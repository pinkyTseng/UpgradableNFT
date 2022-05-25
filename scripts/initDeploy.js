const { ethers, upgrades } = require("hardhat");

const name = "Charlie Upgradable Nft"
const symbol = "CUFT"

async function main() {
  const CharlieNft = await ethers.getContractFactory("CharlieNft");
  const charlieNft = await upgrades.deployProxy(CharlieNft, [name, symbol]);
  await charlieNft.deployed();
  console.log("CharlieNft deployed to:", charlieNft.address);
}

main();