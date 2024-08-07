import { ethers } from "ethers";
import web3Modal from "web3modal";

// INTERNAL IMPORT
import ERC20ABI from "./abi.json";
import { ChainId } from "@uniswap/sdk";

const web3ModalInstance = new Web3Modal();


export const ERC20_ABI = ERC20ABI;

export const V3_SWAP_ROUTER_ADDRESS =
  "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

//TEST_ACCOUNT_FORK
const TEST_ACCOUNT = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";

// FETCH CONTRACT
const fetchTokenContract = (signer, ADDRESS) => {
    return new ethers.Contract(ADDRESS, ERC20_ABI, signer);
}

// web3 prvider function



export const web3Provider = async () => {
    try{
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        // const network = await provider.getNetwork();

        return provider;
    }catch (error){  
        console.log(error);
    }
}

// CONNECTING CONTRACT
export const CONNECTING_CONTRACT = async (ADDRESS) => {
    try{
         const provider = await web3Provider();
         const network = await provider.getNetwork();

         const signer = provider.getSigner();
         const contract = fetchTokenContract(signer, ADDRESS);

        //  USER ADDRESS
        // const userAddress = await signer.getAddress();
        const balance = await contract.balance(TEST_ACCOUNT);
        const name = await contract.name();
        const supply = await contract.totalSupply();
        const symbol = await contract.totalSupply();
        const decimals = await contract.decimals();
        const address = await contract.address();

        const token =  {
            address: address,
            name: name,
            symbol: Symbol,
            decimals: decimals,
            supply: ethers.utils.formatEther(supply.toString()),
            balance: ethers.utils.formatEther(balance.toString()),
            ChainId:1,
            // ChainId: network.ChainId
        }

        return token

    }catch(error){
        console.log(error);
    }
}