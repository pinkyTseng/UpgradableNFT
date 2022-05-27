const { expect, assert, util } = require("chai");
const chai = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
require('dotenv').config();

const UnrevealedUrl = process.env.UnrevealedUrl
const RevealedUrl = process.env.RevealedUrl
// const nftName = "charlie NFT"
// const nftSymbol = "CFT"
const nftName = "Charlie Upgradable Nft"
const nftSymbol = "CUFT"

const provider = waffle.provider;

async function getBeforeMintData(proxyInstance, caller){
  return new Promise(async function(resolve, reject){
    try{
      let dataObj = {};
      let balanceInWei = await provider.getBalance(proxyInstance.address);
      let callerOwnCount = await proxyInstance.balanceOf(caller.address);
      let totalCount = await proxyInstance.totalSupply()
      dataObj.balanceInWei = balanceInWei;
      dataObj.callerOwnCount = callerOwnCount;
      dataObj.totalCount = totalCount;
      resolve(dataObj);
    }catch(e){
      reject(e);
    }
  });
}

//mintCount should be 0 when revert case
async function checkAfterMintData(beforData, mintCount, proxyInstance, caller){
  return new Promise(async function(resolve, reject){
    try{
      expect(beforData.callerOwnCount + mintCount).to.equal(await proxyInstance.balanceOf(caller.address));
      expect(beforData.totalCount+ mintCount).to.equal(await proxyInstance.totalSupply());
      
      let balanceInWeiNew = await provider.getBalance(proxyInstance.address);
      addedBalanceInWei = balanceInWeiNew.sub(beforData.balanceInWei);
      let realAddedBalanceInWei = 0.01 * mintCount;
      expect(addedBalanceInWei).to.equal(ethers.utils.parseEther(realAddedBalanceInWei.toString()));

      resolve();
    }catch(e){
      reject(e);
    }
  });
}

async function upgrade(proxyAddress, upgradedContractName){
  return new Promise(async function(resolve, reject){
    try{
      const CharlieNftNew = await ethers.getContractFactory(upgradedContractName);
      const upgradedhCarlieNft = await upgrades.upgradeProxy(proxyAddress, CharlieNftNew);      
      resolve(upgradedhCarlieNft)
    }catch(e){
      reject(e)
    }
  });
}


describe("CharlieNft", function () {
  let charlieNft;
  let owner, user1, user2, users;
  let upgradedhCarlieNft;  

  describe("happy path flow", async function () {

    beforeEach(async () => {
      
      console.log("beforeEach run");
      [owner, user1, user2, ...users] = await ethers.getSigners();

      const CharlieNft = await ethers.getContractFactory("CharlieNft");
      charlieNft = await upgrades.deployProxy(CharlieNft, [nftName, nftSymbol]);
      await charlieNft.deployed();
      console.log("CharlieNft deployed to:", charlieNft.address);

      // await charlieNft.setUnrevealedUrl(UnrevealedUrl);
      // await charlieNft.setRevealedUrl(RevealedUrl);
      // await charlieNft.openSell();

      upgradedhCarlieNft = await upgrade(charlieNft.address, "CharlieNft3");
      await upgradedhCarlieNft.upgradeSettings();
      
      await upgradedhCarlieNft.setUnrevealedUrl(UnrevealedUrl);
      await upgradedhCarlieNft.setRevealedUrl(RevealedUrl);
      await upgradedhCarlieNft.openSell();
    });

    // it("self mint 1 nft", async function () {      
    //   let balanceInWeiOld = await provider.getBalance(charlieNft.address);
      
    //   await charlieNft.openSell();      
    //   await charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
    //   let theTOkenOwner = await charlieNft.ownerOf(1);
    //   expect(theTOkenOwner).to.be.equal(owner.address);
    //   expect(1).to.equal(await charlieNft.totalSupply());

    //   let balanceInWei = await provider.getBalance(charlieNft.address);
    //   let result = balanceInWei.sub(balanceInWeiOld)
    //   expect(result).to.equal(ethers.utils.parseEther('0.01'));
    //   // result.should.be.bignumber.equal(ethers.utils.parseEther('0.01'));
    // });

    // it("other mint 1 nft", async function () {
    //   let balanceInWeiOld = await provider.getBalance(charlieNft.address);      
    //   await charlieNft.openSell();
      
    //   let user1Connrct = await charlieNft.connect(user1);
    //   await user1Connrct.mint(1, {value: ethers.utils.parseEther('0.01')} );

    //   let theTOkenOwner = await charlieNft.ownerOf(1);
    //   expect(theTOkenOwner).to.be.equal(user1.address);

    //   expect(1).to.equal(await charlieNft.totalSupply());

    //   let balanceInWei = await provider.getBalance(charlieNft.address);
    //   let result = balanceInWei.sub(balanceInWeiOld)
    //   expect(result).to.equal(ethers.utils.parseEther('0.01'));
    // });

    it("other mint 3 nft", async function () {         
      // await charlieNft.openSell();
      let mintCount = 3;
      let preMinedData = await getBeforeMintData(upgradedhCarlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await upgradedhCarlieNft.connect(user1);
      await user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});      
      await checkAfterMintData(preMinedData, mintCount, upgradedhCarlieNft, user1);  

    });

    // it("after upgrade other mint 3 nft", async function () {         
    //   await charlieNft.openSell();     

    //   upgradedhCarlieNft = await upgrade(charlieNft.address, "CharlieNft2");
    //   let mintCount = 3;
    //   let preMinedData = await getBeforeMintData(upgradedhCarlieNft, user1);
    //   let val = 0.01 * mintCount;
    //   let user1Connrct = await upgradedhCarlieNft.connect(user1);
    //   //!ps: to.be.reverted shoould execute here, execute at async promise will fail 
    //   await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )})).to.be.reverted;
    //   await checkAfterMintData(preMinedData, 0, upgradedhCarlieNft, user1);           

    //   upgradedhCarlieNft = await upgrade(charlieNft.address, "CharlieNft3");
    //   await upgradedhCarlieNft.upgradeSettings();

    //    mintCount = 3;
    //    preMinedData = await getBeforeMintData(upgradedhCarlieNft, user1);
    //    val = 0.01 * mintCount;
    //    user1Connrct = await upgradedhCarlieNft.connect(user1);
    //   await user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});      
    //   await checkAfterMintData(preMinedData, mintCount, upgradedhCarlieNft, user1);  
    // });


    it("tokenURI test", async function () {      
      // await upgradedhCarlieNft.openSell();
      await upgradedhCarlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
      
      let url = await upgradedhCarlieNft.tokenURI(1);
      let targetUrl = UnrevealedUrl
      expect(url).to.equal(targetUrl);

      await upgradedhCarlieNft.reveal();

      url = await upgradedhCarlieNft.tokenURI(1);
      targetUrl = RevealedUrl + 1 + ".json"
      expect(url).to.equal(targetUrl);
    });

    it("sumple isSellActive test", async function () {
      expect(await upgradedhCarlieNft.isSellActive()).to.equal(true);
      await upgradedhCarlieNft.pauseSell();
      expect(await upgradedhCarlieNft.isSellActive()).to.equal(false);     
      await upgradedhCarlieNft.openSell();
      expect(await charlieNft.isSellActive()).to.equal(true);       
      // expect(await charlieNft.isSellActive()).to.equal(false);
      // await charlieNft.openSell();
      // expect(await charlieNft.isSellActive()).to.equal(true);
      // await charlieNft.pauseSell();
      // expect(await charlieNft.isSellActive()).to.equal(false);
    });

    it("withdraw test", async function () {      
      //await charlieNft.openSell();
      let ownerBalanceOld = await owner.getBalance()
      await upgradedhCarlieNft.connect(user1).mint(2, {value: ethers.utils.parseEther('0.02')} );
      await upgradedhCarlieNft.withdraw();
      let ownerBalance = await owner.getBalance()
      assert(ownerBalance.gt(ownerBalanceOld), 'owner not get money from contract');
    });


  });
});

