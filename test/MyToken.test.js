const Token = artifacts.require('MyToken')
// const TokenSale = artifacts.require('MyTokenSale')
require('dotenv').config({ path: '../.env' })

const chai = require('./setupchai.js')
const BN = web3.utils.BN
const expect = chai.expect

contract('Token Test', async (accounts) => {
  const [deployerAccount, recipient, anotherAccount] = accounts

  beforeEach(async () => {
    this.myToken = await Token.new(process.env.INITIAL_TOKENS)
  })

  it('all tokens should be in my account', async () => {
    let token = this.myToken
    let totalSupply = await token.totalSupply()
    // use the 'expect' function from chai and 'eventually' from chai-as-promise
    return expect(
      token.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(totalSupply)
  })

  it('is possible to send tokens between accounts', async () => {
    const sendToken = 1
    let token = this.myToken
    let totalSupply = await token.totalSupply()
    expect(token.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
      totalSupply
    )
    expect(token.transfer(recipient, sendToken)).to.eventually.be.fulfilled
    expect(token.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
      totalSupply.sub(new BN(sendToken))
    )
    return expect(
      token.balanceOf(recipient)
    ).to.eventually.be.a.bignumber.equal(new BN(sendToken))
  })

  it('is not possible to send more tokens than available in total', async () => {
    let token = this.myToken
    let balanceOfDeployer = await token.balanceOf(deployerAccount)
    expect(token.transfer(recipient, new BN(balanceOfDeployer + 1))).to
      .eventually.be.rejected
    return expect(
      token.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(balanceOfDeployer)
  })
})
