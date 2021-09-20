const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient()

async function listBets() {
    const params = {
        TableName: `${process.env.BETS_TABLE}`,
    }
    try {
        const data = await docClient.scan(params).promise()
        return data.Items
    } catch (err) {
        console.log(`DynamoDB error listing Bets`, err)
        return null
    }
}

export default listBets;
