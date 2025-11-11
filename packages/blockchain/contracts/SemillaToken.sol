// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SemillaToken
 * @dev ERC20 Token para Comunidad Viva Bridge
 *
 * SEGURIDAD:
 * - Usa SOLO código auditado de OpenZeppelin
 * - Zero lógica custom compleja
 * - Pausable para emergencias
 * - Role-based access control
 * - Límites conservadores
 *
 * BOOTSTRAP STRATEGY:
 * - Max 100 SEMILLA por mint (límite ultra bajo)
 * - Solo addresses autorizados pueden mint
 * - Pausable en cualquier momento
 * - Burnable para reverse bridge
 */
contract SemillaToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // BOOTSTRAP LIMITS - Ultra conservador
    uint256 public constant MAX_MINT_AMOUNT = 100 * 10**18; // 100 SEMILLA max
    uint256 public constant MAX_TOTAL_SUPPLY = 10000 * 10**18; // 10k SEMILLA max

    // Events para tracking
    event TokensMinted(address indexed to, uint256 amount, address indexed minter);
    event TokensBurned(address indexed from, uint256 amount);
    event EmergencyPause(address indexed pauser, string reason);
    event EmergencyUnpause(address indexed unpauser);

    constructor() ERC20("Semilla Token", "SEMILLA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @dev Mint tokens (solo para bridge)
     * @param to Dirección destino
     * @param amount Cantidad a mintear (max 100 SEMILLA)
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(amount <= MAX_MINT_AMOUNT, "SemillaToken: Exceeds max mint amount (100 SEMILLA)");
        require(totalSupply() + amount <= MAX_TOTAL_SUPPLY, "SemillaToken: Exceeds max total supply (10k SEMILLA)");
        require(to != address(0), "SemillaToken: mint to zero address");

        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender);
    }

    /**
     * @dev Burn tokens (para reverse bridge)
     * Override para agregar evento
     */
    function burn(uint256 amount) public override whenNotPaused {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn desde otra address (para reverse bridge con allowance)
     */
    function burnFrom(address account, uint256 amount) public override whenNotPaused {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    /**
     * @dev Pausa de emergencia (circuit breaker)
     * Solo PAUSER_ROLE puede ejecutar
     */
    function pause(string memory reason) public onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }

    /**
     * @dev Despausar después de resolver emergencia
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    /**
     * @dev Override _update para incluir pause check en transfers
     * En OpenZeppelin 5.x, _update reemplaza a _beforeTokenTransfer
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        super._update(from, to, value);
    }

    /**
     * @dev Ver límite actual de mint
     */
    function getMaxMintAmount() public pure returns (uint256) {
        return MAX_MINT_AMOUNT;
    }

    /**
     * @dev Ver supply máximo
     */
    function getMaxTotalSupply() public pure returns (uint256) {
        return MAX_TOTAL_SUPPLY;
    }

    /**
     * @dev Cuánto espacio queda para mintear
     */
    function getRemainingMintableSupply() public view returns (uint256) {
        uint256 current = totalSupply();
        if (current >= MAX_TOTAL_SUPPLY) {
            return 0;
        }
        return MAX_TOTAL_SUPPLY - current;
    }
}
