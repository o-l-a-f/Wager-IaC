import {App, CfnStack} from "@aws-cdk/core";
import {ApiServiceStack} from "./stacks/apiServiceStack";
import {PipelineStack} from "./stacks/pipelineStack";

const ACCOUNT = "668467132136";
const REGION = "us-east-1";
const ENV = "Dev";

const app = new App();
new PipelineStack(app, "WagerPipelineStack", {
    env: { account: ACCOUNT, region: REGION }
})
new ApiServiceStack(app, "WagerAppSyncStack", {
    env: { account: ACCOUNT, region: REGION }
});
const cfnApp = app.node.defaultChild as CfnStack;
cfnApp.overrideLogicalId(`BetsTable${ENV}`);
app.synth()
