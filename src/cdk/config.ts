export enum AppStage {
    DEV = "DEV"
}

export type EnvironmentProps = {
    name: string
    config: {
        account: string,
        region: string
    }
}

export const getEnvironment: {[key: string]: EnvironmentProps} = {
    DEV: {
        name: "Dev",
        config: {
            account: "668467132136",
            region: "us-east-1"
        }
    }
}

export const REPO_PAT_ARN = "arn:aws:secretsmanager:us-east-1:668467132136:secret:github-3EQZDX";
