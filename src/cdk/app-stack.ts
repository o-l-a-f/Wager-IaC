import {AuthorizationType, CfnGraphQLApi, GraphqlApi, Schema} from "@aws-cdk/aws-appsync";
import {Construct, Stack, StackProps} from "@aws-cdk/core";
import {AttributeType, BillingMode, CfnTable, Table} from "@aws-cdk/aws-dynamodb";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {CfnFunction, Code, Function, Runtime} from "@aws-cdk/aws-lambda";

const ENV = "Dev";

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, "Api", {
      name: "wager-appsync-api",
      schema: Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY
        },
      },
      xrayEnabled: true,
    });
    const cfnApi = api.node.defaultChild as CfnGraphQLApi;
    cfnApi.overrideLogicalId(`WagerApi${ENV}`);

    const betHandlingLambda = new Function(this, 'BetsHandler', {
      runtime: Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: Code.fromAsset("./lambda"),
      memorySize: 1024
    });
    const cfnLambda = betHandlingLambda.node.defaultChild as CfnFunction;
    cfnLambda.overrideLogicalId(`BetsHandler${ENV}`);

    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDataSource = api.addLambdaDataSource("lambdaDatasource", betHandlingLambda);
    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getBetById"
    });
    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "listBets"
    });
    lambdaDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "createBet"
    });
    lambdaDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "deleteBet"
    });
    lambdaDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "updateBet"
    });

    // Create Policy Statement for Lambda Functions
    betHandlingLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      resources: [
        "*"
      ]
    }));

    const betsDBTable = new Table(this, "BetsTable", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });
    const cfnTable = betsDBTable.node.defaultChild as CfnTable;
    cfnTable.overrideLogicalId(`BetsTable${ENV}`);

    // enable the Lambda function to access the DynamoDB table (using IAM)
    betsDBTable.grantReadWriteData(betHandlingLambda);

    // Create an environment variable that we will use in the function code
    betHandlingLambda.addEnvironment("BETS_TABLE", betsDBTable.tableName);
  }
}
