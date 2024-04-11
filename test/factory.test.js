
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { factoryDeploy, testERC721Deploy } = require("./utils/deploy")

describe("Factory", function () {
    let erc721;
    let factory;
    let owner;
    let addr1;
    let addr2;
    let tokenId = 1;
    let fragment = "10000000000000000000"; //100 ^ 18
    let zeroAddress = "0x0000000000000000000000000000000000000000";

    // initialize
    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        erc721 = await testERC721Deploy();
        factory = await factoryDeploy();

        await erc721.mint(owner.address, tokenId);
    });

    it("Should mint a new vault", async function () {
        await erc721.setApprovalForAll(factory.target, true);
        await factory.mint(erc721.target, tokenId, owner.address, fragment, "TestToken", 'test')
        const vaultRes = await factory.retrieveLastVault()
        expect(vaultRes.vault).not.to.equal(zeroAddress);
    });

    it("Should return a new vaultCount", async function () {
        await erc721.setApprovalForAll(factory.target, true);
        await factory.mint(erc721.target, tokenId, owner.address, fragment, "TestToken", 'test')
        expect(await factory.vaultCount()).to.equal(1);
    });

    it("Should Initial inquiry retrieveLastVault", async function () {
        await erc721.setApprovalForAll(factory.target, true);
        const vaultRes = await factory.retrieveLastVault()
        expect(vaultRes.vault).to.equal(zeroAddress);
        expect(vaultRes.mapLength).to.equal(0);
    });

    it("Should batchRetrieveVault endIdx Out of test", async function () {
        await erc721.setApprovalForAll(factory.target, true);
        await factory.mint(erc721.target, tokenId, owner.address, fragment, "TestToken", 'test')
        await erc721.mint(owner.address, 2);
        await factory.mint(erc721.target, 2, owner.address, fragment, "TestToken", 'test')
        const arrRes = await factory.batchRetrieveVault(0, 5)
        expect(arrRes.vaults.length).to.equal(2);
        expect(arrRes.mapIndex.length).to.equal(2);
    });

    it("Should batchRetrieveVault startIdx Out of test", async function () {
        await erc721.setApprovalForAll(factory.target, true);
        await factory.mint(erc721.target, tokenId, owner.address, fragment, "TestToken", 'test')
        await erc721.mint(owner.address, 2);
        await factory.mint(erc721.target, 2, owner.address, fragment, "TestToken", 'test')
        const arrRes = await factory.batchRetrieveVault(2, 5)
        expect(arrRes.vaults.length).to.equal(0);
        expect(arrRes.mapIndex.length).to.equal(0);
    });

    it("Should batchRetrieveVault pressure test (number 1000)", async function () {
        await erc721.setApprovalForAll(factory.target, true);

        await factory.mint(erc721.target, tokenId, owner.address, fragment, "TestToken", 'test')
        for (let i = 2; i <= 1000; i++) {
            await erc721.mint(owner.address, i);
            await factory.mint(erc721.target, i, owner.address, fragment, "TestToken", 'test')
        }
        const arrRes = await factory.batchRetrieveVault(0, 1000)

        expect(arrRes.vaults.length).to.equal(1000);
        expect(arrRes.mapIndex.length).to.equal(1000);
    });
});