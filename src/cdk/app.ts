import {App, CfnStack} from "@aws-cdk/core";
import {AppStack} from "./app-stack";

const ACCOUNT = "668467132136";
const REGION = "us-east-1";
const ENV = "Dev";

const app = new App();
new AppStack(app, "WagerAppSyncStack", {
    env: { account: ACCOUNT, region: REGION }
});
const cfnApp = app.node.defaultChild as CfnStack;
cfnApp.overrideLogicalId(`BetsTable${ENV}`);
app.synth()
