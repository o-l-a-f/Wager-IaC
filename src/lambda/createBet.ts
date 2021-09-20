import Bet from "./Bet";

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient()

async function createBet(bet: Bet) {
    const params = {
        TableName: `${process.env.BETS_TABLE}`,
        Item: bet
    }
    try {
        await docClient.put(params).promise();
        return bet;
    } catch (err) {
        console.log(`DynamoDB error creating Bet: ${bet}`, err);
        return null;
    }
}

export default createBet;
