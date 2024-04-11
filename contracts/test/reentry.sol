// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../interface/IVault.sol";

contract TeentryTestERC721 is ERC721Burnable {
    constructor() ERC721("TestNFT", "tNFT") {} // solhint-disable-line no-empty-blocks

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        IVault(msg.sender).redeem();
        from;
        to;
        tokenId;
    }

}
