import {
  aws_appsync as appsync,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  Stack,
  StackProps
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppStage } from "../config";

type ResolverConfig = {
  fieldName: string
  typeName: string
}

const ResolverConfigs: ResolverConfig[] = [
  { fieldName: "getBetById", typeName: "Query" },
  { fieldName: "listBets", typeName: "Query" },
  { fieldName: "createBet", typeName: "Mutation" },
  { fieldName: "deleteBet", typeName: "Mutation" },
  { fieldName: "updateBet", typeName: "Mutation" }
]

export class ApiServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  readonly api: appsync.GraphqlApi = (() => {
    const graphqlApi = new appsync.GraphqlApi(this, "Api", {
      name: "wager-appsync-api",
      schema: appsync.SchemaFile.fromAsset("graphql/schema.graphql"),
      xrayEnabled: true,
      authorizationConfig: {
        defaultAuthorization: { authorizationType: appsync.AuthorizationType.API_KEY }
      }
    });

    const cfnApi = graphqlApi.node.defaultChild as appsync.CfnGraphQLApi;
    cfnApi.overrideLogicalId(`WagerApi${AppStage.DEV}`);

    return graphqlApi;
  })()

  readonly betHandlingLambda: lambda.Function = (() => {
    const lambdaFunction = new lambda.Function(this, "BetsHandler", {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "main.handler",
      code: lambda.Code.fromAsset("./lambda"),
      memorySize: 1024,
      role: new iam.Role(this, "BetsHandlerLambdaRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [ iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess") ]
      })
    });
    const cfnLambda = lambdaFunction.node.defaultChild as lambda.CfnFunction;
    cfnLambda.overrideLogicalId(`BetsHandler${AppStage.DEV}`);

    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDataSource = this.api.addLambdaDataSource("lambdaDatasource", lambdaFunction);
    ResolverConfigs.map(config => lambdaDataSource.createResolver(`${config.fieldName}-resolver`, config))

    return lambdaFunction;
  })()

  readonly betsTable: dynamodb.Table = (() => {
    const betsDBTable = new dynamodb.Table(this, "BetsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });
    const cfnTable = betsDBTable.node.defaultChild as dynamodb.CfnTable;
    cfnTable.overrideLogicalId(`BetsTable${AppStage.DEV}`);

    // Create an environment variable that we will use in the function code
    this.betHandlingLambda.addEnvironment("BETS_TABLE", betsDBTable.tableName);

    return betsDBTable;
  })()
}
