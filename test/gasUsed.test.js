const { ethers } = require("hardhat");
const {testERC721Deploy,factoryDeploy,fakeUSDTDeploy} = require("./utils/deploy")

describe("GasUsed", function () {
    let erc721;
    let factory;
    let vault;
    let usdt;
    let tokenId = 1;
    let fragment = "10000000000000000000"; //100 ^ 18
    let ERC20Name = "TestToken";
    let ERC20Symbol = 'test';
    let deployer;
    let seller;
    let buyer;

    let amount = 1000;
    let price = 10000;

    // initialize
    beforeEach(async function () {
        [deployer, seller, buyer] = await ethers.getSigners();
 
        erc721 = await testERC721Deploy();
 
        factory = await factoryDeploy();

        usdt = await fakeUSDTDeploy(buyer);

    });

    it("gas Used", async function () {
        const txNftMint = await erc721.mint(deployer.address, tokenId);
        const receiptNftMint = await txNftMint.wait();
        console.log("nft Mint gas", receiptNftMint.gasUsed.toString())

        await erc721.setApprovalForAll(factory.target, true);
        const txFactoryMint = await factory.mint(erc721.target, tokenId, seller.address, fragment, ERC20Name, ERC20Symbol)
        const receiptFactoryMint = await txFactoryMint.wait();
        console.log("factory Mint gas", receiptFactoryMint.gasUsed.toString()) 

        const vaultRes = await factory.retrieveLastVault();
        const Vault = await ethers.getContractFactory("Vault");
        vault = Vault.attach(vaultRes.vault);

        await usdt.connect(buyer).approve(vault.target, price);
        await vault.connect(seller).approve(vault.target, fragment)

        const txPlaceSellOrder = await vault.connect(seller).placeSellOrder(amount, price, usdt.target);
        const receiptPlaceSellOrder = await txPlaceSellOrder.wait();
        console.log("placeSellOrder gasUsed", receiptPlaceSellOrder.gasUsed.toString())
        
        const txCancelSellOrder = await vault.connect(seller).cancelSellOrder(0)
        const receiptCancelSellOrder = await txCancelSellOrder.wait();
        console.log("CancelSellOrder gasUsed", receiptCancelSellOrder.gasUsed.toString())

        await vault.connect(seller).placeSellOrder(amount, price, usdt.target)
        const txExecuteBuyOrder = await vault.connect(buyer).executeBuyOrder(1)
        const receiptExecuteBuyOrder = await txExecuteBuyOrder.wait();
        console.log("ExecuteBuyOrder gasUsed", receiptExecuteBuyOrder.gasUsed.toString())

        await vault.connect(buyer).transfer(seller.address, amount)
        const txRedeem = await vault.connect(seller).redeem()
        const receiptRedeem = await txRedeem.wait();
        console.log("Redeem gasUsed", receiptRedeem.gasUsed.toString())

    });

});
