// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScholarLedger {

    /* ========== ROLES ========== */

    address public universityAdmin;

    modifier onlyAdmin() {
        require(msg.sender == universityAdmin, "Only admin allowed");
        _;
    }

    /* ========== DATA STRUCTURES ========== */

    struct Credential {
        bytes32 cidHash;        // keccak256(IPFS CID)
        string title;           // e.g. "BTech Semester 6"
        uint256 issuedOn;
        bool revoked;
        address issuer;
    }

    // student address => credentials
    mapping(address => Credential[]) private studentCredentials;

    /* ========== EVENTS ========== */

    event CredentialIssued(
        address indexed student,
        uint256 indexed index,
        bytes32 cidHash,
        string title
    );

    event CredentialRevoked(
        address indexed student,
        uint256 indexed index
    );

    /* ========== CONSTRUCTOR ========== */

    constructor() {
        universityAdmin = msg.sender;
    }

    /* ========== ADMIN FUNCTIONS ========== */

    function issueCredential(
        address student,
        bytes32 cidHash,
        string calldata title
    ) external onlyAdmin {

        studentCredentials[student].push(
            Credential({
                cidHash: cidHash,
                title: title,
                issuedOn: block.timestamp,
                revoked: false,
                issuer: msg.sender
            })
        );

        emit CredentialIssued(
            student,
            studentCredentials[student].length - 1,
            cidHash,
            title
        );
    }

    function revokeCredential(
        address student,
        uint256 index
    ) external onlyAdmin {

        require(index < studentCredentials[student].length, "Invalid index");
        studentCredentials[student][index].revoked = true;

        emit CredentialRevoked(student, index);
    }

    /* ========== READ FUNCTIONS (FOR UI) ========== */

    function getCredentialCount(address student)
        external
        view
        returns (uint256)
    {
        return studentCredentials[student].length;
    }

    function getCredential(
        address student,
        uint256 index
    )
        external
        view
        returns (
            bytes32 cidHash,
            string memory title,
            uint256 issuedOn,
            bool revoked,
            address issuer
        )
    {
        require(index < studentCredentials[student].length, "Invalid index");

        Credential memory c = studentCredentials[student][index];

        return (
            c.cidHash,
            c.title,
            c.issuedOn,
            c.revoked,
            c.issuer
        );
    }

    function verifyCredential(
        address student,
        bytes32 cidHash
    )
        external
        view
        returns (bool)
    {
        Credential[] memory creds = studentCredentials[student];

        for (uint256 i = 0; i < creds.length; i++) {
            if (
                creds[i].cidHash == cidHash &&
                creds[i].revoked == false
            ) {
                return true;
            }
        }
        return false;
    }
}
