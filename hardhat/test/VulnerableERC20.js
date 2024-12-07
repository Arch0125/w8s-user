const { expect } = require('chai');

describe('Token contract', function () {
  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Token = await ethers.getContractFactory('VulnerableERC20');
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await Token.deploy();
    await token.waitForDeployment();
  });

  it('should not allow transfers', async function () {

    await expect(token.connect(owner).mint(addr1.address, 100)).to.be.fulfilled;
    await expect(token.connect(owner).transfer(addr2.address, 100)).to.be.revertedWith('Transfers are disabled');
  });
});