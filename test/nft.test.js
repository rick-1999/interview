const { expect } = require("chai");
const {testERC721Deploy} = require("./utils/deploy")

describe("ERC721Token", function () {
  let erc721;
  let owner;
  let addr1;
  let addr2;
  let tokenIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // initialize
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    erc721 = await testERC721Deploy();
  });


  it("Should mint can succeed", async function () {
    await erc721.mint(owner.address, tokenIds[0])
    expect(await erc721.ownerOf(tokenIds[0])).to.equal(owner.address);
  });

  it("Should No repeat casting", async function () {
    await erc721.mint(owner.address, tokenIds[0])
    await expect(erc721.mint(owner.address, tokenIds[0])).to.be.revertedWith("ERC721: token already minted");
  });

  it("Should batchMint can succeed", async function () {
    await erc721.batchMint(owner.address, tokenIds)
    for (const id of tokenIds) {
      expect(await erc721.ownerOf(id)).to.equal(owner.address);
    }
  });

  it("Should transfer ownership of an NFT token", async function () {
    await erc721.mint(addr1.address, tokenIds[0]);
    await erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenIds[0]);
    expect(await erc721.ownerOf(tokenIds[0])).to.equal(addr2.address);
  });

  it("Should return correct balance", async function () {
    await erc721.batchMint(addr1.address, tokenIds.slice(0, 2))
    await erc721.mint(addr2.address, tokenIds[2])
    expect(await erc721.balanceOf(addr1.address)).to.equal(2);
    expect(await erc721.balanceOf(addr2.address)).to.equal(1);
  });
});
