// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface ISellOrder {
    struct SellOrder {
        uint256 index;
        uint256 amount;
        uint256 price;
        address seller;
        address paymentToken;
    }

    event SellOrderPlaced(
        uint256 indexed orderId,
        uint256 amount,
        uint256 price,
        address seller
    );
    event SellOrderCancelled(uint256 indexed orderId, address seller);
    event BuyOrderExecuted(
        uint256 indexed orderId,
        uint256 amount,
        uint256 price,
        address buyer
    );

    function placeSellOrder(uint256 , uint256 , address) external;

    function cancelSellOrder(uint256 ) external;

    function executeBuyOrder(uint256 ) external;

    function getSellOrders() external view returns (SellOrder[] memory);
}
