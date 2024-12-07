export function generateLitActionCode(messages) {

    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const apiKey = process.env.OPENAI_API_KEY;
    const model = "gpt-3.5-turbo";
    const messagesJSON = JSON.stringify(messages).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `
            (async () => {
            const go = async () => {  
                const url = "${apiUrl}";
                const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ${apiKey}'
                },
                body: JSON.stringify({
                    model: "${model}",
                    messages: ${messagesJSON}
                })
                }).then((response) => response.json());

                const data = resp; // Process the response as needed
                console.log(data);

                LitActions.setResponse({ response: JSON.stringify(data) });
            };

            go();
            })();
    `.trim();
}