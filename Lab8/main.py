from web3 import Web3
from config import Config
from wallet import Wallet
from ethereum import Ethereum

# Load config
mainnet_url = "https://eth-mainnet.g.alchemy.com/v2/FsOprppQezxHY63lyNN46"
sepolia_url = "https://eth-sepolia.g.alchemy.com/v2/FsOprppQezxHY63lyNN46"
private_key = "0xb1f80f9e1da9ffd0a4fa27e2a035eb5a7e1329c2f0b605f1887e15abfb1cefcd"
config = Config(default_alchemy_url_mainnet=mainnet_url, 
                default_alchemy_url_sepolia=sepolia_url, 
                default_private_key=private_key)

# Create instances of Ethereum and Wallet
eth = Ethereum(config.alchemy_url_sepolia)
wallet = Wallet(config.alchemy_url_sepolia, config.private_key)

# Get current block number
block_number = eth.get_current_block_number()
print(f"Current block number: {block_number}")

# Get block info
block_info = eth.get_block_info()
print(f"Block info: {block_info}")

# Get balance
balance = wallet.get_balance()
print(f"Balance: {balance} ETH")

# Send transaction
tx_hash = wallet.send_transaction("0xCa454D486aA190a06cceF1398F7e5A97958DbF", 0.01)
print(f"Transaction hash: {tx_hash}")

tx_details = eth.get_transaction_details(tx_hash)
print(f"Transaction details: {tx_details}")



