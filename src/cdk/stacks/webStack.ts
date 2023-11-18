import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import * as amplify from "@aws-cdk/aws-amplify-alpha";
import { Construct } from "constructs";
import { REPO_PAT_ARN } from "../config";

export class WebStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const repoPAT = SecretValue.secretsManager(REPO_PAT_ARN, {jsonField: "repo_pat"})

        const amplifyApp = new amplify.App(this, "wager-amplify-app", {
            sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
                owner: "o-l-a-f",
                repository: "Wager-WebApp",
                // @ts-ignore
                oauthToken: repoPAT
            })
        });

        (function() {
            amplifyApp.addBranch("main");
        })();
    }
}
