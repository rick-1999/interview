const { expect } = require("chai");

describe("Reentry", function () {
    let erc721;
    let vault;
    let owner;

    // initialize
    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        let ERC721Token = await ethers.getContractFactory("TeentryTestERC721");
        erc721 = await ERC721Token.deploy();

        let Vault = await ethers.getContractFactory("Vault");
        vault = await Vault.deploy("reentyTest", "reenty");
    });

    it("Should reentrant attacks be blocked", async function () {
        await expect(vault.initialize(erc721.target, 1, owner.address, owner.address, "10000000")).to.be.revertedWith("reentry :: Illegal commit (reentrancy attack)");
    });

});
