const path = require('path')
const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
const AccountIndex = 0

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  networks: {
    // the standard in-memory network used by truffle
    development: { port: 7545, host: '127.0.0.1', network_id: '*' },
    ganache_local: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          'http://127.0.0.1:7545',
          AccountIndex
        ),
      network_id: 5777,
    },
    goerli_infura: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          'https://goerli.infura.io/v3/13792c70e8c54082980031a429c763f9',
          AccountIndex
        ),
      network_id: 5,
    },
    ropsten_infura: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          'https://ropsten.infura.io/v3/13792c70e8c54082980031a429c763f9',
          AccountIndex
        ),
      network_id: 3,
    },
  },
  compilers: {
    solc: { version: '0.7.5' },
  },
}
