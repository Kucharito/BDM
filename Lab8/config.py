import os
from dotenv import load_dotenv


load_dotenv()

class Config:
    def __init__(self, default_alchemy_url_mainnet=None,
                 default_alchemy_url_sepolia=None,
                 default_private_key=None):
        
        if default_alchemy_url_mainnet is None and os.getenv('ALCHEMY_URL_MAINNET') is None:
            raise ValueError("Missing ALCHEMY_URL_MAINNET (set env var or pass default_alchemy_url_mainnet).")
        if default_alchemy_url_sepolia is None and os.getenv('ALCHEMY_URL_SEPOLIA') is None:
            raise ValueError("Missing ALCHEMY_URL_SEPOLIA (set env var or pass default_alchemy_url_sepolia).")
        if default_private_key is None and os.getenv('PRIVATE_KEY') is None:
            raise ValueError("Missing PRIVATE_KEY (set env var or pass default_private_key).")

        self._alchemy_url_mainnet = os.getenv('ALCHEMY_URL_MAINNET', default_alchemy_url_mainnet)
        self._alchemy_url_sepolia = os.getenv('ALCHEMY_URL_SEPOLIA', default_alchemy_url_sepolia)
        self._private_key = os.getenv('PRIVATE_KEY', default_private_key)

    @property
    def alchemy_url_mainnet(self):
        return self._alchemy_url_mainnet

    @property
    def alchemy_url_sepolia(self):
        return self._alchemy_url_sepolia
    
    @property
    def private_key(self):
        return self._private_key
