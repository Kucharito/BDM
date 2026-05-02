from web3 import Web3

class Ethereum:
    def __init__(self, web3_provider_url):
        # TODO 1: Initialize Web3 instance
        self.web3 = Web3(Web3.HTTPProvider(web3_provider_url))
        
        if not self.web3.is_connected():
            raise Exception("Nepodařilo se připojit k Ethereum síti.")

    def get_block_info(self, block_number='latest'):
        # TODO 2: Get block info
        return self.web3.eth.get_block(block_number)

    def get_transaction_details(self, transaction_hash):
        # TODO 3: Get transaction details
        return self.web3.eth.get_transaction(transaction_hash)

    def get_current_block_number(self):
        # TODO 4: Get current block number
        return self.web3.eth.block_number
