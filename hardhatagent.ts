import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { OpenAI } from 'openai';
import { createAttestation } from './eas-utils/eas';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI
const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Hardhat folder
const hardhatFolder = path.resolve(__dirname, './hardhat');

// Function to copy contract to the Hardhat contracts folder
async function copyContractToHardhat(contractCode, contractName) {
    const contractsFolder = path.join(hardhatFolder, 'contracts');
    if (!fs.existsSync(contractsFolder)) {
        fs.mkdirSync(contractsFolder);
    }

    const contractPath = path.join(contractsFolder, `${contractName}.sol`);
    fs.writeFileSync(contractPath, contractCode);
    console.log(`Contract saved to: ${contractPath}`);
}

// Function to generate AI test file for the vulnerability and copy it to the test folder
async function generateAndCopyTestFile(vulnerability, contractName, contractAddress) {
    const systemInstructions = {
        role: "system",
        content: `You are an AI that generates test scripts to verify vulnerabilities in smart contracts. Your task is to generate a Hardhat test file based on the following vulnerability. The test file should be written in JavaScript for Hardhat, and must be stored in the './hardhat/test' folder.

    Vulnerability object:
    ${JSON.stringify(vulnerability, null, 2)}

    The test file should check if the vulnerability can be replicated with the provided contract, and the test should output success or failure based on the vulnerability's presence. The test should try to invoke the specified methods and check the expected behavior.

    --Example--
    for example the test for the vulnerability given below  :

    {
  "vulnerabilities": [
    {
      "type": "locked",
      "description": "The contract has a disabled transfer function, which locks the tokens preventing any transfers.",
      "replication": {
        "method": ["transfer"]
      }
    }
  ]
}

the test generated should be :

    const { expect } = require('chai');

describe('Token contract', function () {
  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Token = await ethers.getContractFactory('VulnerableERC20');
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await Token.deploy();
    await token.waitForDeployment();
  });

  it('should not allow transfers', async function () {

    await expect(token.connect(owner).mint(addr1.address, 100)).to.be.fulfilled;
    await expect(token.connect(owner).transfer(addr2.address, 100)).to.be.revertedWith('Transfers are disabled');
  });
});

--Example ends--

also <contract_name>.deployed is not a function, use .waitForDeployment() instead.
    Similarly Provide the test code in JavaScript format. Do not write anything else except the test code. also do not put ticks in the beginning or comments in the code.`,
    };

    const messages = [systemInstructions];

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
        });

        const aiTestCode = response.choices[0].message.content;
        const testFolder = path.join(hardhatFolder, 'test');
        if (!fs.existsSync(testFolder)) {
            fs.mkdirSync(testFolder);
        }

        const testFilePath = path.join(testFolder, `${contractName}.js`);
        fs.writeFileSync(testFilePath, aiTestCode);
        console.log(`Test file saved to: ${testFilePath}`);
    } catch (error) {
        console.error('Failed to generate AI test:', error);
    }
}

// Function to run Hardhat tests
async function runHardhatTests() {
    exec('npx hardhat test', { cwd: hardhatFolder }, async(err, stdout, stderr) => {
        if (err) {
            console.error(`Error running Hardhat test: ${stderr}`);
            return;
        }
        console.log("Vulnerability verified successfully");
    });
}

// Main function to orchestrate the steps
export async function runVulnerabilityTest(vulnerability, contractCode, contractName) {
    // Step 1: Copy contract to Hardhat's contracts folder
    await copyContractToHardhat(contractCode, contractName);

    // Step 2: Generate and copy test file based on the vulnerability
    await generateAndCopyTestFile(vulnerability, contractName);

    // Step 3: Run Hardhat tests
    runHardhatTests();
}

// Example Usage
const exampleVulnerability = {
    "vulnerabilities": [
        {
            "type": "locked",
            "description": "The transfer function is disabled, which locks tokens in the contract and prevents users from transferring their tokens.",
            "replication": {
                "method": ["mint", "transfer"]
            }
        }
    ]
};

const exampleContract = `// SPDX-License-Identifier: MIT
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
`;

const contractName = 'VulnerableERC20';

const contractAddress = "0xe5095505e2f35094Ab6C77373E5d6ABe3eEBB227"

// Run the script
// main(exampleVulnerability, exampleContract, contractName)
//     .then(() => console.log('Automation complete'))
//     .catch((error) => console.error('Error during automation:', error));
