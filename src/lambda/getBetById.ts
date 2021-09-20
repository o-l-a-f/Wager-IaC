const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient()

async function getBetById(betId: string) {
    const params = {
        TableName: `${process.env.BETS_TABLE}`,
        Key: { id: betId }
    }
    try {
        const { Item } = await docClient.get(params).promise()
        return Item;
    } catch (err) {
        console.log(`DynamoDB error getting Bet by ID: ${betId}`, err)
        return null;
    }
}

export default getBetById;
