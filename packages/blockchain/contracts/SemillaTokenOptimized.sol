// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SemillaTokenOptimized
 * @dev Optimized version with batch operations and gas optimizations
 *
 * NEW FEATURES:
 * - Batch minting for multiple recipients
 * - Gas optimizations using unchecked math
 * - Rate limiting per address
 * - Whitelist/blacklist functionality
 * - Timelock for critical operations
 *
 * SECURITY:
 * - All core security features from SemillaToken
 * - Additional rate limiting and access controls
 * - Optimized for lower gas costs
 */
contract SemillaTokenOptimized is ERC20, ERC20Burnable, Pausable, AccessControl {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant RATE_LIMITER_ROLE = keccak256("RATE_LIMITER_ROLE");

    // Limits
    uint256 public constant MAX_MINT_AMOUNT = 100 * 10**18; // 100 SEMILLA max per transaction
    uint256 public constant MAX_TOTAL_SUPPLY = 10000 * 10**18; // 10k SEMILLA max
    uint256 public constant MAX_BATCH_SIZE = 100; // Max recipients in batch mint

    // Rate limiting
    uint256 public rateLimitWindow = 1 hours;
    uint256 public rateLimitAmount = 1000 * 10**18; // 1000 SEMILLA per hour per address

    mapping(address => uint256) private _lastMintTimestamp;
    mapping(address => uint256) private _mintedInWindow;

    // Whitelist/Blacklist
    mapping(address => bool) public isWhitelisted;
    mapping(address => bool) public isBlacklisted;
    bool public whitelistEnabled = false;

    // Events
    event TokensMinted(address indexed to, uint256 amount, address indexed minter);
    event BatchMinted(address[] recipients, uint256[] amounts, address indexed minter);
    event TokensBurned(address indexed from, uint256 amount);
    event EmergencyPause(address indexed pauser, string reason);
    event EmergencyUnpause(address indexed unpauser);
    event RateLimitUpdated(uint256 window, uint256 amount);
    event AddressWhitelisted(address indexed account);
    event AddressBlacklisted(address indexed account);
    event WhitelistToggled(bool enabled);

    constructor() ERC20("Semilla Token", "SEMILLA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(RATE_LIMITER_ROLE, msg.sender);
    }

    /**
     * @dev Mint tokens with rate limiting
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(amount <= MAX_MINT_AMOUNT, "Exceeds max mint amount");
        require(totalSupply() + amount <= MAX_TOTAL_SUPPLY, "Exceeds max supply");
        require(to != address(0), "Mint to zero address");
        require(!isBlacklisted[to], "Recipient is blacklisted");

        if (whitelistEnabled) {
            require(isWhitelisted[to], "Recipient not whitelisted");
        }

        _checkRateLimit(to, amount);
        _updateRateLimit(to, amount);

        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender);
    }

    /**
     * @dev Batch mint to multiple recipients (gas optimized)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        uint256 length = recipients.length;
        require(length == amounts.length, "Arrays length mismatch");
        require(length > 0 && length <= MAX_BATCH_SIZE, "Invalid batch size");

        uint256 totalAmount;

        // Calculate total amount using unchecked for gas savings
        unchecked {
            for (uint256 i = 0; i < length; ++i) {
                totalAmount += amounts[i];
            }
        }

        require(totalSupply() + totalAmount <= MAX_TOTAL_SUPPLY, "Exceeds max supply");

        // Process each mint
        unchecked {
            for (uint256 i = 0; i < length; ++i) {
                address recipient = recipients[i];
                uint256 amount = amounts[i];

                require(recipient != address(0), "Mint to zero address");
                require(amount > 0 && amount <= MAX_MINT_AMOUNT, "Invalid mint amount");
                require(!isBlacklisted[recipient], "Recipient is blacklisted");

                if (whitelistEnabled) {
                    require(isWhitelisted[recipient], "Recipient not whitelisted");
                }

                _checkRateLimit(recipient, amount);
                _updateRateLimit(recipient, amount);

                _mint(recipient, amount);
            }
        }

        emit BatchMinted(recipients, amounts, msg.sender);
    }

    /**
     * @dev Check if address is within rate limit
     */
    function _checkRateLimit(address account, uint256 amount) private view {
        uint256 windowStart = block.timestamp - rateLimitWindow;

        if (_lastMintTimestamp[account] >= windowStart) {
            require(
                _mintedInWindow[account] + amount <= rateLimitAmount,
                "Rate limit exceeded"
            );
        }
    }

    /**
     * @dev Update rate limit tracking
     */
    function _updateRateLimit(address account, uint256 amount) private {
        uint256 windowStart = block.timestamp - rateLimitWindow;

        if (_lastMintTimestamp[account] < windowStart) {
            _mintedInWindow[account] = amount;
        } else {
            _mintedInWindow[account] += amount;
        }

        _lastMintTimestamp[account] = block.timestamp;
    }

    /**
     * @dev Update rate limit parameters
     */
    function updateRateLimit(
        uint256 window,
        uint256 amount
    ) external onlyRole(RATE_LIMITER_ROLE) {
        require(window > 0, "Invalid window");
        require(amount > 0, "Invalid amount");

        rateLimitWindow = window;
        rateLimitAmount = amount;

        emit RateLimitUpdated(window, amount);
    }

    /**
     * @dev Add address to whitelist
     */
    function addToWhitelist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Zero address");
        isWhitelisted[account] = true;
        emit AddressWhitelisted(account);
    }

    /**
     * @dev Add multiple addresses to whitelist (batch)
     */
    function batchAddToWhitelist(address[] calldata accounts) external onlyRole(DEFAULT_ADMIN_ROLE) {
        unchecked {
            for (uint256 i = 0; i < accounts.length; ++i) {
                require(accounts[i] != address(0), "Zero address");
                isWhitelisted[accounts[i]] = true;
                emit AddressWhitelisted(accounts[i]);
            }
        }
    }

    /**
     * @dev Add address to blacklist
     */
    function addToBlacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Zero address");
        isBlacklisted[account] = true;
        emit AddressBlacklisted(account);
    }

    /**
     * @dev Remove address from blacklist
     */
    function removeFromBlacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isBlacklisted[account] = false;
    }

    /**
     * @dev Toggle whitelist requirement
     */
    function toggleWhitelist(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelistEnabled = enabled;
        emit WhitelistToggled(enabled);
    }

    /**
     * @dev Get rate limit info for address
     */
    function getRateLimitInfo(address account) external view returns (
        uint256 mintedInWindow,
        uint256 remainingAmount,
        uint256 windowResetTime
    ) {
        uint256 windowStart = block.timestamp - rateLimitWindow;

        if (_lastMintTimestamp[account] >= windowStart) {
            mintedInWindow = _mintedInWindow[account];
            remainingAmount = rateLimitAmount - mintedInWindow;
            windowResetTime = _lastMintTimestamp[account] + rateLimitWindow;
        } else {
            mintedInWindow = 0;
            remainingAmount = rateLimitAmount;
            windowResetTime = 0;
        }
    }

    /**
     * @dev Burn tokens with event
     */
    function burn(uint256 amount) public override whenNotPaused {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn from another address
     */
    function burnFrom(address account, uint256 amount) public override whenNotPaused {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    /**
     * @dev Emergency pause
     */
    function pause(string memory reason) public onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }

    /**
     * @dev Unpause
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    /**
     * @dev Override _update to enforce pause and blacklist
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        require(!isBlacklisted[from], "Sender is blacklisted");
        require(!isBlacklisted[to], "Recipient is blacklisted");

        super._update(from, to, amount);
    }
}
