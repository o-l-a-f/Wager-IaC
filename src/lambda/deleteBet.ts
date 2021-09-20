const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient()

async function deleteBet(betId: string) {
    const params = {
        TableName: `${process.env.BETS_TABLE}`,
        Key: {
            id: betId
        }
    }
    try {
        await docClient.delete(params).promise()
        return betId;
    } catch (err) {
        console.log(`DynamoDB error deleting Bet with ID: ${betId}`, err)
        return null;
    }
}

export default deleteBet;
