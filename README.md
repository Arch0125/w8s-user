
# w8s
<img width="1275" alt="Screenshot 2024-12-08 at 4 17 54 AM" src="https://github.com/user-attachments/assets/fec6ae87-5182-4095-b186-25b9c4bbcbb1">

orchestration and security agents for web3



## Architecture

<img width="1422" alt="Screenshot 2024-12-08 at 2 03 26 AM" src="https://github.com/user-attachments/assets/b67d0736-6c5c-40cd-98c0-954c15cad4ae">



## Problem Statement

Orchestration and maintaining deployments is hard for web3
Maintaining ABI, Contracts and addresses and updating them across the codebases is almost done manually and prone to errors

Also the security analysis are mostly on the basis on logical/arithmatical errors, but what is there are errors beyond it, which can be harmful to the users when they finally interact

For this we need composable AI Agents which are specific to their usecases


## Agents

- **Smart Contract Agents** : These generate a UID for each smart contract containing each and every detail for execution of it, along with its vulnerabilities, the UID can be imported to spin up an agent which has the full context of that specific contract

- **Vulnerability Agents** : These agents scan through the smart contract and tests, looking for any hidden vulnerabilities beyond logical errors, and generate a full coverage report

- **Complain Agents** : These agents accept prompt from the user against a smart contract, and decode the complaint, and generate tests according verifying against the claim, if true it a generates and attests the complain/vulnerability against the contract publically

## Tech 

- UIDs are used to map a smart contract and used as reference to Smart Contract Agent
- Attestations contains mapping to Contract and ABIs stored on Walrus
- AI Agents' responses are generated within TEE thus providing computational guarantee
- AVS Network is used to verify the response signatures produced by TEE to provide public verifiability
- AI Agents used to generate custom tests to verify vulnerabilities within existing Hardhat environment
