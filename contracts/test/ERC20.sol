//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeUSDT is ERC20 {
    constructor() ERC20("fakeUSDT", "usdt") {
        _mint(msg.sender, 1000000 * 10*18);
    }
}
