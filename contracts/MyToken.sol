// SPDX-License-Identifier: MIT 

pragma solidity ^0.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
  
    constructor(uint256 initialSupply)  ERC20("StarDucks Cappocino Token", "CAPPO") {
        _mint(msg.sender, initialSupply);
    }
}