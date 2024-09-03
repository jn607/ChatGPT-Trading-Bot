const Alpaca = require("@alpacahq/alpaca-trade-api") // this require method means we don't have to actively call the alpaca crednetials we made in our .env fie. Pretty neat.
const alpaca = new Alpaca(); // Env variables
const WebSocket = require('ws');

// Websockets
// Server < -- > Data Source
// Communication can go both ways
// Data source can send us info
// Send data to the data source (Authenticate, ask what data we want.)

// WebSockets are like push notifications on your phone
// Whenever an event happens you get a notification.

const wss = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/news")

wss.on('open', function()
{
    console.log("Websocket connected!");

    // We now have to log into the data source
    const authMsg = {
        action: 'auth',
        key: process.env.APCA_API_KEY_ID,
        secret: process.env.APCA_API_SECRET_KEY
    };
    wss.send(JSON.stringify(authMsg)); // Send auth data to ws. "log us in"

    // Subscribe to all news feeds
    const subscribeMsg = {
        action: 'subscribe',
        news: ["*"] // This gets all news, but you can specify certain tickers like ["TSLA"]
    };
    wss.send(JSON.stringify(subscribeMsg)); // Connecting us to the live data source of news
})

wss.on('message', async function(message) { // asynchronous function as we are calling other APIs inside this logic
    console.log("Message is " + message);
    // message always is a string.
    const currentEvent = JSON.parse(message)[0]; //parse entire news alert, and get the first thing [0] (the headline)
    if(currentEvent.T === "n") {     // Note: if "T": "n" then this is a news event
        //Ask ChatGPT its thoughts on the headline
        const apiRequestBody = {
            "model": "gpt-4o",
            "messages": [
                { role: "system", content: "Only respond with a number from -1 to 1 detailing the sentiment score of the headline."}, // How ChatGPT should talk to us.
                { role: "user", content: "Given the headline '" + currentEvent.headline + "', show me a number from -1 to 1 detailing the sentiment of this headline."}
            ]
        }

        await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
                "Content-Type": "application.json"
            },
            body: JSON.stringify(apiRequestBody)
        }).then((data) => {
            return data.json();
        }).then((data) => {
            // data is the ChatGPT response
            console.log(data);
            console.log(data.choices[0].message);
            companyImpact = parseInt(data.choices[0].message.content); // changing the score from string to int
        });

        // Make trades based on the output (of the impact saved in companyImpact)
        const tickerSymbol = currentEvent.symbols[0];

        // 1 - 100, 1 being the most negative, 100 being the most positive impact on a company.
        if(companyImpact >= 70) { // if score >= 70 : BUY STOCK
            // Buy stock
            let order = await alpaca.createOrder({
                symbol: tickerSymbol,
                qty: 1, // qty of stock
                side: 'buy',
                type: 'market',
                time_in_force: 'day' // day ends, it wont trade.
            });
        } else if (companyImpact <= 30) { // else if impact <= 30: SELL ALL OF STOCK
            // Sell stock
            let closedPosition = alpaca.closePosition(tickerSymbol); //(tickerSymbol);
        }
        
    }
});