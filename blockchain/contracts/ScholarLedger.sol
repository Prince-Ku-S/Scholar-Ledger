//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScholarLedger {

    // Address of the University/admin
    address public admin;

    // Structure to store credential details
    struct Credential {
        bytes32 documentHash;
        uint256 issuedOn;
    }

    // Mapping: Student address => list of credentials
    mapping(address => Credential[]) private studentCredentials;

    // Events for transparency and logging
    event CredentialIssued (address indexed student, bytes32 documentHash, uint256 issuedOn);

    //Modifier to restrict access to admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Constructor sets the admin as contract deployer
    constructor() {
        admin = msg.sender;
    }

    //Function to issue a credential to a student
    function addCredential(address student, bytes32 documentHash) public onlyAdmin {
        studentCredentials[student].push(
            Credential(documentHash, block.timestamp)
        );

        emit CredentialIssued(student, documentHash, block.timestamp);
    }

    //Get total number of credentials for a student
    function getCredentialCount(address student) public view returns (uint256) {
        return studentCredentials[student].length;
    }


    //Verify if a credential hash exists for a student
    function verifyCredential(address student, bytes32 documentHash) public view returns (bool) {
        for (uint256 i = 0; i < studentCredentials[student].length; i++) {
            if (studentCredentials[student][i].documentHash == documentHash) {
                return true;
            }
        }
        return false;
    }
}