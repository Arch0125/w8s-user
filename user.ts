import { txBuilder } from "./txbuilder";

async function main() {
    const agent = await txBuilder('0x50bf4140b839544e3d41f7f02dc5a9365ef55b2a7d1cdacaaf1e5607554b0912', 'i want to mint 100 tokens to 0x1234567890123456789012345678901234567890');

    console.log(agent);
}

main();