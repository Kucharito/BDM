// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract VehicleDatabase {
    struct Vehicle {
        string licensePlate;
        uint256 mileage;
        string name;
    }

    Vehicle[] private vehicles;
    mapping(string => uint256) private licensePlateToIndex;

    event VehicleAdded(string licensePlate, uint256 mileage, string name);
    event VehicleUpdated(string licensePlate, uint256 mileage, string name);

    function addVehicle(
        string memory _licensePlate,
        uint256 _mileage,
        string memory _name
    ) public {
        require(
            licensePlateToIndex[_licensePlate] == 0,
            "Vehicle with this license plate already exists"
        );

        vehicles.push(
            Vehicle({
                licensePlate: _licensePlate,
                mileage: _mileage,
                name: _name
            })
        );

        licensePlateToIndex[_licensePlate] = vehicles.length;
        emit VehicleAdded(_licensePlate, _mileage, _name);
    }

    function getVehicle(string memory _licensePlate)
        public
        view
        returns (string memory, uint256, string memory)
    {
        uint256 index = licensePlateToIndex[_licensePlate];
        require(index > 0, "Vehicle not found");

        Vehicle memory vehicle = vehicles[index - 1];
        return (vehicle.licensePlate, vehicle.mileage, vehicle.name);
    }

    function getAllVehicles() public view returns (Vehicle[] memory) {
        return vehicles;
    }

    function updateVehicle(
        string memory _licensePlate,
        uint256 _mileage,
        string memory _name
    ) public {
        uint256 index = licensePlateToIndex[_licensePlate];
        require(index > 0, "Vehicle not found");

        Vehicle storage vehicle = vehicles[index - 1];
        vehicle.mileage = _mileage;
        vehicle.name = _name;

        emit VehicleUpdated(_licensePlate, _mileage, _name);
    }
}