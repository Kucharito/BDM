from io import BytesIO
from random import randint
from unittest import TestCase

from helper import encode_base58_checksum, hash160
from s256point import S256Point

A = 0
B = 7
P = 2**256 - 2**32 - 977
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

G = S256Point(
    0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798,
    0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8,
)

class Signature:
    def __init__(self, r, s):
        self.r = r
        self.s = s

    def __repr__(self):
        return f"Signature({self.r:x},{self.s:x})"

    def der(self):
    #TODO 2: Implement DER signature
        rbinary = self.r.to_bytes(32, byteorder="big")
        r_without_leading_zeros = rbinary.lstrip(b"\x00")
        if r_without_leading_zeros[0] & 0x80:
           r_without_leading_zeros = b"\x00" + r_without_leading_zeros
        
        sbinary = self.s.to_bytes(32, byteorder="big")
        s_without_leading_zeros = sbinary.lstrip(b"\x00")
        if s_without_leading_zeros[0] & 0x80:
            s_without_leading_zeros = b"\x00" + s_without_leading_zeros  
        
        result = b'\x02' + bytes([len(r_without_leading_zeros)])+ r_without_leading_zeros
        result += b'\x02' + bytes([len(s_without_leading_zeros)]) + s_without_leading_zeros
        
        return b'\x30' + bytes([len(result)]) + result
           

    @classmethod
    def parse(cls, signature_bin):
        s = BytesIO(signature_bin)
        compound = s.read(1)[0]

        if compound != 0x30:
            raise RuntimeError("Bad Signature")
        length = s.read(1)[0]

        if length + 2 != len(signature_bin):
            raise RuntimeError("Bad Signature Length")
        marker = s.read(1)[0]

        if marker != 0x02:
            raise RuntimeError("Bad Signature")
        rlength = s.read(1)[0]
        r = int(s.read(rlength).hex(), 16)
        marker = s.read(1)[0]

        if marker != 0x02:
            raise RuntimeError("Bad Signature")
        slength = s.read(1)[0]
        s = int(s.read(slength).hex(), 16)

        if len(signature_bin) != 6 + rlength + slength:
            raise RuntimeError("Signature too long")
        return cls(r, s)


class SignatureTest(TestCase):
    def test_der(self):
        testcases = (
            (1, 2),
            (randint(0, 2**256), randint(0, 2**255)),
            (randint(0, 2**256), randint(0, 2**255)),
        )
        for r, s in testcases:
            sig = Signature(r, s)
            der = sig.der()
            sig2 = Signature.parse(der)
            self.assertEqual(sig2.r, r)
            self.assertEqual(sig2.s, s)