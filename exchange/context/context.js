import React, { useState } from "react";
import { ethers } from "ethers";
import { JSBI } from "jsbi";
import Web3Modal from "web3modal";
import toast from "react-hot-toast";

//INTERNAL IMPORT Uniswap
import { SwapRouter } from "@uniswap/universal-router-sdk";
import { TradeType, Ether, Token, CurrencyAmount, Percent } from "@uniswap/sdk-core";
import { Trade as V2Trade } from "@uniswap/v2-sdk";
import { Pool, nearestUsableTick, TickMath, TICK_SPACINGS, FeeAmount, Trade as V3Trade, Route as RouteV3 } from "@uniswap/v3-sdk";

import { MixedRouteTrade, Trade as RouterTrade } from "@uniswap/router-sdk";
import IUniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol";

// INTERNAL IMPORT
import { ERC20_ABI, web3Provider, CONNECTING_CONTRACT } from "./constants";
import { shortAddress, parseErrorMsg } from "../utils/index";

export const CONTEXT = React.createContext();

export const PROVIDER = ({ children }) => {
    const TOKEN_SWAP = "TOKEN SWAP EXCHANGE";
    const [loader, setLoader] = useState(false);
    const [address, setAddress] = useState("");
    const [chainId, setChainId] = useState("");

    // NOTIFICATION
    const notifyError = (msg) => toast.error(msg, { duration: 400 });
    const notifySuccess = (msg) => toast.success(msg, { duration: 400 })

    //CONNECT WALLET FUNCTION
    const connect = async () => {
        try {
            if (!window.ethereum) return notifyError("Install Metamask");
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            if (accounts.length) {
                setAddress(accounts[0]);
            } else {
                notifyError("Sorry you have no account");
            }

            const provider = await web3Provider();
            const network = await provider.getNetwork();
            setChainId(network.chainId);
        } catch (error) {
            const errorMsg = parseErrorMsg(error);
            notifyError(errorMsg);
            console.log(errorMsg);
        }
    }

    // LOAD TOKEN DATA
    const LOAD_TOKEN = async (token) => {
        try {
            const tokenDetail = await CONNECTING_CONTRACT(token);
            return tokenDetail;
        } catch (error) {
            const errorMsg = parseErrorMsg(error);
            notifyError(errorMsg);
            console.log(errorMsg);
        }
    }

    // INTERNAL FUNCTION

    const getPool = async (tokenA, tokenB, feeAmount, provider) => {
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];

        const poolAddress = Pool.getAddress(token0, token1, feeAmount);
        let contract = new Ethers.Contract(poolAddress, IUniswapV3Pool, provider);

        let liquidity = await contract.liquidity();

        let { sqrtPriceX96, tick } = await contract.slot0();

        liquidity = JSBI.BigInt(liquidity.toString());
        sqrtPriceX96 = JSBI.BigInt(sqrtPriceX96.toString());

        console.log("cALLING----------- ");

        return new Pool(token0, token1, feeAmount, sqrtPriceX96, liquidity, tick, [
            {
                index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[FeeAmount]),
                liquidityNet: liquidity,
                liquidityGross: liquidity
            },
            {
                index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
                liquidityNet: JSBI.multiply(liquidity, JSBI.BigInt("-1")),
                liquidityGross: liquidity,
            }
        ]);
    }

    // SWAP OPTIONS

    const swapOptions = (options) => {
        return Object.assign(
            {
                slippageTolerance: new Percent(5, 1000),
                recipient: RECIPIENT,
            },
            options
        )
    }

    //BuildTrade
    const BuildTrade = (trades) => {
        return new RouterTrade({
            v2Routes: trades.filter((trade) => trade instanceof V2Trade).map((trade) => ({
                routev2: trade.route,
                inputAmount: trade.inputAmount,
                outputAmount: trade.outputAmount,
            })),
            v3Routes: trades.filter((trade) => trade instanceof V3Trade).map((trade) => ({
                routev3: trade.route,
                inputAmount: trade.inputAmount,
                outputAmount: trade.outputAmount,
            })),
            mixedRoutes: trades.filter((trade) => trade instanceof MixedRouteTrade).map((trade) => ({
                mixedRoute: trade.route,
                inputAmount: trade.inputAmount,
                outputAmount: trade.outputAmount,
            })),
        })
    }

    // DEMO ACCOUNT
    const RECIPIENT = `0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B`;

    // Swap Function
    const swap = async (token_1, token_2, swapInputAmount) => {
        try{
            // console.log("CALLING ME ______________ SWAP"); 
            const _inputAmount = 1;
            const provider = web3Provider();

            const network = await provider.getNetwork();
            // const ETHER = Ether.onChain(network.chainId);

            const ETHER = Ether.onChain(1);

            // TOEKN CONTRACT
            const tokenAddress1 = await CONNECTING_CONTRACT("");
            const tokenAddress2 = await CONNECTING_CONTRACT("");

            // TOKEN DETAILS
            const TOKEN_A = new Token(
                tokenAddress1.chainId,
                tokenAddress1.address,
                tokenAddress1.decimals,
                tokenAddress1.symbol,
                tokenAddress1.name,
            );

            const TOKEN_B = new Token(
                tokenAddress2.chainId,
                tokenAddress2.address,
                tokenAddress2.decimals,
                tokenAddress2.symbol,
                tokenAddress2.name,
            );

            const WETH_USDC_V3 = await getPool(
                TOKEN_A,
                TOKEN_B,
                FeeAmount.MEDIUM,
                provider
            )

            const inputEther = ethers.utils.parseEther(`1`).toString();
            const trade = await V3Trade.fromRoute(
                new RouteV3([WETH_USDC_V3], ETHER, TOKEN_B),
                CurrencyAmount.fromRawAmount(Ether, inputEther),
                TradeType.EXACT_INPUT
            );

            const RouterTrade = buildTrade([trade]);

            const opts = swapOptions({});
            const params = SwapRouter.swapERC20CallParameters(RouterTrade, opts);

            console.log(WETH_USDC_V3);
            console.log(trade);
            console.log(RouterTrade);
            console.log(opts);
            console.log(params);

            let ethBalance;
            let tokenA;
            let tokenB;

            ethBalance = await provider.getBalance(RECIPIENT);
            tokenA = await tokenAddress1.balance;
            tokenB = await tokenAddress2.balance;

            console.log("-----------Before Balance");
            console.log("EthBalance:", ethers.utils.formatUnits(ethBalance, 18));

            console.log("tokenA : ", tokenA);
            console.log("tokenB :", tokenB);

            const tx = await signer.sendTransaction({
                data: params.calldata,
                to: "",
                value: params.value,
                from: RECIPIENT
            });

            const receipt = await tx.wait();

            console.log(`--------------SUCCESS`);
            console.log(`STATUS`, receipt.status);

            ethBalance = await provider.getBalance(RECIPIENT);
            tokenA = await tokenAddress1.balance;
            tokenB = await tokenAddress2.balance;
            console.log(`--------------AFTER`);

        }catch(error){
            const errorMsg = parseErrorMsg(error);
            notifyError(errorMsg);
            console.log(error);
        }
    }

    return (
            <CONTEXT.Provider value={{
                TOKEN_SWAP,
                LOAD_TOKEN,
                notifyError,
                notifySuccess,
                setLoader,
                connect,
                loader,
                connect,
                address,
                swap
            }} >
            {children}
        </CONTEXT.Provider>
        )
}