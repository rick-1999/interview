//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Vault} from "./Vault.sol";
import "./interface/IFactory.sol";
import "./utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Factory is IFactory ,ReentrancyGuard {
    uint256 public vaultCount;

    mapping(uint256 => address) public vaultAddresses;

    constructor() {}

    function mint(
        address nft_,
        uint256 nftId_,
        address recipient_,
        uint256 fragment_,
        string memory name_,
        string memory symbol_
    ) external override nonReentrant returns (uint256) {
        address _vault = address(new Vault(name_, symbol_));

        IERC721(nft_).approve(_vault, nftId_);
        bytes memory _initializationCalldata = abi.encodeWithSignature(
            "initialize(address,uint256,address,address,uint256)",
            nft_,
            nftId_,
            msg.sender,
            recipient_,
            fragment_
        );

        (bool _ok, bytes memory returnData) = _vault.call(
            _initializationCalldata
        );
        require(_ok, string(returnData));

        vaultAddresses[vaultCount] = _vault;
        vaultCount++;

        emit VaultDeployed(nft_, nftId_, _vault);
        return vaultCount - 1;
    }

    // -----------------------  Help function   --------------------------
    function retrieveLastVault()
        public
        view
        override
        returns (address vault, uint256 mapLength)
    {
        if (vaultCount == 0) {
            return (address(0), 0);
        }
        vault = vaultAddresses[vaultCount - 1];
        mapLength = vaultCount;
    }

    function batchRetrieveVault(
        uint256 startIdx,
        uint256 endIdx
    )
        external
        view
        override
        returns (address[] memory vaults, uint256[] memory mapIndex)
    { 
        uint256 length = endIdx - startIdx + 1;
 
        if (startIdx >= vaultCount || length == 0) {
            return (new address[](0), new uint256[](0));
        }
 
        if (endIdx >= vaultCount) {
            length = vaultCount - 1 - startIdx + 1;
        }
 
        address[] memory addresses = new address[](length);
        uint256[] memory indexes = new uint256[](length);
 
        for (uint256 i = 0; i < length; i++) {
            addresses[i] = vaultAddresses[startIdx + i];
            indexes[i] = startIdx + i;
        }

        return (addresses, indexes);
    }
}
