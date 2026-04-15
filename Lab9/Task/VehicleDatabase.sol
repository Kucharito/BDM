// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract VehicleDatabase {
    
    struct Vehicle {
        string licensePlate;
        uint256 mileage;
        string name;
    }

    Vehicle[] private vehicles;

    function addVehicle(
        string memory _licensePlate,
        uint256 _mileage,
        string memory _name
    ) public {
        // Skontrolujeme, či už vozidlo s touto ŠPZ neexistuje
        for (uint256 i = 0; i < vehicles.length; i++) {
            if (
                keccak256(bytes(vehicles[i].licensePlate)) == keccak256(bytes(_licensePlate))
            ) {
                revert("Vehicle with this license plate already exists");
            }
        }

        // Ak neexistuje, pridáme ho do poľa
        vehicles.push(Vehicle(_licensePlate, _mileage, _name));
    }

    function getVehicle(string memory _licensePlate) public view returns (string memory, uint256, string memory)
    {
        // Hladame vozidlo podla SPZ
        for (uint256 i = 0; i < vehicles.length; i++) {
            if (
                keccak256(bytes(vehicles[i].licensePlate)) == keccak256(bytes(_licensePlate))
            ) {
                return (
                    vehicles[i].licensePlate,
                    vehicles[i].mileage,
                    vehicles[i].name
                );
            }
        }

        revert("Vehicle not found");
    }

    function getAllVehicles() public view returns (Vehicle[] memory) {
        return vehicles;
    }

    function updateVehicle(string memory _licensePlate, uint256 _mileage, string memory _name
    ) public {
        // Najdeme vozidlo a upravime ho
        for (uint256 i = 0; i < vehicles.length; i++) {
            if (
                keccak256(bytes(vehicles[i].licensePlate)) == keccak256(bytes(_licensePlate))
            ) {
                vehicles[i].mileage = _mileage;
                vehicles[i].name = _name;
                return;
            }
        }
        revert("Vehicle not found");
    }
}