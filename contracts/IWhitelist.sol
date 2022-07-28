// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

 interface IWhitelist {
        function whitelistedAddresses(address) external view returns(bool);
    }

    //This interface has a function which doesn't has a return value
    //In techbull contract we created an instance of this interface
    //And that instance will store the address provided in constructor
    //to call the whitelistadd function with address parameter