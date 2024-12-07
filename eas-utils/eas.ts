import {
    EAS,
    NO_EXPIRATION,
    SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export async function createAttestation(type, description, method, contractAddress) {
    const eas = new EAS('0x4200000000000000000000000000000000000021');
    const provider = ethers.getDefaultProvider("https://sepolia.base.org");
    const signer = new ethers.Wallet(process.env.AGENT_KEY, provider);
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaUID = "0x94bf3b0d6d2af684e1324d190f31a1eb62a5e17a97f7463ebb0d99687b2c217a";

    const schemaEncoder = new SchemaEncoder("string type,string description,string[] method,address poster");
    const encodedData = schemaEncoder.encodeData([
        { name: "type", value: type, type: "string" },
	{ name: "description", value: description, type: "string" },
	{ name: "method", value: method, type: "string[]" },
	{ name: "poster", value: signer.address, type: "address" }
    ]);
    const tx = await eas.attest({
        schema: schemaUID,
        data: {
            recipient: contractAddress,
            expirationTime: NO_EXPIRATION,
            revocable: false, // Be aware that if your schema is not revocable, this MUST be false
            data: encodedData,
        },
    });
    const newAttestationUID = await tx.wait();

    return newAttestationUID;
}