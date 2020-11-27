const TokenSale = artifacts.require('MyTokenSale')
const Token = artifacts.require('MyToken')
const Kyc = artifacts.require('KycContract')
require('dotenv').config({ path: '../.env' })

const chai = require('./setupchai.js')
const BN = web3.utils.BN
const expect = chai.expect

contract('TokenSaleTest', async (accounts) => {
  const [deployerAccount, recipient, anotherAccount] = accounts

  it('should not have any tokens in my deployerAccount', async () => {
    let instance = await Token.deployed()
    // We need 'return' in front of the last promise-expect !!!
    return expect(
      instance.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(new BN(0))
  })

  it('all tokens should be in the TokenSale Smart Contract by default', async () => {
    let instance = await Token.deployed()
    let totalSupply = await instance.totalSupply()
    // The same check as before but without a promise
    let balanceOfTokenSale = await instance.balanceOf(TokenSale.address)
    // no 'return' here !!!
    expect(balanceOfTokenSale).to.be.a.bignumber.equal(totalSupply)
  })

  it('should be possible to buy tokens', async () => {
    let token = await Token.deployed()
    let tokenSale = await TokenSale.deployed()
    let kyc = await Kyc.deployed()
    let balanceBefore = await token.balanceOf(deployerAccount)
    await kyc.setKycCompleted(deployerAccount, { from: deployerAccount })
    // calling the 'buyTokens' function indirectly by sending ether to the crowdsale contract which is handled by the receiver function
    expect(
      tokenSale.sendTransaction({
        from: deployerAccount,
        value: web3.utils.toWei('1', 'wei'),
      })
    ).to.be.fulfilled
    // We need 'return' in front of the last promise-expect !!!
    return expect(
      token.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(balanceBefore.add(new BN(1)))
  })
})
