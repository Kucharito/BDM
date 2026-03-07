from unittest import TestCase
from point import Point
from fieldelement import FieldElement

class ECCTest(TestCase):
    def test_on_curve(self):
        prime = 223
        a = FieldElement(0, prime)
        b = FieldElement(7, prime)

        valid_points = ((192, 105), (17, 56), (1, 193))
        invalid_points = ((200, 119), (42, 99))

        # TODO 3: test whether the following points are on the curve y^2 = x^3 + 5x + 7 over F_223
        #valid points
        for x, y in valid_points:
            x = FieldElement(x, prime)
            y = FieldElement(y, prime)
            Point(x, y, a, b)
        
        #invalid points
        for x,y in invalid_points:
            x = FieldElement(x, prime)
            y = FieldElement(y, prime)
            with self.assertRaises(ValueError):
                Point(x, y, a, b)

    def test_add(self):
        prime = 223
        a = FieldElement(0, prime)
        b = FieldElement(7, prime)

        additions = (
            # (x1, y1, x2, y2, x3, y3)
            (192, 105, 17, 56, 170, 142),
            (47, 71, 117, 141, 60, 139),
            (143, 98, 76, 66, 47, 71),
        )

        # TODO 4: test the following additions on the curve y^2 = x^3 + 5x + 7 over F_223
        for x1,y1,x2,y2,x3,y3 in additions:
            p1 = Point(FieldElement(x1, prime), FieldElement(y1, prime), a, b)
            p2 = Point(FieldElement(x2, prime), FieldElement(y2, prime), a, b)
            p3 = Point(FieldElement(x3, prime), FieldElement(y3, prime), a, b)
            self.assertEqual(p1 + p2, p3)

    def test_rmul(self):
        prime = 223
        a = FieldElement(0, prime)
        b = FieldElement(7, prime)

        multiplications = (
            # (coefficient, x1, y1, x2, y2)
            (2, 192, 105, 49, 71),
            (2, 143, 98, 64, 168),
            (2, 47, 71, 36, 111),
            (4, 47, 71, 194, 51),
            (8, 47, 71, 116, 55),
            (21, 47, 71, None, None),
        )

        # TODO 5: test the following multiplications on the curve y^2 = x^3 + 5x + 7 over F_223
        for coefficient, x1, y1, x2, y2 in multiplications:
            p= Point(FieldElement(x1, prime), FieldElement(y1, prime), a, b)
            if x2 is None:
                expected = Point(x=None, y=None, a=a, b=b)
            else:
                expected = Point(FieldElement(x2,prime), FieldElement(y2, prime), a, b)
            self.assertEqual(coefficient * p, expected)