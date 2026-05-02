# MAX Router - Solana DEX Aggregator

## Features
- 0.01% platform fee
- Swap any Solana token
- Developer API keys

## Deploy Smart Contract

```bash
anchor build
anchor deploy
API Endpoints
Endpoint	Method	Description
/api/max/v1/developers	POST	Get API key
/api/max/v1/quote	GET	Get swap quote
/api/max/v1/swap	POST	Execute swap
/api/max/v1/keys	GET	List API keys
Environment Variables
Add to Cloudflare Pages:

DEVELOPERS_KV - KV namespace for developers

API_KEYS_KV - KV namespace for API keys
