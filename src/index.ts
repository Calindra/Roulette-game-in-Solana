import { connect } from "./connect";
import { getProgram } from "./solana/adapter";
import { getWalletBalance, transferSOL, airDropSol } from "./solana";

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");

async function main() {

    const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');

    // Establishing Connection

    // const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
    // console.log(connection);

    const init = () => {
        console.log(
            chalk.magenta(
                figlet.textSync("SOL Stake", {
                    font: "Standard",
                    horizontalLayout: "default",
                    verticalLayout: "default"
                })
            )
        );
        console.log(chalk.red`The max bidding amount is 2.5 SOL`);
    };

    const { signer: userSigner } = connect(0);
    const { signer: treasurySigner } = connect(1);
    const { wallet: userWallet } = await getProgram(userSigner);
    const { wallet: treasuryWallet } = await getProgram(treasurySigner);

    const askQuestions = () => {
        const questions = [
            {
                name: "SOL",
                type: "number",
                message: "What is the amount of SOL you want to stake?",
            },
            {
                type: "rawlist",
                name: "RATIO",
                message: "What is the ratio of your staking?",
                choices: ["1:1.25", "1:1.5", "1.75", "1:2"],
                filter: function (val: string) {
                    const stakeFactor = val.split(":")[1];
                    return stakeFactor;
                },
            },
            {
                type: "number",
                name: "RANDOM",
                message: "Guess a random number from 1 to 5 (both 1, 5 included)",
                when: async (val: any) => {
                    if (parseFloat(totalAmtToBePaid(val.SOL)) > 5) {
                        console.log(chalk.red`You have violated the max stake limit. Stake with smaller amount.`)
                        return false;
                    } else {
                        // console.log("In when")
                        console.log(`You need to pay ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to move forward`)
                        const userBalance = await getWalletBalance(userWallet.publicKey.toString()) || 0;

                        if (userBalance < totalAmtToBePaid(val.SOL)) {
                            console.log(chalk.red`You don't have enough balance in your wallet`);
                            return false;
                        } else {
                            console.log(chalk.green`You will get ${getReturnAmount(val.SOL, parseFloat(val.RATIO))} if guessing the number correctly`)
                            return true;
                        }
                    }
                },
            }
        ];
        return inquirer.prompt(questions);
    };


    const gameExecution = async () => {
        //console.log('User publicKey:', userWallet.publicKey.toBase58());


        if (!userSigner || !treasurySigner) {
            throw new Error('Missing signer');
        }
        await airDropSol(userWallet, 2);
        console.log('User publicKey:', userWallet.publicKey.toBase58());
        init();
        const generateRandomNumber = randomNumber(1, 5);
        console.log("Generated number", generateRandomNumber);
        const answers = await askQuestions();
        if (answers.RANDOM) {
            const paymentSignature = await transferSOL(userSigner, treasuryWallet, totalAmtToBePaid(answers.SOL))
            console.log(`Signature of payment for playing the game`, chalk.green`${paymentSignature}`);

            if (answers.RANDOM === generateRandomNumber) {
                // AirDrop Winning Amount

                await airDropSol(treasuryWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)));
                // guess is successfull

                const prizeSignature = await transferSOL(treasurySigner, userWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)))

                console.log(chalk.green`Your guess is absolutely correct`);
                console.log(`Here is the price signature `, chalk.green`${prizeSignature}`);

            } else {
                // better luck next time

                console.log(chalk.yellowBright`Better luck next time`)
            }
        }
    }

    gameExecution()

}
main()

export { }
