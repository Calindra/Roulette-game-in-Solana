import { sendAndConfirmTransaction, SystemProgram } from "@solana/web3.js";
import { Signer } from "ethers";
import { connect } from "./connect";
import { AdaptedWallet, getProgram } from "./solana/adapter";
const web3 = require("@solana/web3.js");

const { signer } = connect(0);

// Getting Wallet Balance

export const getWalletBalance = async (pubk: string) => {
    try {
        const { connection } = await getProgram(signer);
        const balance = await connection.getBalance(new web3.PublicKey(pubk));
        console.log(`Wallet balance`, balance / web3.LAMPORTS_PER_SOL);
        return balance / web3.LAMPORTS_PER_SOL;
    } catch (err) {
        console.log(err);
    }
}

// Signing the Transaction

export const transferSOL = async (from: Signer, to: AdaptedWallet, transferAmt: number) => {
    try {
        const { connection, wallet } = await getProgram(from);
        const transaction = new web3.Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new web3.PublicKey(wallet.publicKey.toString()),
                toPubkey: new web3.PublicKey(to.publicKey.toString()),
                lamports: transferAmt * web3.LAMPORTS_PER_SOL
            })
        )
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            []
        )
        return signature;
    } catch (err) {
        console.log(err);
    }
}

export const airDropSol = async (wallet: any, transferAmt: number) => {
    try {
        const { connection } = await getProgram(signer);
        const fromAirDropSignature = await connection.requestAirdrop(new web3.PublicKey(wallet.publicKey.toString()), transferAmt * web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(fromAirDropSignature);
    } catch (err) {
        console.log(err);
    }
}

