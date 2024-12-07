import {
    EAS,
    NO_EXPIRATION,
    SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export async function createAttestation(contractaddress, contractbytecode, executiontrace, result) {
    const eas = new EAS('0x4200000000000000000000000000000000000021');
    const provider = ethers.getDefaultProvider("https://sepolia.base.org");
    const signer = new ethers.Wallet(process.env.AGENT_KEY, provider);
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("address agentaddress,address contractaddress,bytes contractbytecode,bytes executiontrace,bool result");
    const encodedData = schemaEncoder.encodeData([
        { name: "agentaddress", value: signer.address, type: "address" },
        { name: "contractaddress", value: contractaddress, type: "address" },
        { name: "contractbytecode", value: '0x', type: "bytes" },
        { name: "executiontrace", value: '0x', type: "bytes" },
        { name: "result", value: result, type: "bool" },
    ]);

    const schemaUID =
        "0x8f0396aa744e96feb3f35b5539c4f4c37daedd11c741a8b58aae4ae58f8e1a90";

    const transaction = await eas.multiAttest([
        {
            schema: schemaUID,
            data: [
                {
                    recipient: signer.address,
                    expirationTime: NO_EXPIRATION,
                    revocable: false, 
                    data: encodedData,
                }
            ],
        },
    ]);

    const newAttestationUID = await transaction.wait();

    return newAttestationUID;
}