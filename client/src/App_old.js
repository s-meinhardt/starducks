import React, { Component } from 'react'
import MyToken from './contracts/MyToken.json'
import MyTokenSale from './contracts/MyTokenSale.json'
import KycContract from './contracts/KycContract.json'
import getWeb3 from './getWeb3'

import './App.css'

class App extends Component {
  state = { loaded: false, tokenSaleAddress: null, userTokens: 0 }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3()

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts()

      // Get the network ID.
      this.networkId = await this.web3.eth.net.getId()

      // Get the token instance.
      this.token = new this.web3.eth.Contract(MyToken.abi, MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address)

      // Get the token sale instance.
      this.tokenSale = new this.web3.eth.Contract(MyTokenSale.abi, MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address)

      // Get the KYC contract instance.
      this.kycContract = new this.web3.eth.Contract(KycContract.abi, KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address)

      this.listenToTokenTransfer()
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        {
          loaded: true,
          tokenSaleAddress: MyTokenSale.networks[this.networkId].address,
        },
        this.updateUserTokens
      )
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`)
      console.error(error)
    }
  }

  updateUserTokens = async () => {
    let userTokens = await this.token.methods.balanceOf(this.accounts[0]).call()
    this.setState({ userTokens: userTokens })
  }

  listenToTokenTransfer = () => {
    this.token.events.Transfer({ to: this.accounts[0] }).on('data', this.updateUserTokens)
  }

  handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }

  handleKycWhitelisting = async event => {
    await this.kycContract.methods.setKycCompleted(this.state.kycAddress).send({ from: this.accounts[0] })
    alert('KYC for ' + this.state.kycAddress + ' is completed.')
  }

  handleBuyTokens = async event => {
    await this.tokenSale.methods.buyTokens(this.accounts[0]).send({ from: this.accounts[0], value: 1 })
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>
    }
    return (
      <div className='App'>
        <h1>StarDucks Cappucino Token Sale</h1>
        <p>Get your Tokens today!</p>

        <h2>Buy Tokens</h2>
        <p>
          If you want to buy tokens, send one Wei per token to this address: <span className='address'>{this.state.tokenSaleAddress}</span>
        </p>
        <p>You currently have: {this.state.userTokens} CAPPU Tokens</p>
        <button type='button' onClick={this.handleBuyTokens}>
          Buy one more token
        </button>
        <h2>Kyc Whitelisting</h2>
        <p>
          <span>Note:</span> This can only be done by the contract owner!
        </p>
        <div className='form-control'>
          <label htmlFor='kycAddress'>Address to allow:</label>
          <input type='text' id='kycAddress' name='kycAddress' value={this.state.kycAddress} placeholder='0x123...' onChange={this.handleInputChange} />
          <button type='button' onClick={this.handleKycWhitelisting}>
            Add to Whitelist
          </button>
        </div>
      </div>
    )
  }
}

export default App
