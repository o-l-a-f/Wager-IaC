import { App } from "aws-cdk-lib";
import { ApiServiceStack } from "./stacks/apiServiceStack";
import { WebStack } from "./stacks/webStack";
import { EnvironmentProps, getEnvironment, AppStage } from "./config";
import { AuthStack } from "./stacks/authStack";

const environment: EnvironmentProps = getEnvironment[AppStage.DEV];

const app = new App();

new ApiServiceStack(app, `WagerAppSyncStack${environment.name}`, {
    env: environment.config
});
new WebStack(app, `WagerWebStack${environment.name}`, {
    env: environment.config
})
new AuthStack(app, `WagerAuthStack${environment.name}`, {
    env: environment.config
})

app.synth()
