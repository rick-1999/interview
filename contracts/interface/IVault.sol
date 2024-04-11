// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IVault {
    struct NFTInfo {
        address nftAddress;
        uint256 nftId;
    }

    event VaultCreated(
        address indexed nft,
        uint256 indexed nftId,
        address indexed recipient,
        uint256 fragment
    );

    function initialize(
        address,
        uint256,
        address,
        address,
        uint256
    ) external;

    function redeem() external;

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external returns (bytes4);
}
