import { ethers } from "ethers";
import { agentDetails } from "./agentdetails";
import { txBuilder } from "./txbuilder";

export async function sendPrompt(contractImage: string, prompt: string) {

    //0xe3fc9d71f20e64b9c88a46b419401061642a0078a8a70fe7b3259646026b1933

    const agent = await agentDetails(contractImage);
    const txObject = await txBuilder(contractImage, prompt);
    const baseProvider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const holeskyProvider = new ethers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/0fxbpb4OCXkkyHhFNPBRelJsFg7XdhML');

    let address;
    const {calldata,network} = txObject;
    if(network === 'base'){
        const wallet = new ethers.Wallet(process.env.AGENT_KEY, baseProvider);

        address = agent.deployments[0].address;
        const rawTx = {
            to: address,
            data: calldata
        }
        const tx = await wallet.sendTransaction(rawTx);
        await tx.wait();
        console.log('Transaction sent');
        return tx.hash;
    }else{
        const wallet = new ethers.Wallet(process.env.AGENT_KEY, holeskyProvider);

        address = agent.deployments[1].address;
        const rawTx = {
            to: address,
            data: calldata
        }

        const tx = await wallet.sendTransaction(rawTx);
        await tx.wait();
        console.log('Transaction sent');
        return tx.hash;
    }
}
