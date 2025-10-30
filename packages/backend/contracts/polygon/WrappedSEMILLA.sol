// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title WrappedSEMILLA (wSEMILLA)
 * @notice ERC20 token representing SEMILLA from Gailu Labs blockchain bridged to Polygon
 * @dev This contract allows authorized bridge operators to mint and burn tokens
 *
 * Features:
 * - Mintable by authorized BRIDGE_ROLE
 * - Burnable by users
 * - Pausable for emergency situations
 * - Admin controls via AccessControl
 *
 * Token Details:
 * - Name: Wrapped SEMILLA
 * - Symbol: wSEMILLA
 * - Decimals: 2 (like SEMILLA on internal chain)
 * - Total Supply: Unlimited (minted as needed, backed 1:1)
 */
contract WrappedSEMILLA is ERC20, ERC20Burnable, AccessControl, Pausable {
    // Roles
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Events
    event BridgeMint(address indexed to, uint256 amount, string gailuDID, bytes32 internalTxId);
    event BridgeBurn(address indexed from, uint256 amount, string gailuDID, bytes32 bridgeRequestId);
    event BridgeOperatorAdded(address indexed operator);
    event BridgeOperatorRemoved(address indexed operator);

    /**
     * @notice Constructor sets up roles and token details
     * @param admin Address that will have DEFAULT_ADMIN_ROLE
     * @param bridgeOperator Initial address that can mint/burn for bridges
     */
    constructor(
        address admin,
        address bridgeOperator
    ) ERC20("Wrapped SEMILLA", "wSEMILLA") {
        require(admin != address(0), "Admin cannot be zero address");
        require(bridgeOperator != address(0), "Bridge operator cannot be zero address");

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(BRIDGE_ROLE, bridgeOperator);
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * @notice Returns the number of decimals (2, matching internal SEMILLA)
     */
    function decimals() public pure override returns (uint8) {
        return 2;
    }

    /**
     * @notice Mint wSEMILLA when SEMILLA is locked on internal chain
     * @dev Only callable by addresses with BRIDGE_ROLE
     * @param to Address to receive the minted tokens
     * @param amount Amount to mint (in smallest unit, 1 = 0.01 SEMILLA)
     * @param gailuDID User's DID on Gailu Labs blockchain
     * @param internalTxId Transaction ID from internal blockchain
     */
    function bridgeMint(
        address to,
        uint256 amount,
        string calldata gailuDID,
        bytes32 internalTxId
    ) external onlyRole(BRIDGE_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be positive");
        require(bytes(gailuDID).length > 0, "DID required");

        _mint(to, amount);

        emit BridgeMint(to, amount, gailuDID, internalTxId);
    }

    /**
     * @notice Burn wSEMILLA to unlock SEMILLA on internal chain
     * @dev Callable by any token holder
     * @param amount Amount to burn
     * @param gailuDID User's DID on Gailu Labs blockchain (where SEMILLA will be unlocked)
     * @param bridgeRequestId Unique ID for this bridge request
     */
    function bridgeBurn(
        uint256 amount,
        string calldata gailuDID,
        bytes32 bridgeRequestId
    ) external whenNotPaused {
        require(amount > 0, "Amount must be positive");
        require(bytes(gailuDID).length > 0, "DID required");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _burn(msg.sender, amount);

        emit BridgeBurn(msg.sender, amount, gailuDID, bridgeRequestId);
    }

    /**
     * @notice Add a new bridge operator
     * @dev Only admin can add operators
     * @param operator Address to grant BRIDGE_ROLE
     */
    function addBridgeOperator(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(operator != address(0), "Cannot be zero address");
        grantRole(BRIDGE_ROLE, operator);
        emit BridgeOperatorAdded(operator);
    }

    /**
     * @notice Remove a bridge operator
     * @dev Only admin can remove operators
     * @param operator Address to revoke BRIDGE_ROLE from
     */
    function removeBridgeOperator(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(BRIDGE_ROLE, operator);
        emit BridgeOperatorRemoved(operator);
    }

    /**
     * @notice Pause all transfers and minting
     * @dev Only callable by PAUSER_ROLE (emergency use)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause transfers and minting
     * @dev Only callable by PAUSER_ROLE
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice Hook that is called before any transfer of tokens
     * @dev Enforces pause state
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @notice Get bridge information
     * @return admin The admin address
     * @return totalBridgeOperators Number of addresses with BRIDGE_ROLE
     * @return isPaused Current pause state
     */
    function getBridgeInfo() external view returns (
        address admin,
        uint256 totalBridgeOperators,
        bool isPaused
    ) {
        // Count bridge operators
        uint256 count = 0;
        // Note: In production, you'd want to maintain a list of operators
        // This is simplified for demonstration

        return (
            getRoleMember(DEFAULT_ADMIN_ROLE, 0),
            count,
            paused()
        );
    }
}
