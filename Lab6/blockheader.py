from hashlib import sha256
import threading
import multiprocessing
import unittest

class BlockHeader:
    def __init__(self, version, prev_hash, merkle_root, ntime, nbits, nonce, mode='threading'):
        self.version = version
        self.prev_hash = prev_hash
        self.merkle_root = merkle_root
        self.ntime = ntime
        self.nbits = nbits
        self.nonce = nonce

        if mode == 'threading':
            self.lock = threading.Lock()
        elif mode == 'multiprocessing':
            self.lock = multiprocessing.Lock()
        else:
            raise ValueError("Invalid mode. Choose 'threading' or 'multiprocessing'.")

    def hash(self):
        # TODO 1: Serialize the block header and hash it
        version_bytes = self.version.to_bytes(4, byteorder='little')
        prev_hash_bytes = bytes.fromhex(self.prev_hash)[::-1]  
        merkle_root = bytes.fromhex(self.merkle_root)[::-1] 
        ntime_bytes = self.ntime.to_bytes(4, byteorder='little')
        nbits_bytes = self.nbits.to_bytes(4, byteorder='little')
        nonce_bytes = self.nonce.to_bytes(4, byteorder='little')
        
        header = version_bytes + prev_hash_bytes + merkle_root + ntime_bytes + nbits_bytes + nonce_bytes
        hash_result = sha256(sha256(header).digest()).digest()[::-1].hex() 
        return hash_result
        
        

class TestBlockHeaderHash(unittest.TestCase):
    def test_block_hash_generation(self):
        block_hdr = BlockHeader(
            version=0x20800000,
            prev_hash="00000000000000000000b70be3652e4396ecacbc7a37aa2931343d7ee86bd82c",
            merkle_root="6137b61d88a19e5bdca7b0edc2e343c814ef18bce81931357ecbc9133a3154eb",
            ntime=1707755784,
            nbits=0x1703ba5d,
            nonce=2964565117,
            mode='threading'  # nebo 'multiprocessing' dle potřeby
        )

        expected_hash = "000000000000000000025879c120878cd817342b778fb23071f8f83a4c61e61d"
        self.assertEqual(block_hdr.hash(), expected_hash)
