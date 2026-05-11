const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

async function rpc(method: string, params: any[]) {
  const res = await fetch(HELIUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

export async function getTokenMetadata(mint: string) {
  return rpc('getAsset', [mint]);
}

export async function getTopHolders(mint: string) {
  return rpc('getTokenLargestAccounts', [mint]);
}

export async function getTokenSupply(mint: string) {
  return rpc('getTokenSupply', [mint]);
}

export async function getSignatures(address: string) {
  return rpc('getSignaturesForAddress', [address, { limit: 1000 }]);
}
