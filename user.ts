import { txBuilder } from "./txbuilder";

async function main() {
    const agent = await txBuilder('0xe3fc9d71f20e64b9c88a46b419401061642a0078a8a70fe7b3259646026b1933', 'i want to mint 100 tokens to 0x1234567890123456789012345678901234567890');

    console.log(agent);
}

main();