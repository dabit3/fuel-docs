import React, { useEffect, useState } from 'react';
import { bn } from 'fuels';

import "./App.css";
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { CounterContractAbi__factory } from "./contracts";

// The address of the contract deployed the Fuel testnet
const CONTRACT_ID =
  "0x2c38161e42ce14abdaa7950c04b13aa340eb67cf196c94b971d5f0175417f4f4";


declare global {
  interface Window{
    fuel?:any
  }
}

function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string>('');
  const [counter, setCounter] = useState<number>();
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setTimeout(() => {
      checkConnection();
      setLoaded(true);
    }, 200)
    if (connected) getCount();
  }, [connected])

  async function connect() {
    if (window.fuel) {
     try {
       await window.fuel.connect();
       const accounts = await window.fuel.accounts();
       setAccount(accounts[0]);
       setConnected(true);
     } catch(err) {
       console.log('error connecting: ', err);
     }
    }
   }

  async function checkConnection() {
    const isConnected = await window.fuel.isConnected();
    if (isConnected) {
      const accounts = await window.fuel.accounts();
      setAccount(accounts[0]);
      setConnected(true);
    }
  }

  async function getCount() {
    const wallet = await window.fuel.getWallet(account);
    const contract = CounterContractAbi__factory.connect(CONTRACT_ID, wallet);
    const { value } = await contract.functions.count().get();
    setCounter(Number(bn(value)));
  }

  async function increment() {
    const wallet = await window.fuel.getWallet(account);
    const contract = CounterContractAbi__factory.connect(CONTRACT_ID, wallet);
    // Creates a transactions to call the increment function
    // because it creates a TX and updates the contract state this requires the wallet to have enough coins to cover the costs and also to sign the Transaction
    try {
      await contract.functions.increment().txParams({ gasPrice: 1 }).call();
      getCount();
    } catch(err) {
      console.log('error sending transaction...');
    }
  }

  if (!loaded) return null
  
  return (
    <>
      <div className="App">
        {
          connected ? (
            <>
               <h3>Counter: {counter?.toFixed(0)}</h3>
              <button style={buttonStyle} onClick={increment}>
                Increment
              </button>
            </>
          ) : (
            <button style={buttonStyle} onClick={connect}>Connect</button>
          )
        }
      </div>
    </>
  );
}

export default App;

const buttonStyle = {
  borderRadius: '48px',
  marginTop: '10px',
  backgroundColor: '#03ffc8',
  fontSize: '20px',
  fontWeight: '600',
  color: 'rgba(0, 0, 0, .88)',
  border: 'none',
  outline: 'none',
  height: '60px',
  width: '400px',
  cursor: 'pointer'
}