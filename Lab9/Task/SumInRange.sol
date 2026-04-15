// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SumInRange {
    
    function sum(uint start, uint to) public pure returns (uint) {
        require(to >= start, "SumInRange: 'to' must be greater than or equal to 'start'");
        
        uint total = 0;
        for (uint i = start; i <= to; i++) {
            total += i;
        }
        
        return total;
    }
}
