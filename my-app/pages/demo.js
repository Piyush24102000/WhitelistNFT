import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import { abi, contractaddress } from "../constants";

export default function Home() {
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
  //////////Connect Wallet//////////
  const [walletConnected, setWalletConnected] = useState(false);
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };
  //////////Start Presale///////////
  const [loading, setLoading] = useState(false);
  const startPresale = async () => {

    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(contractaddress, abi, signer);
    const tx = await whitelistContract.startPresale();
    setLoading(true);
    await tx.wait();
    setLoading(false);
    await checkIfPresaleStarted();
  }
  /////////check if presale started//////
  const [presaleStarted, setPresaleStarted] = useState(false);

  const checkIfPresaleStarted = async () => {
    const provider = await getProviderOrSigner();
    const callContract = new Contract(contractaddress, abi, provider);
    const _presaleStarted = await callContract.presaleStarted();
    if (!_presaleStarted) {
      await getOwner();
    }
    setPresaleStarted(_presaleStarted);
    return _presaleStarted;
  }
  ////////////Presale Mint///////////
  const presaleMint = async () => {
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(contractaddress, abi, signer);
    const tx = await whitelistContract.presaleMint({ value: utils.parseEther("0.01") })
    setLoading(true);
    await tx.wait();
    setLoading(false);
    window.alert("You successfully minted a TechBull!!!");

  }
  /////////check if presale ended/////////
  const [presaleEnded, setPresaleEnded] = useState(false);

  const checkIfPresaleEnded = async () => {
    const provider = await getProviderOrSigner();
    const callContract = new Contract(contractaddress, abi, provider);
    const _presaleEnded = await callContract.presaleEnded();

    const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
    if (hasEnded) {
      setPresaleEnded(true);
    } else {
      setPresaleEnded(false);
    }
    return hasEnded;
  }
  //////////////Public Minting/////////////
  const publicMint = async () => {
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(contractaddress, abi, signer);
    const tx = await whitelistContract.mint({ value: utils.parseEther("0.01") })
    setLoading(true);
    await tx.wait();
    setLoading(false);
    window.alert("You successfully minted a TechBull!!!");
  }
  /////////////Get Token Ids///////////
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const getTokenIdsMinted = async () => {
    const provider = await getProviderOrSigner();
    const callContract = new Contract(contractaddress, abi, provider);
    const _tokenIds = await callContract.tokenIds();
    setTokenIdsMinted(_tokenIds.toString())  //_tokenid is a big number convert it to string
  }
  /////////////Get Owner///////////////
  const [isOwner, setIsOwner] = useState(false);

  const getOwner = async () => {
    const provider = await getProviderOrSigner();
    const callContract = new Contract(contractaddress, abi, provider);
    const _owner = await callContract.owner();
    //To get address of current network
    const signer = await getProviderOrSigner(true);
    const address = await signer.getAddress();
    if (address.toLowerCase() === _owner.toLowerCase()) {
      setIsOwner(true);
    }
 

  }
  ///////////UseEffect//////////
  useEffect(() => {
    if (!walletConnected) {

      web3ModalRef.current = new Web3Modal({
        network: "matic",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }
      getTokenIdsMinted();
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);
      
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);

    }
  }, [walletConnected])
  ///////////Render Button/////////
  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a
            TechBull Token🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }
    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }

  }
  
  return (
    <div>
    <Head>
      <title>Tech Bulls</title>
      <meta name="description" content="Whitelist-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Tech Bulls!</h1>
        <div className={styles.description}>
          TechBull is a NFT collection for developers in Crypto.
        </div>
        <div className={styles.description}>
          {tokenIdsMinted}/20 have been minted
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./0.svg" />
      </div>
    </div>

    <footer className={styles.footer}>
      Made with &#10084; by Piyush Tale
    </footer>
  </div>
   )
}
