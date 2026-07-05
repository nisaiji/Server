import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { config } from "../config.js";

/**
 * A singleton instance of the AWS Secrets Manager client.
 * It is configured with the region from the application's environment configuration.
 * AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are automatically
 * picked up from environment variables by the AWS SDK.
 */
export const secretsManagerClient = new SecretsManagerClient({
  region: config.awsRegion
});
