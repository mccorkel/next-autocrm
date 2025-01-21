import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import * as dax from 'aws-cdk-lib/aws-dax';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export function configureDax(stack: Stack) {
  const vpc = new ec2.Vpc(stack, 'DAXVpc', {
    maxAzs: 2
  });

  const daxCluster = new dax.CfnCluster(stack, 'DAXCluster', {
    clusterName: 'autocrm-dax-cluster',
    nodeType: 'dax.t3.small',
    replicationFactor: 2,
    iamRoleArn: stack.formatArn({
      service: 'iam',
      region: '',
      resource: 'role',
      resourceName: 'service-role/DaxRole'
    }),
    subnetGroupName: new dax.CfnSubnetGroup(stack, 'DAXSubnetGroup', {
      subnetGroupName: 'dax-subnet-group',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId),
    }).subnetGroupName
  });

  return daxCluster;
} 