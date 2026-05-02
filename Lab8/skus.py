from web3 import Web3

addr = "0xCa454D486aA190a06cceF1398F7e5A97958DbF"

print("is_address:", Web3.is_address(addr))
if Web3.is_address(addr):
    print("checksum:", Web3.to_checksum_address(addr))
else:
    print("Adresa nie je platná.")