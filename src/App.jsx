import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import faucetContract from './ethereum/faucet';


//deployed Faucet smart contract, with KS TOKEN,
// to the sepolia testnet and copied contract abi from the CREATE TOKEN folder (...contracts)
//copied new deployed address and pasted it in the faucet.js file in the ethereum folder
//All works well, FAUCET drips funds 

// new task: take note of the latest receipient and start counting down his time till next drip
//display the counting down time 
// it should be different for each claimant
function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [fcContract, setFcContract] = useState()
  const [withdrawError, setWithdrawError] = useState("")
  const [withdrawSuccess, setWithdrawSuccess] = useState("")
  const [transactionData, setTransactionData] = useState("")

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /*get provider*/
        const provider = new ethers.BrowserProvider(window.ethereum)
        console.log(provider)

        const accounts = await provider.send("eth_requestAccounts", []);

        /* Get the signer  */   
        setSigner(await provider.getSigner())

        /* contract instance */
        setFcContract(faucetContract(provider))

       setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {

        /*get provider*/
        //Note that the ethers.providers.Web3Provider is now:
        const provider = new ethers.BrowserProvider(window.ethereum)

        const accounts = await provider.send("eth_accounts", []);


        if (accounts.length > 0) {
          /* sign contract only if an address is connected */
          /* Get the signer  */   
          //getSigner method returns a promise
          setSigner(await provider.getSigner())

          /* contract instance */ 
          setFcContract(faucetContract(provider))          
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message); 
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  const getTokenHandler = async() => {
    setWithdrawSuccess("")
    setWithdrawError("")
    try{
      /*create another instance of the contract and sign with signer*/
      const contractWithSigner = fcContract.connect(signer)
      const response = await contractWithSigner.requestTokens()
      console.log(response);
      setWithdrawSuccess("Operation succeeded...")
      setTransactionData(response.hash)
    }catch(err){
      console.error(err.message)
      setWithdrawError(err.message)
    }
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">KS Token (KST)</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Faucet</h1>
            <p>Fast and reliable. 2 KST/day.</p>
            <div className="mt-5">
              {withdrawError && (
                  <div className="withdraw-error">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                  <div className="withdraw-success">{withdrawSuccess}</div>
              )}{" "}             
            </div>
            <div className="box address-box">
              <div className="columns">
                <div className="column is-four-fifths">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="Enter your wallet address (0x...)"
                    defaultValue={walletAddress}
                  />
                </div>
                <div className="column">
                  <button className="button is-link is-medium"
                   onClick={getTokenHandler}
                   disabled={walletAddress ? false : true}>
                    GET TOKENS
                  </button>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>{transactionData ? `Transaction Hash: ${transactionData}` : "----"}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
