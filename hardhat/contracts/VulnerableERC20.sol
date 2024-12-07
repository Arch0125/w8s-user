// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableERC20 {
    string public name = "VulnerableToken";
    string public symbol = "VULN";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not the admin");
        _;
    }

    constructor() {
        admin = msg.sender; // Deployer becomes the admin
    }

    // Minting function (only admin can mint)
    function mint(address account, uint256 amount) external onlyAdmin {
        require(account != address(0), "Mint to the zero address");
        totalSupply += amount;
        balances[account] += amount;
    }

    // Disabled transfer function
    function transfer(address recipient, uint256 amount) external returns (bool) {
        revert("Transfers are disabled");
    }
}
