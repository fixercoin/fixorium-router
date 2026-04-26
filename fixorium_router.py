# fixorium_router.py - Fixorium DEX Router API
# Brand: Fixorium | Domain: https://fixorium.com.pk
# Fees: 0.01% | Compete with Jupiter

from flask import Flask, request, jsonify
from flask_cors import CORS
from solana.rpc.api import Client
from solders.pubkey import Pubkey
import requests
import time

app = Flask(__name__)
CORS(app)

# ============================================
# FIXORIUM CONFIGURATION
# ============================================
FIXORIUM_FEE_BPS = 1  # 0.01% fee (1 basis point)
FIXORIUM_FEE_RECIPIENT = "FixoriumFee111111111111111111111111111111111"
FIXORIUM_VERSION = "1.0.0"
FIXORIUM_DOMAIN = "https://fixorium.com.pk"

RPC_URL = "https://api.mainnet-beta.solana.com"
client = Client(RPC_URL)

# Supported DEXes
DEXES = {
    "raydium": {
        "name": "Raydium",
        "program_id": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        "fee_bps": 25,
        "api": "https://api.raydium.io/v2/main/quote"
    },
    "orca": {
        "name": "Orca",
        "program_id": "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",
        "fee_bps": 20,
        "api": "https://api.orca.so/quote"
    },
    "meteora": {
        "name": "Meteora",
        "program_id": "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
        "fee_bps": 15,
        "api": "https://dlmm-api.meteora.ag/quote"
    }
}

# Token Registry
TOKENS = {
    "SOL": {
        "mint": "So11111111111111111111111111111111111111112",
        "decimals": 9,
        "name": "Solana",
        "logo": f"{FIXORIUM_DOMAIN}/tokens/sol.png"
    },
    "USDC": {
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "decimals": 6,
        "name": "USD Coin",
        "logo": f"{FIXORIUM_DOMAIN}/tokens/usdc.png"
    },
    "USDT": {
        "mint": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        "decimals": 6,
        "name": "Tether",
        "logo": f"{FIXORIUM_DOMAIN}/tokens/usdt.png"
    },
    "BONK": {
        "mint": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "decimals": 5,
        "name": "Bonk",
        "logo": f"{FIXORIUM_DOMAIN}/tokens/bonk.png"
    },
    "WIF": {
        "mint": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "decimals": 6,
        "name": "dogwifhat",
        "logo": f"{FIXORIUM_DOMAIN}/tokens/wif.png"
    }
}

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/')
def home():
    return jsonify({
        "brand": "Fixorium",
        "name": "Fixorium DEX Router",
        "domain": FIXORIUM_DOMAIN,
        "version": FIXORIUM_VERSION,
        "tagline": "The fastest routes. The lowest fees. 0.01%",
        "fee": "0.01%",
        "endpoints": {
            "quote": "/quote?from=SOL&to=USDC&amount=1",
            "routes": "/routes?from=SOL&to=USDC&amount=1000",
            "tokens": "/tokens",
            "dexes": "/dexes",
            "health": "/health"
        },
        "documentation": f"{FIXORIUM_DOMAIN}/docs",
        "github": "https://github.com/fixercoin/fixorium-router"
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "brand": "Fixorium",
        "domain": FIXORIUM_DOMAIN,
        "fee": f"{FIXORIUM_FEE_BPS / 100}%",
        "dexes": list(DEXES.keys())
    })

@app.route('/tokens')
def tokens():
    return jsonify(TOKENS)

@app.route('/dexes')
def dexes():
    return jsonify(DEXES)

@app.route('/quote')
def quote():
    """Main API endpoint - Get best swap quote"""
    from_token = request.args.get('from', 'SOL')
    to_token = request.args.get('to', 'USDC')
    amount = float(request.args.get('amount', 1))
    slippage = float(request.args.get('slippage', 0.5))
    
    if from_token not in TOKENS or to_token not in TOKENS:
        return jsonify({"error": "Invalid token", "success": False}), 400
    
    # Get quotes from all DEXes
    quotes = []
    
    # Raydium quote
    raydium_quote = get_raydium_quote(TOKENS[from_token]['mint'], TOKENS[to_token]['mint'], amount)
    if raydium_quote:
        raydium_quote['fixorium_fee'] = calculate_fee(amount)
        quotes.append(raydium_quote)
    
    # Orca quote
    orca_quote = get_orca_quote(TOKENS[from_token]['mint'], TOKENS[to_token]['mint'], amount)
    if orca_quote:
        orca_quote['fixorium_fee'] = calculate_fee(amount)
        quotes.append(orca_quote)
    
    # Meteora quote
    meteora_quote = get_meteora_quote(TOKENS[from_token]['mint'], TOKENS[to_token]['mint'], amount)
    if meteora_quote:
        meteora_quote['fixorium_fee'] = calculate_fee(amount)
        quotes.append(meteora_quote)
    
    if not quotes:
        return jsonify({"error": "No routes found", "success": False}), 404
    
    # Find best quote (after Fixorium fee)
    best = max(quotes, key=lambda x: x['output_amount'] - x['fixorium_fee']['amount_usd'])
    
    # Calculate split route for better price
    split_route = calculate_split_route(quotes, amount)
    
    return jsonify({
        "success": True,
        "brand": "Fixorium",
        "from": from_token,
        "to": to_token,
        "amount": amount,
        "slippage_bps": int(slippage * 100),
        "fixorium_fee_percent": f"{FIXORIUM_FEE_BPS / 100}%",
        "best_route": best,
        "split_route": split_route,
        "all_routes": quotes,
        "timestamp": int(time.time())
    })

@app.route('/routes')
def routes():
    """Get all possible routes between tokens"""
    from_token = request.args.get('from', 'SOL')
    to_token = request.args.get('to', 'USDC')
    amount = float(request.args.get('amount', 1000))
    
    direct_routes = []
    
    for dex_name in DEXES:
        quote = get_quote_from_dex(dex_name, TOKENS[from_token]['mint'], TOKENS[to_token]['mint'], amount)
        if quote:
            direct_routes.append(quote)
    
    # Multi-hop routes
    multi_hop_routes = []
    for intermediate in TOKENS:
        if intermediate == from_token or intermediate == to_token:
            continue
        
        hop1 = get_best_quote(TOKENS[from_token]['mint'], TOKENS[intermediate]['mint'], amount / 2)
        hop2 = get_best_quote(TOKENS[intermediate]['mint'], TOKENS[to_token]['mint'], amount / 2)
        
        if hop1 and hop2:
            multi_hop_routes.append({
                "type": "multi-hop",
                "brand": "Fixorium",
                "path": [from_token, intermediate, to_token],
                "hops": [hop1, hop2],
                "total_output": hop2['output_amount'],
                "total_fee": hop1.get('fee', 0) + hop2.get('fee', 0) + (amount * FIXORIUM_FEE_BPS / 10000),
                "fixorium_fee": calculate_fee(amount)
            })
    
    return jsonify({
        "success": True,
        "brand": "Fixorium",
        "from": from_token,
        "to": to_token,
        "amount": amount,
        "fixorium_fee_percent": f"{FIXORIUM_FEE_BPS / 100}%",
        "direct_routes": direct_routes,
        "multi_hop_routes": multi_hop_routes,
        "best_route": max(direct_routes, key=lambda x: x['output_amount']) if direct_routes else None
    })

@app.route('/stats')
def stats():
    """Get Fixorium router statistics"""
    return jsonify({
        "brand": "Fixorium",
        "domain": FIXORIUM_DOMAIN,
        "fee": f"{FIXORIUM_FEE_BPS / 100}%",
        "supported_dexes": len(DEXES),
        "supported_tokens": len(TOKENS),
        "version": FIXORIUM_VERSION,
        "compared_to_jupiter": "0.01% vs 0.1% (10x cheaper)"
    })

# ============================================
# HELPER FUNCTIONS
# ============================================

def calculate_fee(amount: float) -> dict:
    """Calculate Fixorium fee (0.01%)"""
    fee_amount = amount * (FIXORIUM_FEE_BPS / 10000)
    return {
        "percent": f"{FIXORIUM_FEE_BPS / 100}%",
        "amount": fee_amount,
        "recipient": FIXORIUM_FEE_RECIPIENT,
        "saved_vs_jupiter": amount * 0.0009  # Jupiter charges 0.1%
    }

def get_raydium_quote(input_mint: str, output_mint: str, amount: float) -> dict:
    """Get quote from Raydium"""
    try:
        amount_lamports = int(amount * 1e9)
        response = requests.get(
            "https://api.raydium.io/v2/main/quote",
            params={
                "inputMint": input_mint,
                "outputMint": output_mint,
                "amount": amount_lamports,
                "slippage": 0.5
            },
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return {
                "dex": "raydium",
                "dex_name": "Raydium",
                "input_amount": amount,
                "output_amount": data.get("outputAmount", 0) / 1e9,
                "price": data.get("price", 0),
                "price_impact": data.get("priceImpact", 0),
                "dex_fee": 0.0025,
                "route": [input_mint, output_mint]
            }
    except:
        pass
    return None

def get_orca_quote(input_mint: str, output_mint: str, amount: float) -> dict:
    """Get quote from Orca"""
    try:
        response = requests.get(
            "https://api.orca.so/quote",
            params={
                "inputMint": input_mint,
                "outputMint": output_mint,
                "amount": amount,
                "slippage": 0.5
            },
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return {
                "dex": "orca",
                "dex_name": "Orca",
                "input_amount": amount,
                "output_amount": data.get("outputAmount", 0),
                "price": data.get("price", 0),
                "price_impact": data.get("priceImpact", 0),
                "dex_fee": 0.002,
                "route": [input_mint, output_mint]
            }
    except:
        pass
    return None

def get_meteora_quote(input_mint: str, output_mint: str, amount: float) -> dict:
    """Get quote from Meteora"""
    try:
        response = requests.get(
            "https://dlmm-api.meteora.ag/quote",
            params={
                "mintA": input_mint,
                "mintB": output_mint,
                "amountA": amount,
                "slippageBps": 50
            },
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return {
                "dex": "meteora",
                "dex_name": "Meteora",
                "input_amount": amount,
                "output_amount": data.get("amountB", 0),
                "price": data.get("price", 0),
                "dex_fee": 0.0015,
                "route": [input_mint, output_mint]
            }
    except:
        pass
    return None

def get_quote_from_dex(dex_name: str, input_mint: str, output_mint: str, amount: float) -> dict:
    """Generic quote function"""
    if dex_name == "raydium":
        return get_raydium_quote(input_mint, output_mint, amount)
    elif dex_name == "orca":
        return get_orca_quote(input_mint, output_mint, amount)
    elif dex_name == "meteora":
        return get_meteora_quote(input_mint, output_mint, amount)
    return None

def get_best_quote(input_mint: str, output_mint: str, amount: float) -> dict:
    """Get best quote across all DEXes"""
    quotes = []
    for dex_name in DEXES:
        quote = get_quote_from_dex(dex_name, input_mint, output_mint, amount)
        if quote:
            quotes.append(quote)
    if quotes:
        return max(quotes, key=lambda x: x['output_amount'])
    return None

def calculate_split_route(quotes: list, total_amount: float) -> dict:
    """Calculate optimal split across DEXes"""
    if len(quotes) < 2:
        return None
    
    best_output = 0
    best_split = None
    
    for split_ratio in [0.25, 0.5, 0.75]:
        amount1 = total_amount * split_ratio
        amount2 = total_amount * (1 - split_ratio)
        
        output1 = quotes[0]['output_amount'] * (amount1 / quotes[0]['input_amount'])
        output2 = quotes[1]['output_amount'] * (amount2 / quotes[1]['input_amount'])
        total_output = output1 + output2
        
        if total_output > best_output:
            best_output = total_output
            best_split = {
                "type": "split",
                "brand": "Fixorium",
                "routes": [
                    {"dex": quotes[0]['dex'], "amount": amount1, "output": output1},
                    {"dex": quotes[1]['dex'], "amount": amount2, "output": output2}
                ],
                "total_output": best_output,
                "fixorium_fee": calculate_fee(total_amount),
                "improvement_vs_best": ((best_output / max([q['output_amount'] for q in quotes])) - 1) * 100
            }
    
    return best_split

# ============================================
# START SERVER
# ============================================
start_time = time.time()

if __name__ == '__main__':
    print("=" * 60)
    print("🦊 FIXORIUM DEX ROUTER API")
    print("=" * 60)
    print(f"   Domain: {FIXORIUM_DOMAIN}")
    print(f"   Fee: {FIXORIUM_FEE_BPS / 100}% (10x cheaper than Jupiter)")
    print(f"   Version: {FIXORIUM_VERSION}")
    print("\n✅ API Endpoints:")
    print(f"   GET {FIXORIUM_DOMAIN}/tokens")
    print(f"   GET {FIXORIUM_DOMAIN}/quote?from=SOL&to=USDC&amount=1")
    print(f"   GET {FIXORIUM_DOMAIN}/routes?from=SOL&to=USDC&amount=1000")
    print("\n📡 Server running on http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
