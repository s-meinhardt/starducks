import React, { useState, useEffect, useCallback } from 'react'
import MyToken from './contracts/MyToken.json'
import MyTokenSale from './contracts/MyTokenSale.json'
import KycContract from './contracts/KycContract.json'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'

import './App.css'

const App = () => {
  const [loaded, setLoaded] = useState(false)
  const [userTokens, setUserTokens] = useState(0)
  const [account, setAccount] = useState()
  const [token, setToken] = useState()
  const [tokenSale, setTokenSale] = useState()
  const [kycContract, setKycContract] = useState()
  const [kycCompleted, setKycCompleted] = useState(false)
  const [numberOfTokens, setNumberOfTokens] = useState('')
  const [kycAdd, setKycAdd] = useState('')
  const [kycRemove, setKycRemove] = useState('')

  const getContracts = async () => {
    try {
      const web3 = new Web3(await detectEthereumProvider())
      handleAccountsChanged(await window.ethereum.request({ method: 'eth_accounts' }))
      const networkId = await web3.eth.net.getId()
      setToken(new web3.eth.Contract(MyToken.abi, MyToken.networks[networkId] && MyToken.networks[networkId].address))
      setTokenSale(new web3.eth.Contract(MyTokenSale.abi, MyTokenSale.networks[networkId] && MyTokenSale.networks[networkId].address))
      setKycContract(new web3.eth.Contract(KycContract.abi, KycContract.networks[networkId] && KycContract.networks[networkId].address))
    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`)
      console.error(error)
    }
  }

  const handleAccountsChanged = accounts => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.')
    } else {
      setAccount(accounts[0])
    }
  }

  const updateUserTokens = useCallback(() => {
    // As 'token' is initiated as 'undefined' we need a conditional to prevent errors
    if (token) {
      token.methods
        .balanceOf(account)
        .call()
        .then(tokens => setUserTokens(tokens))
    }
  }, [account, token])

  const addKycWhitelisting = async event => {
    event.preventDefault()
    const address = kycAdd
    setKycAdd('Please wait...')
    try {
      await kycContract.methods.setKycCompleted(address).send({ from: account })
      alert(address + ' was added to the whitelist.')
    } catch (error) {
      alert('Transaction failed: Are you the contract owner?')
      console.log(error)
    }
    setKycAdd('')
  }

  const removeKycWhitelisting = async event => {
    event.preventDefault()
    const address = kycRemove
    setKycRemove('Please wait...')
    try {
      await kycContract.methods.setKycRevoked(address).send({ from: account })
      alert(address + ' was removed from the whitelist.')
    } catch (error) {
      alert('Transaction failed: Are you the contract owner?')
      console.log(error)
    }
    setKycRemove('')
  }

  const handleBuyTokens = async event => {
    event.preventDefault()
    const value = Math.max(parseInt(numberOfTokens), 0)
    setNumberOfTokens('Please wait...')
    if (isNaN(value)) {
      alert('Please enter a natural number like 4 or 12!')
    } else {
      try {
        await tokenSale.methods.buyTokens(account).send({ from: account, value: value })
      } catch (error) {
        alert('Transaction failed: Please ask the contract owner to whitelist your account!')
        console.log(error)
      }
    }
    setNumberOfTokens('')
  }

  useEffect(() => {
    getContracts()
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    setLoaded(true)
  }, [])

  useEffect(() => {
    let subscription = null
    // As 'kycContract', 'token' and 'account' are initiated as 'undefined' we need a conditional to prevent errors
    if (kycContract && token && account) {
      kycContract.methods
        .kycCompleted(account)
        .call()
        .then(status => setKycCompleted(status))
      updateUserTokens()
      subscription = token.events.Transfer({ to: account }).on('data', () => updateUserTokens())
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe((error, success) => {
          if (error) console.log(error)
        })
      }
    }
  }, [kycContract, token, account])

  if (!loaded) {
    return <div>Loading Web3, accounts, and contract...</div>
  }
  return (
    <div className='App'>
      <h1>StarDucks Cappucino Token Sale</h1>
      <p>Get your Tokens today!</p>
      <p>
        <span>Note:</span> You need to be connected to the Ropsten test network.
      </p>
      <h2>Buy Tokens</h2>
      <p>
        Your account is {kycCompleted ? '' : 'not'} whitelisted. {kycCompleted ? 'You can buy tokens.' : 'Please contact the contract owner!'}
      </p>
      <p>You currently have: {userTokens} CAPPU Tokens</p>
      <form className='form-control' onSubmit={handleBuyTokens}>
        <label htmlFor='buyTokens'>How many tokens would you like to buy? One token costs one Wei.</label>
        <br></br>
        <input type='text' id='buyTokens' value={numberOfTokens} placeholder='0' onChange={e => setNumberOfTokens(e.target.value)} />
        <button type='submit'>Buy Tokens</button>
      </form>
      <h2>Kyc Whitelisting</h2>
      <p>
        <span>Note:</span> This can only be done by the contract owner!
      </p>
      <form className='form-control' onSubmit={addKycWhitelisting}>
        <label htmlFor='kycAddress'>Address to allow:</label>
        <input type='text' id='kycAddress' value={kycAdd} placeholder='0x123...' onChange={e => setKycAdd(e.target.value)} />
        <button type='submit'>Add to Whitelist</button>
      </form>
      <form className='form-control' onSubmit={removeKycWhitelisting}>
        <label htmlFor='kycAddress'>Address to disallow:</label>
        <input type='text' id='kycAddress' value={kycRemove} placeholder='0x123...' onChange={e => setKycRemove(e.target.value)} />
        <button type='submit'>Remove from Whitelist</button>
      </form>
    </div>
  )
}

export default App
