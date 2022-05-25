const { expect, util } = require("chai");
const chai = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
require('dotenv').config();

// const { solidity } = require ("ethereum-waffle");
// chai.use(solidity);

const UnrevealedUrl = process.env.UnrevealedUrl
const RevealedUrl = process.env.RevealedUrl
const nftName = "charlie NFT"
const nftSymbol = "CFT"

const provider = waffle.provider;

// const expect = chai.expect;

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


// async function mintTask(mintCount, expectSuccess, proxyInstance, caller, userConnected){
async function mintTask(mintCount, expectSuccess, proxyInstance, caller, isCallByOther){
  return new Promise(async function(resolve, reject){
    var mintResponse;
    // try{
        console.log("@@@@@ mintTask start");  
        let balanceInWeiOld = await provider.getBalance(proxyInstance.address);
        let callerOwnCount = await proxyInstance.balanceOf(caller.address);
        let totalCount = await proxyInstance.totalSupply()
        let addedBalanceInWei = 0;
        let realAddedBalanceInWei = 0;

        let userConnected = proxyInstance;
        if(isCallByOther){
            userConnected = await proxyInstance.connect(caller);
        }
        //let user1Connrct = await charlieNft.connect(user1);
        let val = 0.01 * mintCount;
        // mintResponse = await userConnected.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});

        if(expectSuccess){
            // expect(await userConnected.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )})).to.not.be.reverted;
            await userConnected.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});

            callerOwnCount += mintCount;
            totalCount += mintCount;

            let balanceInWeiNew = await provider.getBalance(proxyInstance.address);
            addedBalanceInWei = balanceInWeiNew.sub(balanceInWeiOld);

            realAddedBalanceInWei = val;
        }else{
            // await expect(userConnected.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )})).to.be.revertedWith("over eachMintMaxCount");
            await expect(userConnected.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )})).to.be.reverted;
            // expect(await userConnected.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )})).to.throw();

            // const response = await userConnected.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )})
            // await expect(mintResponse.wait()).to.be.reverted;
        }
      
        expect(callerOwnCount).to.equal(await proxyInstance.balanceOf(caller.address));
        expect(totalCount).to.equal(await proxyInstance.totalSupply());    
        expect(addedBalanceInWei).to.equal(ethers.utils.parseEther(realAddedBalanceInWei.toString()));
        console.log("@@@@@ mintTask end");
        resolve();
    // }catch(e){
    //   console.log("mint trigger error~ "+e);
    //   // if(!expectSuccess){
    //   //   await expect(mintResponse.wait()).to.be.reverted;
    //   // }else{
    //   //   reject(e);
    //   // }
    //   reject(e);
    // }
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
  // const CharlieNftNew = await ethers.getContractFactory(upgradedContractName);
  // const upgradedhCarlieNft = await upgrades.upgradeProxy(proxyAddress, CharlieNftNew);
  // return upgradedhCarlieNft;
}


describe("CharlieNft", function () {
  let charlieNft;
  let owner, user1, user2, users;
  let upgradedhCarlieNft;

  // chai.use(solidity);

  

  describe("happy path flow", async function () {

    beforeEach(async () => {
      
      console.log("beforeEach run");
      [owner, user1, user2, ...users] = await ethers.getSigners();

      const CharlieNft = await ethers.getContractFactory("CharlieNft");
      charlieNft = await upgrades.deployProxy(CharlieNft, [nftName, nftSymbol]);
      await charlieNft.deployed();
      console.log("CharlieNft deployed to:", charlieNft.address);
      await charlieNft.setUnrevealedUrl(UnrevealedUrl);
      await charlieNft.setRevealedUrl(RevealedUrl);
      console.log("!!!! after set Urls");      
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
        await charlieNft.openSell();

        let mintCount = 3;
        let preMinedData = await getBeforeMintData(charlieNft, user1);
        let val = 0.01 * mintCount;
        let user1Connrct = await charlieNft.connect(user1);
        await user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});
        await checkAfterMintData(preMinedData, mintCount, charlieNft, user1);

        // console.log("*****before mintTask");        
        // await mintTask(3, true, charlieNft, user1, true);
        // console.log("*****after mintTask"); 
    });

    it("after upgrade other mint 3 nft", async function () {         
      await charlieNft.openSell(); 
      upgradedhCarlieNft = await upgrade(charlieNft.address, "CharlieNft2");


      let mintCount = 3;
      let preMinedData = await getBeforeMintData(upgradedhCarlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await charlieNft.connect(user1);
      await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )})).to.be.reverted;
      await checkAfterMintData(preMinedData, 0, upgradedhCarlieNft, user1);
      

      // console.log("*****before mintTask");  
      // await mintTask(3, true, upgradedhCarlieNft, user1, true);
      // console.log("*****after mintTask");      
    });




    // it("before & after upgrade mint 3 nft", async function () {
    //     let balanceInWeiOld = await provider.getBalance(charlieNft.address);      
    //     await charlieNft.openSell();
        
    //     let user1Connrct = await charlieNft.connect(user1);
    //     await user1Connrct.mint(1, {value: ethers.utils.parseEther('0.01')} );
  
    //     let theTOkenOwner = await charlieNft.ownerOf(1);
    //     expect(theTOkenOwner).to.be.equal(user1.address);
  
    //     expect(1).to.equal(await charlieNft.totalSupply());
  
    //     let balanceInWei = await provider.getBalance(charlieNft.address);
    //     let result = balanceInWei.sub(balanceInWeiOld)
    //     expect(result).to.equal(ethers.utils.parseEther('0.01'));



        
    //   });






    // it("tokenURI test", async function () {      
    //   await charlieNft.openSell();
    //   await charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
      
    //   let url = await charlieNft.tokenURI(1);
    //   let targetUrl = UnrevealedUrl
    //   expect(url).to.equal(targetUrl);

    //   await charlieNft.reveal();

    //   url = await charlieNft.tokenURI(1);
    //   targetUrl = RevealedUrl + 1 + ".json"
    //   expect(url).to.equal(targetUrl);
    // });

    // it("sumple isSellActive test", async function () {      
    //   expect(await charlieNft.isSellActive()).to.equal(false);
    //   await charlieNft.openSell();
    //   expect(await charlieNft.isSellActive()).to.equal(true);
    //   await charlieNft.pauseSell();
    //   expect(await charlieNft.isSellActive()).to.equal(false);
    // });

    // it("withdraw test", async function () {      
    //   await charlieNft.openSell();
    //   let ownerBalanceOld = await owner.getBalance()
    //   await charlieNft.connect(user1).mint(2, {value: ethers.utils.parseEther('0.02')} );
    //   await charlieNft.withdraw();
    //   let ownerBalance = await owner.getBalance()
    //   assert(ownerBalance.gt(ownerBalanceOld), 'owner not get money from contract');
    // });


  });
});

