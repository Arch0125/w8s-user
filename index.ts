
import Configuration, { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI
const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
});

export async function scanForVulnerability(contract:string) {
    const systemInstructions = {
        role: "system",
        content: `You are an AI analyser of smart contracts, 
        which detects vulnerabilities,
        the vulnerabilities should be user oriented, if their tokens are locked or abused, 
        and returns analysis report in only JSON strustured format like

        next the response should also contain the replication of the vulnerability if a structured format mentioning the methods called, like 

        the method response should only name the method of the contract like ["mint","transfer"]
  
        {
  "vulnerabilities": [
    {
      "type": <type>,
      "description": <description>,
      replication: {
    "method": [<contract methods which can be called sequentially to replicate the vulnerability>]
  }
    }
  ]

  the types can be : locked, overallowance

  
}`,
    };

//     const contract = `// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// contract VulnerableERC20 {
//     string public name = "VulnerableToken";
//     string public symbol = "VULN";
//     uint8 public decimals = 18;
//     uint256 public totalSupply;
//     mapping(address => uint256) public balances;

//     address public admin;

//     modifier onlyAdmin() {
//         require(msg.sender == admin, "Not the admin");
//         _;
//     }

//     constructor() {
//         admin = msg.sender; // Deployer becomes the admin
//     }

//     // Minting function (only admin can mint)
//     function mint(address account, uint256 amount) external onlyAdmin {
//         require(account != address(0), "Mint to the zero address");
//         totalSupply += amount;
//         balances[account] += amount;
//     }

//     // Disabled transfer function
//     function transfer(address recipient, uint256 amount) external returns (bool) {
//         revert("Transfers are disabled");
//     }
// }

// `

    let messages = [systemInstructions ];
    messages.push({ role: "user", content: contract });

    // Process the message with OpenAI
    try {
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        });

        const reply = response.choices[0].message.content;

        console.log(reply);
        return reply
    } catch (error) {
        console.error("Failed to process the message with OpenAI:", error);
    }
}