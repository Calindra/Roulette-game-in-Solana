

export function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function totalAmtToBePaid(investment: number) {
    return investment;
}

export function getReturnAmount(investment: number, stakeFactor: number) {
    return investment * stakeFactor;
}

// const test = randomNumber(1,5);
// console.log(test)

// module.exports = {
//     randomNumber, 
//     totalAmtToBePaid, 
//     getReturnAmount
// };