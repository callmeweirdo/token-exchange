import React, {useState} from "react";
import { ethers } from "ethers";
import { JSBI } from "jsbi";
import Web3Modal from "web3modal";
import toast from "react-hot-toast";

//INTERNAL IMPORT Uniswap
import { SwapRouter } from "@uniswap/universal-router-sdk";
import { TradeType, Ether,Token, CurrencyAmount, Percent } from "@uniswap/sdk-core";
import { Trade as V2Trade } from "@uniswap/v2-sdk";
import { Pool, nearestUsableTick, TickMath, TICK_SPACINGS, FeeAmount, Trade as V3Trade, Route as RouteV3 } from "@uniswap/v3-sdk";

import { MixedRouteTrade, Trade as RouterTrade  } from "@uniswap/router-sdk";
import IUniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol";

// INTERNAL IMPORT
import {ERC20_ABI, web3Provider, CONNECTING_CONTRACT} from "./constants";
import {shortAddress, parseErrorMsg} from "../utils/index";

export const CONTEXT = React.createContext();

export const PROVIDER = ({children}) => {
    const TOKEN_SWAP = "TOKEN SWAP EXCHANGE";
    const [loader, setLoader] = useState(fasle);
    const [address, setAddress] = useState("");
    const [chainId, setChainId] = useState("");

    // NOTIFICATION
    const notifyError = (msg) => toast.error(msg, {duration: 400});
    const notifySuccess = (msg) => toast.success(msg, {duration: 400})

    //CONNECT WALLET FUNCTION
    const connect = async () => {
        try{
            if(!window.ethereum) return notifyError("Install Metamask");
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            
            if(accounts.length){
                setAddress(accounts[0]);
            }else{
                notifyError("Sorry you haveno account");
            }

            const provider = await web3Provider();
            const network = await provider.getNetwork();
            setChainId(network.chainId);
        }catch(error){
            const errorMsg = parseErrorMsg(error);
            notifyError(errorMsg);
            console.log(errorMsg);
        }
    }

}