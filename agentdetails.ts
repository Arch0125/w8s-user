import { EAS, NO_EXPIRATION, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export async function agentDetails(uid: string) {
    const eas = new EAS('0x4200000000000000000000000000000000000021');
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    eas.connect(provider);

    const attestation = await eas.getAttestation(uid);

    const schemaEncoder = new SchemaEncoder("string coverage,string assertions,string deployments,string contractblobid,string abiblobid");

    const data = schemaEncoder.decodeData(attestation.data);


    const deployments = data[2].value.value

    const abiblobid = data[4].value.value

    return { deployments:JSON.parse(deployments), abiblobid };
}
