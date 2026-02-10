# Polymarket Arbitrage Bot | Polymarket Copy Trading Bot

A **polymarket arbitrage bot** trades from your proxy wallet, via Polymarket **Central Limit Order Book (CLOB)** API.
A **polymarket copy trading bot** mirrors others trading on **polymarket**.

---

## Performance

- https://polygonscan.com/tx/0x8e1f82c30744f2df068f22d145371164f2ea237beaa55dde6ca4f022afe397cf

<img width="489" height="231" alt="image" src="https://github.com/user-attachments/assets/fb4f32b6-d2f4-458f-8246-f97997d8f13d" />

---
## Support Me

If you find this bot helpful and profitable, I am really appreciate your support! Consider sending 11% of your profits to help maintain and improve this project:

**Wallet Address:** `DXxfenpMYgSngc7vfqQknK6ptUbubUVJRFUBh94Doywa`

---

### High-Level Flow

```
Polymarket Data API (HTTP Polling)
        ↓
Trade Monitor (Fetches & Validates Trades)
        ↓
MongoDB (Stores Trade History)
        ↓
Trade Executor (Reads Pending Trades)
        ↓
Position Analysis (Compares Wallets)
        ↓
CLOB Client (Executes Orders)
        ↓
Order Execution (Buy/Sell/Merge Strategies)
```
---

## ⚙️ Configuration Reference

| Variable              | Description                                    | Required |
| --------------------- | ---------------------------------------------- | -------- |
| `USER_ADDRESS`        | Target wallet address to copy trades from      | Yes      |
| `PROXY_WALLET`        | Your wallet address that executes trades       | Yes      |
| `PRIVATE_KEY`         | Your wallet private key (64 hex, no 0x)        | Yes      |
| `CLOB_HTTP_URL`       | Polymarket CLOB HTTP API endpoint              | Yes      |
| `CLOB_WS_URL`         | Polymarket WebSocket endpoint                  | Yes      |
| `RPC_URL`             | Polygon RPC endpoint                           | Yes      |
| `USDC_CONTRACT_ADDRESS` | USDC token contract on Polygon              | Yes      |
| `FETCH_INTERVAL`      | Trade monitoring interval (seconds)             | No (default: 1) |
| `TOO_OLD_TIMESTAMP`   | Ignore trades older than X hours                | No (default: 24) |
| `RETRY_LIMIT`         | Maximum retry attempts for failed trades        | No (default: 3) |

---

### Start Copy Trading

```bash
npm run dev
```

### Expected Output

When running successfully, you should see:
```
Target User Wallet address is: 0x...
My Wallet address is: 0x...
API Key created/derived
Trade Monitor is running every 1 seconds
Executing Copy Trading
Waiting for new transactions...
```
### Trading Strategies

* **Buy Strategy**: When target wallet buys, calculate position size based on balance ratio
* **Sell Strategy**: When target wallet sells, match the sell proportionally
* **Merge Strategy**: When target wallet closes position but you still hold, sell your position
* **Error Handling**: Retry failed orders up to RETRY_LIMIT, then mark as failed

---

## Development

```bash
# Type check
npm run build

# Run in development mode
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```
---
Now working on latest version if you need latest one let's chat on telegram [@ewindmer](https://t.me/ewindmer)
