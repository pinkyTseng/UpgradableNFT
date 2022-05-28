const { ethers, upgrades } = require("hardhat");

const name = "CharlieNft U15"
const symbol = "CNftU15"

async function main() {
  const CharlieNft = await ethers.getContractFactory("CharlieNftU15");
  const charlieNft = await upgrades.deployProxy(CharlieNft, [name, symbol]);
  await charlieNft.deployed();
  console.log("CharlieNft deployed to:", charlieNft.address);
}

main();