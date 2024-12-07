import { ethers } from "ethers";
import { agentDetails } from "./agentdetails"
import axios from 'axios';
import { OpenAI } from "openai";

async function main(){
    const uid = '0x50bf4140b839544e3d41f7f02dc5a9365ef55b2a7d1cdacaaf1e5607554b0912'
    const details = await agentDetails(uid)
    console.log(details)

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI
const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
});


    const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space'; 


    let abi;

    try {
        const response = await axios.get(`${AGGREGATOR}/v1/${details.abiblobid}`);
        console.log(response.data.abi);
        abi = response.data.abi;
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    const baseProvider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const holeskyProvider = new ethers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/0fxbpb4OCXkkyHhFNPBRelJsFg7XdhML');

    const baseGasPrice = await baseProvider.getFeeData();
    const holeskyGasPrice = await holeskyProvider.getFeeData();

    const systemInstructions = {
        role: "system",
        content: `You are an AI Transaction analyser from prompt, youll be given ABI of a contract 
        and a prompt from an user, you have to analyse the prompt
        and return as follows, you can only response in structured JSON format for example
        
    {
        "method": <method_name>,
        "params": [<to_address>, <amount>],
    }
        
    You have to follow the given ABI :
    ${JSON.stringify(abi)}
    `
    }

    let messages = [
        systemInstructions,
        {"role": "user", "content": "I want to mint 100 tokens to 0x1234567890123456789012345678901234567890"}
    ];

    const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
    });

    const reply = response.choices[0].message.content;
    const parsedReply = JSON.parse(reply);

    const iface = new ethers.Interface(abi);
    const data = iface.encodeFunctionData(parsedReply.method, parsedReply.params);
}

main()