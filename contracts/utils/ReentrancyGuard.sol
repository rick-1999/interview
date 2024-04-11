//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract ReentrancyGuard { 

    bool private isReentrant;

    modifier nonReentrant() {
        require(!isReentrant, "reentry :: Illegal commit (reentrancy attack)");
        isReentrant = true;
        _;
        isReentrant = false;
    }

    constructor() {} 
}
