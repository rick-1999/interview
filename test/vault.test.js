
const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');
const {testERC721Deploy,factoryDeploy} = require("./utils/deploy")

describe("Vault", function () {
    let erc721;
    let factory;
    let vault;
    let owner;
    let addr1;
    let addr2;
    let tokenId = 1;
    let fragment = "10000000000000000000"; //100 ^ 18
    let zeroAddress = "0x0000000000000000000000000000000000000000";
    let ERC20Name = "TestToken";
    let ERC20Symbol = 'test';

    // initialize
    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        erc721 = await testERC721Deploy();
        await erc721.mint(owner.address, tokenId);

        factory = await factoryDeploy();
        await erc721.setApprovalForAll(factory.target, true);
        await factory.mint(erc721.target, tokenId, owner.address, fragment, ERC20Name, ERC20Symbol)

        const vaultRes = await factory.retrieveLastVault()

        const Vault = await ethers.getContractFactory("Vault");
        vault = Vault.attach(vaultRes.vault);
    });


    it("Check the nft belonging", async function () {
        expect(await erc721.ownerOf(tokenId)).to.equal(vault.target);
    });

    it("Should return the correct fragment name & symbol", async function () {
        expect(await vault.name()).to.equal(ERC20Name);
        expect(await vault.symbol()).to.equal(ERC20Symbol);
    });

    it("Should return the correct fragment totalSupply", async function () {
        expect(await vault.totalSupply()).to.equal(fragment);
        expect(await vault.totalSupply()).to.equal(await vault.balanceOf(owner.address));
    });

    it("Should transfer successful", async function () {
        let txAmount = "100000"
        let afterBalance = new BigNumber(fragment).minus(new BigNumber(txAmount))
        await vault.transfer(addr1.address, txAmount)
        expect(await vault.balanceOf(owner.address)).to.equal(afterBalance.toString());
        expect(await vault.balanceOf(addr1.address)).to.equal(txAmount);
    });

    it("Should nft redeem", async function () {
        await vault.redeem()

        expect(await vault.balanceOf(owner.address)).to.equal(0);
        expect(await vault.totalSupply()).to.equal(0);
        expect(await erc721.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("Should nft redeem again", async function () {
        await vault.redeem()
        await expect(vault.redeem()).to.be.revertedWith("The NFT is not stored in the vault");
    });

    it("Should initialize again", async function () {
        await expect(vault.initialize(erc721.target, tokenId, owner.address,owner.address, fragment)).to.be.revertedWith("initialize :: Already initialized");
    });
});