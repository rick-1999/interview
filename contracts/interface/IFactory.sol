// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IFactory {
    event VaultDeployed(
        address indexed nft,
        uint256 indexed nftId,
        address indexed newVault
    );

    function mint(
        address,
        uint256,
        address,
        uint256,
        string memory,
        string memory
    ) external returns (uint256);

    function retrieveLastVault()
        external
        view
        returns (address, uint256);

    function batchRetrieveVault(
        uint256,
        uint256
    )
        external
        view
        returns (address[] memory, uint256[] memory);
}
