const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient()

type Params = {
    TableName: string,
    Key: { id: any; },
    ExpressionAttributeValues: any,
    ExpressionAttributeNames: any,
    UpdateExpression: string,
    ReturnValues: string
}

async function updateBet(bet: any) {
    let params : Params = {
        TableName: `${process.env.BETS_TABLE}`,
        Key: {
            id: bet.id
        },
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {},
        UpdateExpression: "",
        ReturnValues: "UPDATED_NEW"
    };
    let prefix = "set ";
    let attributes = Object.keys(bet);
    attributes.forEach((attribute) => {
        if (attribute !== "id") {
            params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
            params["ExpressionAttributeValues"][":" + attribute] = bet[attribute];
            params["ExpressionAttributeNames"]["#" + attribute] = attribute;
            prefix = ", ";
        }
    })
    console.log('params: ', params)
    try {
        await docClient.update(params).promise()
        return bet
    } catch (err) {
        console.log(`DynamoDB error updating Bet: ${bet}`, err)
        return null
    }
}

export default updateBet;
