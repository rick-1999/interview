const { expect } = require("chai");
const { ethers } = require("hardhat");
const {testERC721Deploy,factoryDeploy,fakeUSDTDeploy} = require("./utils/deploy")

describe("Market", function () {
    let erc721;
    let factory;
    let vault;
    let usdt;
    let tokenId = 1;
    let fragment = "10000000000000000000"; //100 ^ 18
    let zeroAddress = "0x0000000000000000000000000000000000000000";
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
        await erc721.mint(deployer.address, tokenId);

        factory = await factoryDeploy();
        await erc721.setApprovalForAll(factory.target, true);
        await factory.mint(erc721.target, tokenId, seller.address, fragment, ERC20Name, ERC20Symbol)

        const vaultRes = await factory.retrieveLastVault();
        const Vault = await ethers.getContractFactory("Vault");
        vault = Vault.attach(vaultRes.vault);

        usdt = await fakeUSDTDeploy(buyer);

        await usdt.connect(buyer).approve(vault.target, price);

        await vault.connect(seller).approve(vault.target, fragment)
    });

    it("Should place a sell order", async function () {
        await expect(vault.connect(seller).placeSellOrder(amount, price, usdt.target))
            .to.emit(vault, "SellOrderPlaced")
            .withArgs(0, amount, price, seller.address);

        const order = await vault.sellOrders(0);
        expect(order.amount).to.equal(amount);
        expect(order.price).to.equal(price);
        expect(order.seller).to.equal(seller.address);
    });

    it("Should cancel a sell order", async function () {
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);

        await expect(vault.connect(seller).cancelSellOrder(0))
            .to.emit(vault, "SellOrderCancelled")
            .withArgs(0, seller.address);

        const order = await vault.sellOrders(0);
        expect(order.amount).to.equal(0);
        expect(order.price).to.equal(0);
        expect(order.seller).to.equal(zeroAddress);
    });

    it("Should cancel a sell order agin", async function () {
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);
        await expect(vault.connect(seller).cancelSellOrder(0))
            .to.emit(vault, "SellOrderCancelled")
            .withArgs(0, seller.address);

        await expect(vault.connect(seller).cancelSellOrder(0)).to.be.revertedWith("Not authorized to cancel");
    });

    it("Should execute a buy order", async function () {
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);

        await expect(vault.connect(buyer).executeBuyOrder(0))
            .to.emit(vault, "BuyOrderExecuted")
            .withArgs(0, amount, price, buyer.address);
        expect(await vault.balanceOf(buyer.address)).to.equal(amount);
        expect(await usdt.balanceOf(seller.address)).to.equal(price);
    });

    it("Should execute a buy order agin", async function () {
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);

        await expect(vault.connect(buyer).executeBuyOrder(0))
            .to.emit(vault, "BuyOrderExecuted")
            .withArgs(0, amount, price, buyer.address);

        await expect(vault.connect(buyer).executeBuyOrder(0)).to.be.revertedWith("No such order");
    });

    it("Should execute a buy order agin", async function () {
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);

        await expect(vault.connect(buyer).executeBuyOrder(0))
            .to.emit(vault, "BuyOrderExecuted")
            .withArgs(0, amount, price, buyer.address);

        await expect(vault.connect(buyer).executeBuyOrder(0)).to.be.revertedWith("No such order");
    });

    it("Should return order", async function () {
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);
        let res = await vault.getSellOrders()
        expect(res.length).to.equal(1);
        expect(res[0].amount).to.equal(amount);
        expect(res[0].price).to.equal(price);
        expect(res[0].seller).to.equal(seller.address);
        expect(res[0].paymentToken).to.equal(usdt.target);
    });

    it("Should be returned after deletion", async function () {
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);
        await vault.connect(seller).placeSellOrder(amount, price, usdt.target);
        await vault.connect(seller).cancelSellOrder(1);
        let res = await vault.getSellOrders()
        expect(res.length).to.equal(1);
        expect(res[0].amount).to.equal(amount);
        expect(res[0].price).to.equal(price);
        expect(res[0].seller).to.equal(seller.address);
        expect(res[0].paymentToken).to.equal(usdt.target);
    });

    it("Should return after stress test (number 1000)", async function () {
        for (let i = 0; i < 1000; i++) {
            await vault.connect(seller).placeSellOrder(amount, price, usdt.target);
        }
        let res = await vault.getSellOrders()
        expect(res.length).to.equal(1000);
    });
});
