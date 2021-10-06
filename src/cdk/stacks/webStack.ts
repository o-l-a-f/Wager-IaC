import {Construct, SecretValue, Stack, StackProps} from "@aws-cdk/core";
import {App, GitHubSourceCodeProvider} from "@aws-cdk/aws-amplify";
import {REPO_PAT_ARN} from "../config";

export class WebStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const repoPAT = SecretValue.secretsManager(REPO_PAT_ARN, {jsonField: "repo_pat"})

        const amplifyApp = new App(this, "wager-amplify-app", {
            sourceCodeProvider: new GitHubSourceCodeProvider({
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
