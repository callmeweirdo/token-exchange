import { Signer, ethers } from "ethers";
import web3Modal from "web3modal";

// INTERNAL IMPORT
import ERC20ABI from "./abi.json";

export const ERC20_ABI = ERC20ABI;

export const V3_SWAP_ROUTER_ADDRESS =
  "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

//TEST_ACCOUNT_FORK
const TEST_ACCOUNT = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";

// FETCH CONTRACT
const fetchTokenAddress = () => {
    new ethers.Contract(ADDRESS, ERC20_ABI, signer);
}

export const web3Provider = async () => {
    try{
        const web3Modal = new web3Modal();
        const connection = await web3Modal.connect();
        const provider = ethers.providers.web3Provider(connection);
    }catch (error){
        console.log(error);
    }
}

export const CONNECTING_CONTRACT = async (ADDRESS) => {
    try{
         
    }catch(error){
        console.log(error);
    }
}