import axios from "axios";
import { agentDetails } from "./agentdetails";
import { scanForVulnerability } from ".";
import { OpenAI } from "openai";
import { runVulnerabilityTest } from "./hardhatagent";
import { createAttestation } from "./eas-utils/eas";
import { executeLitAction } from "./lit-actions/action";

export async function postComplain(uid: string, prompt: string, contractAddress) {
    const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';
    const details = await agentDetails(uid);

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // Initialize OpenAI
    const client = new OpenAI({
        apiKey: OPENAI_API_KEY,
    });

    let contract;

    try {
        const response = await axios.get(`${AGGREGATOR}/v1/${details.contractblobid}`);
        contract = response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    let vulnerability = await scanForVulnerability(contract);
    vulnerability = JSON.parse(vulnerability);

    console.log('Vulnerability:', vulnerability.vulnerabilities[0].type);

    const systemInstructions = {
        role: "system",
        content: `You are an AI that generates complaints for users who have been scammed by smart contracts
        you check the similarity between the vulnerability detected and the user's complaint
        
        Vulnerability object:
        ${JSON.stringify(vulnerability, null, 2)}
        
        User's complaint:
        ${prompt}

        you can oonly response in json structured format like 
        {
        "confidence": <confidence>,
        }
        confidence should be a number between 0 and 1
        `
    };

    let messages = [
        systemInstructions,
        { "role": "user", "content": prompt }
    ];

    const litResponse = await executeLitAction(messages);

    if (JSON.parse(litResponse).confidence > 0.7) {
        try {
            await runVulnerabilityTest(vulnerability, contract, 'VulnerableERC20');
            const attestation = await createAttestation(vulnerability.vulnerabilities[0].type, vulnerability.vulnerabilities[0].description, vulnerability.vulnerabilities[0].replication.method, contractAddress);
            console.log('Attestation:', attestation);
        } catch (error) {
            console.error(error);
        }
    }

}

// postComplain('0xe3fc9d71f20e64b9c88a46b419401061642a0078a8a70fe7b3259646026b1933', 'The contract has a disabled transfer function, which locks the tokens preventing any transfers.', '0x2f0667b6354500507C02013FAc36481387F905Af');