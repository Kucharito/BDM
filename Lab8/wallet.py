from web3 import Web3
from ethereum import Ethereum

class Wallet(Ethereum):
    def __init__(self, web3_provider_url, private_key):
        super().__init__(web3_provider_url)
        # TODO 5: Initialize account using private key
        self.account = self.web3.eth.account.from_key(private_key)

    def get_balance(self):
        balance = self.web3.eth.get_balance(self.account.address)
        return self.web3.from_wei(balance, 'ether')

    def send_transaction(self, to_address, value, gas=21000, gas_price=50):
        # TODO 6: Send transaction and return transaction hash
        if not self.web3.is_address(to_address):
            raise ValueError("Invalid recipient address format.")

        nonce = self.web3.eth.get_transaction_count(self.account.address, "pending")
        tx = {
            "nonce": nonce,
            "to": Web3.to_checksum_address(to_address),
            "value": self.web3.to_wei(value, 'ether'),
            "gas": gas,
            "gasPrice": self.web3.to_wei(gas_price, 'gwei'),
            "chainId": self.web3.eth.chain_id,
        }

        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return tx_hash.hex()
