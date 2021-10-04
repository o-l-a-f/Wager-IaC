import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Src from '../cdk/stacks/apiServiceStack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Src.ApiServiceStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
