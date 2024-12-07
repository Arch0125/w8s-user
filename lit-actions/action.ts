import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LIT_NETWORK, LIT_ABILITY } from "@lit-protocol/constants";
import {
    createSiweMessageWithRecaps,
    generateAuthSig,
    LitActionResource,
} from "@lit-protocol/auth-helpers";
import { ethers } from "ethers";
import { generateLitActionCode } from "./generate";


export async function executeLitAction(messages) {
    const ethersSigner = new ethers.Wallet(
        process.env.AGENT_KEY,
        new ethers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const litNodeClient = new LitNodeClient({
        litNetwork: LIT_NETWORK.DatilDev,
        debug: false,
    });
    await litNodeClient.connect();

    const sessionSigs = await litNodeClient.getSessionSigs({
        chain: "ethereum",
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
        resourceAbilityRequests: [
            {
                resource: new LitActionResource("*"),
                ability: LIT_ABILITY.LitActionExecution,
            },
        ],
        authNeededCallback: async ({
            resourceAbilityRequests,
            expiration,
            uri,
        }) => {
            const toSign = await createSiweMessageWithRecaps({
                uri: uri!,
                expiration: expiration!,
                resources: resourceAbilityRequests!,
                walletAddress: ethersSigner.address,
                nonce: await litNodeClient.getLatestBlockhash(),
                litNodeClient,
            });

            return await generateAuthSig({
                signer: ethersSigner,
                toSign,
            });
        },
    });

    const messagesJSON = JSON.stringify(messages);

    const litActionCode = `
(async () => {
  const go = async () => {  
    const url = "https://api.openai.com/v1/chat/completions";
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${process.env.OPENAI_API_KEY}'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: ${messagesJSON}
      })
    }).then((response) => response.json());

    const data = resp; // Process the response as needed
    console.log(data);

    LitActions.setResponse({ response: JSON.stringify({data:data}) });
  };

  go();
})();
`;

    const res = await litNodeClient.executeJs({
        sessionSigs,
        code: litActionCode,
    });
    await litNodeClient.disconnect().finally(() => {
        console.log("✅ Executed by Lit network");
    });

    const parsedRes = JSON.parse(res.response);
    const assistantResponse = parsedRes.data.choices[0].message.content;
    return assistantResponse;

}