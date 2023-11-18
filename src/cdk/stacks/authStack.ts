import {
    aws_cognito as cognito,
    CfnOutput,
    RemovalPolicy,
    Stack,
    StackProps
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class AuthStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
    }

    readonly userPool = (() => {
        const REQUIRED_AND_MUTABLE = { required: true, mutable: true }

        // Ref Cognito Standard Attributes: https://tinyurl.com/4mm8664s
        const StandardCognitoAttributes: cognito.StandardAttributes = {
            givenName: REQUIRED_AND_MUTABLE,
            familyName: REQUIRED_AND_MUTABLE,
            email: REQUIRED_AND_MUTABLE,
            phoneNumber: REQUIRED_AND_MUTABLE
        };

        const appUserPool = new cognito.UserPool(this, "AppUserPool", {
            userPoolName: "wager-app-user-pool",
            signInAliases: {
                email: true,
                username: true
            },
            selfSignUpEnabled: true,
            standardAttributes: StandardCognitoAttributes,
            passwordPolicy: {
                minLength: 12,
                requireDigits: true,
                requireLowercase: true,
                requireUppercase: true,
                requireSymbols: true
            },
            mfa: cognito.Mfa.OPTIONAL,
            mfaMessage: "Wager user access code is {####}",
            signInCaseSensitive: false,
            accountRecovery: cognito.AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
            removalPolicy: RemovalPolicy.RETAIN
        })

        new CfnOutput(this, "userPoolId", { value: appUserPool.userPoolId });

        return appUserPool;
    })()

    /**
     * This construct configures the UserPool Client which enables unauthenticated operations like register, sign-in and restore
     * forgotten password. You can't call these operations without an app client ID, which you get by creating a UserPool Client.
     */
    readonly userPoolClient: cognito.UserPoolClient = (() => {

        const standardCognitoAttributes: cognito.StandardAttributesMask = {
            givenName: true,
            familyName: true,
            email: true,
            phoneNumber: true,
            emailVerified: true
        };

        /**
         *  Read Attributes represent the attributes the application will be able to read on Cognito Users.
         */
        const clientReadAttributes = new cognito.ClientAttributes().withStandardAttributes(standardCognitoAttributes);

        /**
         * WriteAttributes represent the attributes the UserPool Client will be able to write.
         * Note: emailVerified property is removed as users shouldn't be able to verify their own email.
         */
        const clientWriteAttributes = new cognito.ClientAttributes().withStandardAttributes({
            ...standardCognitoAttributes,
            emailVerified: false
        });

        const client = new cognito.UserPoolClient(this, "userpool-client", {
            userPool: this.userPool,
            authFlows: {
                adminUserPassword: true,
                userSrp: true,
                userPassword: true
            },
            supportedIdentityProviders: [ cognito.UserPoolClientIdentityProvider.COGNITO ],
            readAttributes: clientReadAttributes,
            writeAttributes: clientWriteAttributes
        })

        new CfnOutput(this, "userPoolClientId", { value: client.userPoolClientId });

        return client;
    })()
}