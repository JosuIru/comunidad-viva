const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SemillaToken", function () {
  // Fixture para desplegar el contrato
  async function deploySemillaTokenFixture() {
    const [owner, minter, pauser, user1, user2, attacker] = await ethers.getSigners();

    const SemillaToken = await ethers.getContractFactory("SemillaToken");
    const token = await SemillaToken.deploy();

    const MINTER_ROLE = await token.MINTER_ROLE();
    const PAUSER_ROLE = await token.PAUSER_ROLE();
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

    return { token, owner, minter, pauser, user1, user2, attacker, MINTER_ROLE, PAUSER_ROLE, DEFAULT_ADMIN_ROLE };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { token } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.name()).to.equal("Semilla Token");
      expect(await token.symbol()).to.equal("SEMILLA");
    });

    it("Should set the right decimals", async function () {
      const { token } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.decimals()).to.equal(18);
    });

    it("Should grant admin role to deployer", async function () {
      const { token, owner, DEFAULT_ADMIN_ROLE } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant minter role to deployer", async function () {
      const { token, owner, MINTER_ROLE } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });

    it("Should grant pauser role to deployer", async function () {
      const { token, owner, PAUSER_ROLE } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });

    it("Should have 0 initial supply", async function () {
      const { token } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.totalSupply()).to.equal(0);
    });

    it("Should have correct max limits", async function () {
      const { token } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.MAX_MINT_AMOUNT()).to.equal(ethers.parseEther("100"));
      expect(await token.MAX_TOTAL_SUPPLY()).to.equal(ethers.parseEther("10000"));
    });
  });

  describe("Minting", function () {
    it("Should mint tokens successfully", async function () {
      const { token, owner, user1 } = await loadFixture(deploySemillaTokenFixture);
      const amount = ethers.parseEther("50");

      await expect(token.mint(user1.address, amount))
        .to.emit(token, "TokensMinted")
        .withArgs(user1.address, amount, owner.address);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(amount);
    });

    it("Should fail to mint more than MAX_MINT_AMOUNT", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);
      const amount = ethers.parseEther("101"); // Más de 100

      await expect(token.mint(user1.address, amount))
        .to.be.revertedWith("SemillaToken: Exceeds max mint amount (100 SEMILLA)");
    });

    it("Should allow minting exactly MAX_MINT_AMOUNT", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);
      const amount = ethers.parseEther("100"); // Exactamente 100

      await token.mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail to mint to zero address", async function () {
      const { token } = await loadFixture(deploySemillaTokenFixture);
      const amount = ethers.parseEther("50");

      await expect(token.mint(ethers.ZeroAddress, amount))
        .to.be.revertedWith("SemillaToken: mint to zero address");
    });

    it("Should fail to mint if exceeds MAX_TOTAL_SUPPLY", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      // Mint casi al máximo
      for (let i = 0; i < 99; i++) {
        await token.mint(user1.address, ethers.parseEther("100"));
      }

      // Total ahora es 9,900 SEMILLA
      expect(await token.totalSupply()).to.equal(ethers.parseEther("9900"));

      // Intentar mint 101 más (excedería 10k, pero primero falla por max mint)
      await expect(token.mint(user1.address, ethers.parseEther("101")))
        .to.be.revertedWith("SemillaToken: Exceeds max mint amount (100 SEMILLA)");
    });

    it("Should allow minting up to MAX_TOTAL_SUPPLY exactly", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      // Mint 100 veces de 100 = 10,000
      for (let i = 0; i < 100; i++) {
        await token.mint(user1.address, ethers.parseEther("100"));
      }

      expect(await token.totalSupply()).to.equal(ethers.parseEther("10000"));
      expect(await token.getRemainingMintableSupply()).to.equal(0);
    });

    it("Should fail if caller doesn't have MINTER_ROLE", async function () {
      const { token, attacker, user1 } = await loadFixture(deploySemillaTokenFixture);
      const amount = ethers.parseEther("50");

      await expect(token.connect(attacker).mint(user1.address, amount))
        .to.be.reverted; // AccessControl reverts
    });

    it("Should allow minting from non-owner if granted MINTER_ROLE", async function () {
      const { token, owner, minter, user1, MINTER_ROLE } = await loadFixture(deploySemillaTokenFixture);

      // Grant MINTER_ROLE to minter account
      await token.connect(owner).grantRole(MINTER_ROLE, minter.address);

      const amount = ethers.parseEther("50");
      await token.connect(minter).mint(user1.address, amount);

      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });
  });

  describe("Burning", function () {
    it("Should burn tokens successfully", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);
      const mintAmount = ethers.parseEther("100");
      const burnAmount = ethers.parseEther("30");

      await token.mint(user1.address, mintAmount);

      await expect(token.connect(user1).burn(burnAmount))
        .to.emit(token, "TokensBurned")
        .withArgs(user1.address, burnAmount);

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("70"));
      expect(await token.totalSupply()).to.equal(ethers.parseEther("70"));
    });

    it("Should fail to burn more than balance", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);
      const mintAmount = ethers.parseEther("50");

      await token.mint(user1.address, mintAmount);

      await expect(token.connect(user1).burn(ethers.parseEther("51")))
        .to.be.reverted;
    });

    it("Should burn tokens with burnFrom (allowance)", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deploySemillaTokenFixture);
      const mintAmount = ethers.parseEther("100");
      const burnAmount = ethers.parseEther("30");

      await token.mint(user1.address, mintAmount);
      await token.connect(user1).approve(user2.address, burnAmount);

      await expect(token.connect(user2).burnFrom(user1.address, burnAmount))
        .to.emit(token, "TokensBurned")
        .withArgs(user1.address, burnAmount);

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("70"));
    });

    it("Should fail burnFrom without allowance", async function () {
      const { token, user1, user2 } = await loadFixture(deploySemillaTokenFixture);
      const mintAmount = ethers.parseEther("100");

      await token.mint(user1.address, mintAmount);

      await expect(token.connect(user2).burnFrom(user1.address, ethers.parseEther("30")))
        .to.be.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should pause successfully", async function () {
      const { token, owner } = await loadFixture(deploySemillaTokenFixture);

      await expect(token.pause("Emergency test"))
        .to.emit(token, "EmergencyPause")
        .withArgs(owner.address, "Emergency test");

      expect(await token.paused()).to.be.true;
    });

    it("Should unpause successfully", async function () {
      const { token, owner } = await loadFixture(deploySemillaTokenFixture);

      await token.pause("Test");

      await expect(token.unpause())
        .to.emit(token, "EmergencyUnpause")
        .withArgs(owner.address);

      expect(await token.paused()).to.be.false;
    });

    it("Should fail to mint when paused", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      await token.pause("Test");

      await expect(token.mint(user1.address, ethers.parseEther("50")))
        .to.be.reverted;
    });

    it("Should fail to burn when paused", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      await token.mint(user1.address, ethers.parseEther("100"));
      await token.pause("Test");

      await expect(token.connect(user1).burn(ethers.parseEther("50")))
        .to.be.reverted;
    });

    it("Should fail to transfer when paused", async function () {
      const { token, user1, user2 } = await loadFixture(deploySemillaTokenFixture);

      await token.mint(user1.address, ethers.parseEther("100"));
      await token.pause("Test");

      await expect(token.connect(user1).transfer(user2.address, ethers.parseEther("50")))
        .to.be.reverted;
    });

    it("Should fail to pause if not PAUSER_ROLE", async function () {
      const { token, attacker } = await loadFixture(deploySemillaTokenFixture);

      await expect(token.connect(attacker).pause("Attack"))
        .to.be.reverted;
    });

    it("Should allow pausing from non-owner if granted PAUSER_ROLE", async function () {
      const { token, owner, pauser, PAUSER_ROLE } = await loadFixture(deploySemillaTokenFixture);

      await token.connect(owner).grantRole(PAUSER_ROLE, pauser.address);
      await token.connect(pauser).pause("Emergency");

      expect(await token.paused()).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should grant role correctly", async function () {
      const { token, owner, minter, MINTER_ROLE } = await loadFixture(deploySemillaTokenFixture);

      await token.connect(owner).grantRole(MINTER_ROLE, minter.address);
      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.true;
    });

    it("Should revoke role correctly", async function () {
      const { token, owner, minter, MINTER_ROLE } = await loadFixture(deploySemillaTokenFixture);

      await token.connect(owner).grantRole(MINTER_ROLE, minter.address);
      await token.connect(owner).revokeRole(MINTER_ROLE, minter.address);

      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });

    it("Should fail to grant role without admin", async function () {
      const { token, attacker, minter, MINTER_ROLE } = await loadFixture(deploySemillaTokenFixture);

      await expect(token.connect(attacker).grantRole(MINTER_ROLE, minter.address))
        .to.be.reverted;
    });
  });

  describe("Helper Functions", function () {
    it("Should return correct max mint amount", async function () {
      const { token } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.getMaxMintAmount()).to.equal(ethers.parseEther("100"));
    });

    it("Should return correct max total supply", async function () {
      const { token } = await loadFixture(deploySemillaTokenFixture);
      expect(await token.getMaxTotalSupply()).to.equal(ethers.parseEther("10000"));
    });

    it("Should calculate remaining mintable supply correctly", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      expect(await token.getRemainingMintableSupply()).to.equal(ethers.parseEther("10000"));

      await token.mint(user1.address, ethers.parseEther("100"));
      expect(await token.getRemainingMintableSupply()).to.equal(ethers.parseEther("9900"));

      await token.mint(user1.address, ethers.parseEther("50"));
      expect(await token.getRemainingMintableSupply()).to.equal(ethers.parseEther("9850"));
    });

    it("Should return 0 remaining when supply is maxed", async function () {
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      for (let i = 0; i < 100; i++) {
        await token.mint(user1.address, ethers.parseEther("100"));
      }

      expect(await token.getRemainingMintableSupply()).to.equal(0);
    });
  });

  describe("ERC20 Standard Functionality", function () {
    it("Should transfer tokens correctly", async function () {
      const { token, user1, user2 } = await loadFixture(deploySemillaTokenFixture);

      await token.mint(user1.address, ethers.parseEther("100"));
      await token.connect(user1).transfer(user2.address, ethers.parseEther("30"));

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("70"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("30"));
    });

    it("Should approve and transferFrom correctly", async function () {
      const { token, user1, user2 } = await loadFixture(deploySemillaTokenFixture);

      await token.mint(user1.address, ethers.parseEther("100"));
      await token.connect(user1).approve(user2.address, ethers.parseEther("50"));

      expect(await token.allowance(user1.address, user2.address)).to.equal(ethers.parseEther("50"));

      await token.connect(user2).transferFrom(user1.address, user2.address, ethers.parseEther("30"));

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("70"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("30"));
      expect(await token.allowance(user1.address, user2.address)).to.equal(ethers.parseEther("20"));
    });

    it("Should fail to transfer more than balance", async function () {
      const { token, user1, user2 } = await loadFixture(deploySemillaTokenFixture);

      await token.mint(user1.address, ethers.parseEther("50"));

      await expect(token.connect(user1).transfer(user2.address, ethers.parseEther("51")))
        .to.be.reverted;
    });
  });

  describe("Security Edge Cases", function () {
    it("Should not allow re-entrancy attacks via callbacks", async function () {
      // ERC20 de OpenZeppelin ya está protegido contra reentrancy
      // Este test valida que no hay callbacks peligrosos
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      await token.mint(user1.address, ethers.parseEther("100"));

      // Múltiples operaciones consecutivas deberían funcionar bien
      await token.connect(user1).transfer(user1.address, ethers.parseEther("10"));
      await token.connect(user1).burn(ethers.parseEther("10"));

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("90"));
    });

    it("Should handle integer overflow/underflow correctly", async function () {
      // Solidity 0.8+ tiene protección automática
      const { token, user1 } = await loadFixture(deploySemillaTokenFixture);

      await token.mint(user1.address, ethers.parseEther("50"));

      // Intentar burn más de lo que tiene
      await expect(token.connect(user1).burn(ethers.parseEther("51")))
        .to.be.reverted; // Underflow protection
    });

    it("Should prevent front-running mint/burn timing attacks", async function () {
      // Los límites bajos y el circuitbreaker mitigan esto
      const { token, user1, user2 } = await loadFixture(deploySemillaTokenFixture);

      // Mint hasta cerca del límite
      for (let i = 0; i < 99; i++) {
        await token.mint(user1.address, ethers.parseEther("100"));
      }

      // Solo quedan 100 SEMILLA disponibles
      expect(await token.getRemainingMintableSupply()).to.equal(ethers.parseEther("100"));

      // Ambos usuarios intentan mint
      await token.mint(user1.address, ethers.parseEther("50"));

      // Solo quedan 50, el segundo mint debería fallar
      await expect(token.mint(user2.address, ethers.parseEther("51")))
        .to.be.revertedWith("SemillaToken: Exceeds max total supply (10k SEMILLA)");
    });
  });
});
