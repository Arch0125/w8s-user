import { EAS, NO_EXPIRATION, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export async function agentDetails(uid: string) {
    const eas = new EAS('0x4200000000000000000000000000000000000021');
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    eas.connect(provider);

    const attestation = await eas.getAttestation(uid);

    const schemaEncoder = new SchemaEncoder("string coverage,string assertions,string deployments,string contractblobid,string abiblobid");

    const data = schemaEncoder.decodeData(attestation.data);

    const coverage = data[0].value.value

    const assertions = data[1].value.value

    const deployments = data[2].value.value

    const abiblobid = data[4].value.value

    const contractblobid = data[3].value.value

    return { deployments:JSON.parse(deployments), abiblobid, contractblobid, coverage, assertions };
}

export async function complainDetails(uid: string) {
    const eas = new EAS('0x4200000000000000000000000000000000000021');
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    eas.connect(provider);

    const attestation = await eas.getAttestation(uid);

    const schemaEncoder = new SchemaEncoder("string type,string description,string[] method,address poster");

    const data = schemaEncoder.decodeData(attestation.data);

    return {description: data[1].value.value, method: data[2].value.value};
}
