# Creating a trading bot using Alpaca API and OpenAI API.

### System step-by-step
1. Receive a news event
2. GET the headline of the news event.
3. Ask ChatGPT what it thinks of a certain headline.
4. Implement trading logic e.g give headline a score 1-100 and buy or sell depending on what the score is.
5. Optimise.

### Improvements to make
Composite Sentiment Score: The bot now calculates a moving average of sentiment scores, making the sentiment signal more robust.

Volume and Trend Confirmation: Before making a trade, the bot confirms that the volume is above average and the price movement supports the sentiment.

ATR-Based Stop-Loss: A stop-loss order is dynamically placed using the ATR, which adapts to current volatility.

Improved Logging: The bot logs trades and sentiment scores to give us visibility into its decisions, which is useful for debugging and strategy refinement.
=======
We will be using Alpaca API to get the news events and OpenAI API to connect to ChatGPT.
<img width="353" alt="image" src="https://github.com/user-attachments/assets/13505bda-024c-4ce0-9089-d86b1f1a7863">

