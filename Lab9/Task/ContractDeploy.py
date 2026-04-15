from web3 import Web3
from solcx import compile_standard, install_solc
import json

class ContractDeploy:
    def __init__(self, provider_url, private_key):
        self.w3 = Web3(Web3.HTTPProvider(provider_url))
        self.account = self.w3.eth.account.from_key(private_key)
        self.w3.eth.default_account = self.account.address

    def compile_contract(self, file_path):
        install_solc('0.8.17')
        
        with open(file_path, 'r') as file:
            contract_file = file.read()

        compiled_sol = compile_standard({
            "language": "Solidity",
            "sources": {file_path: {"content": contract_file}},
            "settings": {
                "outputSelection": {
                    "*": {"*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]}
                }
            },
        },
        solc_version='0.8.17',
        )

        with open('compiled_code.json', 'w') as file:
            json.dump(compiled_sol, file)

        return compiled_sol

    def deploy_contract(self, contract_name, gas, gas_price):
        with open('compiled_code.json', 'r') as file:
            compiled_sol = json.load(file)

        contract_interface = compiled_sol['contracts'][contract_name]['SimpleStorage']
        bytecode = contract_interface['evm']['bytecode']['object']
        abi = contract_interface['abi']
        contract = self.w3.eth.contract(abi=abi, bytecode=bytecode)

        constructor_txn = contract.constructor().build_transaction({
            'from': self.w3.eth.default_account,
            'nonce': self.w3.eth.get_transaction_count(self.w3.eth.default_account),
            'gas': gas,
            'gasPrice': self.w3.to_wei(gas_price, 'gwei')
        })

        signed_txn = self.w3.eth.account.sign_transaction(constructor_txn, self.account._private_key)
        tx_receipt = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_receipt)
        self.contract_instance = self.w3.eth.contract(
            address=tx_receipt.contractAddress,
            abi=abi
        )
        return tx_receipt.contractAddress

    def call_function(self, function_name, args, gas=200000, gas_price=20000000000):
        tx = getattr(self.contract_instance.functions, function_name)(*args).build_transaction({
            'from': self.w3.eth.default_account,
            'nonce': self.w3.eth.get_transaction_count(self.w3.eth.default_account),
            'gas': gas,
            'gasPrice': self.w3.to_wei(gas_price, 'gwei')
        })

        signed_tx = self.w3.eth.account.sign_transaction(tx, self.account._private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)

    def get_value(self, function_name):
        return self.contract_instance.functions[function_name]().call()
    
    def load_contract(self, contract_address, abi):
        # TODO: Implement load_contract method for loading a contract from an address and ABI
        self.contract_instance = self.w3.eth.contract(
            address=contract_address,
            abi=abi
        )
        return self.contract_instance

if __name__ == "__main__":
    cd = ContractDeploy('https://eth-sepolia.g.alchemy.com/v2/<api_key>', '0x<private_key>')
    cd.compile_contract('py_sol.sol')

    contract_address = cd.deploy_contract('py_sol.sol', 2000000, '50')
    tx_receipt = cd.call_function('set', 123, gas=2000000, gas_price='50')
    print("Transaction receipt:", tx_receipt)
    
    value = cd.get_value('get')
    print("Updated value:", value)
