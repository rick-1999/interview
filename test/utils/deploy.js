
const { ethers } = require("hardhat");

async function testERC721Deploy() {
    let ERC721Token = await ethers.getContractFactory("TestERC721");
    return ERC721Token.deploy();
}

async function factoryDeploy() {
    let Factory = await ethers.getContractFactory("Factory");
    return Factory.deploy();
}

async function fakeUSDTDeploy(user) {
    let FakeUSDT = await ethers.getContractFactory("FakeUSDT");
    return FakeUSDT.connect(user).deploy();
}

module.exports = {
    testERC721Deploy,
    factoryDeploy,
    fakeUSDTDeploy
};