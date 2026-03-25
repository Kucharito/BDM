import os
import binascii
from mnemonic import Mnemonic
from pycoin.symbols.btc import network
from unittest import TestCase

class Bip39:
    def __init__(self, language='english'):
        self.mnemo = Mnemonic(language)
    
    def generate_seed(self, password=None):
        # pouzit mnemo na generate a na seed
        # mnemonic phrase (128 bits)
        phrase = self.mnemo.generate(strength=128)
        # Optional passphrase
        passphrase = "" if password is None else password
        seed = self.mnemo.to_seed(phrase, passphrase=passphrase)
        return seed, phrase

    def generate_private_key(self, seed):
        wallet = network.keys.bip32_seed(seed)
        return wallet

    def generate_btc_address(self, wallet):
        btc_address = wallet.address()
        return btc_address

    def backup_from_mnemonic(self, phrase, password=None):
        # passphrase uz poznam nemusim generovat
        passphrase = "" if password is None else password
        # Same phrase + same passphrase => same seed => same wallet keys/addresses.
        seed = self.mnemo.to_seed(phrase, passphrase=passphrase)
        return seed

class Bip39Test(TestCase):
    def setUp(self):
        self.bip39 = Bip39()
    
    def test_seed_generation_and_recovery_without_password(self):
        seed, mnemonic_phrase = self.bip39.generate_seed()
        original_wallet = self.bip39.generate_private_key(seed)
        original_address = self.bip39.generate_btc_address(original_wallet)


        recovered_seed = self.bip39.backup_from_mnemonic(mnemonic_phrase)
        recovered_wallet = self.bip39.generate_private_key(recovered_seed)
        recovered_address = self.bip39.generate_btc_address(recovered_wallet)

        self.assertEqual(original_address, recovered_address)

    def test_seed_generation_and_recovery_with_password(self):
        password = "test_password"

        seed, mnemonic_phrase = self.bip39.generate_seed(password=password)
        original_wallet = self.bip39.generate_private_key(seed)
        original_address = self.bip39.generate_btc_address(original_wallet)

        recovered_seed = self.bip39.backup_from_mnemonic(mnemonic_phrase, password=password)
        recovered_wallet = self.bip39.generate_private_key(recovered_seed)
        recovered_address = self.bip39.generate_btc_address(recovered_wallet)

        self.assertEqual(original_address, recovered_address)

if __name__ == "__main__":
    bip39 = Bip39()

    seed, mnemonic_phrase = bip39.generate_seed()
    print(f"Mnemonic phrase: {mnemonic_phrase}")
    print(f"Seed: {seed.hex()}")

    wallet = bip39.generate_private_key(seed)
    print(f"Private key: {wallet}")

    btc_address = bip39.generate_btc_address(wallet)
    print(f"BTC address: {btc_address}")

    backup_seed = bip39.backup_from_mnemonic(mnemonic_phrase)
    print(f"Recover Seed: {backup_seed.hex()}")

