import {Construct, Stack, StackProps} from "@aws-cdk/core";
import { CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, "WagerPipeline", {
            pipelineName: "WagerPipeline",
            synth: new ShellStep("Synth", {
                input: CodePipelineSource.gitHub("o-l-a-f/Wager-IaC", "main"),
                commands: ["npm ci", "npm run build", "npx cdk synth"]
            })
        });
    }
}