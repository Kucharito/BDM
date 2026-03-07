from unittest import TestCase

class Point:
    def __init__(self, x, y, a, b):
        self.a = a
        self.b = b
        self.x = x
        self.y = y

        if self.x is None and self.y is None:
            return

        if self.y**2 != self.x**3 + a * x + b:
            raise ValueError(f"({self.x}, {self.y}) is not on the curve")

    def __eq__(self, other):
        return (
            self.x == other.x
            and self.y == other.y
            and self.a == other.a
            and self.b == other.b
        )

    def __ne__(self, other):
        return not (self == other)

    def __repr__(self):
        if self.x is None:
            return "Point(infinity)"
        else:
            return f"Point({self.x.num},{self.y.num})_{self.x.prime}"

    def __add__(self, other):
        if self.a != other.a or self.b != other.b:
            raise TypeError(f"Points {self}, {other} are not on the same curve")
        
        # TODO 1: Implement point addition
        #self je nekonecno  
        if self.x is None:
            return other
        
        #other je nekonecno
        if other.x is None:
            return self
        
        #body maju rovnake x ale rozne y
        if self.x == other.x and self.y != other.y:
            return Point(x=None, y=None, a=self.a, b=self.b)
        
        #scitanie dvoch roznych bodov
        if self.x != other.x:
            s = (other.y - self.y) / (other.x - self.x)
            x = s**2 - self.x - other.x
            y = s * (self.x - x) - self.y
            return Point(x=x, y=y, a=self.a, b=self.b)
        
        #zdvojenie bodu
        if self==other:
            s = (3 * self.x**2 + self.a) / (2 * self.y)
            x = s**2 - 2 * self.x
            y = s * (self.x - x) - self.y
            return Point(x=x, y=y, a=self.a, b=self.b)

    def __rmul__(self, coefficient):
        # TODO 2: Implement scalar multiplication
        result = Point(x=None, y=None, a=self.a, b=self.b)
        for _ in range(coefficient):
            result += self 
        return result

class PointTest(TestCase):
    def test_ne(self):
        a = Point(x=3, y=-7, a=5, b=7)
        b = Point(x=18, y=77, a=5, b=7)
        self.assertTrue(a != b)
        self.assertFalse(a != a)

    def test_on_curve(self):
        with self.assertRaises(ValueError):
            Point(x=-2, y=4, a=5, b=7)
        # these should not raise an error
        Point(x=3, y=-7, a=5, b=7)
        Point(x=18, y=77, a=5, b=7)

    def test_add0(self):
        a = Point(x=None, y=None, a=5, b=7)
        b = Point(x=2, y=5, a=5, b=7)
        c = Point(x=2, y=-5, a=5, b=7)
        self.assertEqual(a + b, b)
        self.assertEqual(b + a, b)
        self.assertEqual(b + c, a)

    def test_add1(self):
        a = Point(x=3, y=7, a=5, b=7)
        b = Point(x=-1, y=-1, a=5, b=7)
        self.assertEqual(a + b, Point(x=2, y=-5, a=5, b=7))

    def test_add2(self):
        a = Point(x=-1, y=1, a=5, b=7)
        self.assertEqual(a + a, Point(x=18, y=-77, a=5, b=7))

    def test_rmul1(self):
        p = Point(x=-1, y=1, a=5, b=7)
        self.assertEqual(0 * p, Point(x=None, y=None, a=5, b=7))

    def test_rmul2(self):
        p = Point(x=-1, y=1, a=5, b=7)
        expected = Point(x=18, y=-77, a=5, b=7)
        self.assertEqual(2 * p, expected)
