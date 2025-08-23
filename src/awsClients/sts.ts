import { GetCallerIdentityCommand, GetCallerIdentityCommandOutput, STSClient } from "@aws-sdk/client-sts";
import { memoize } from "../shared/memoize";

/**
 * Accessor functions for the AWS "sts" service
 */
export class STS {

  private static cachedGetStsClient = memoize((profile: string) => {
    return new STSClient({ profile: profile });
  });

  private static cachedGetCallerIdentity = memoize(async (profile: string) => {
    const client = this.cachedGetStsClient(profile);
    const command = new GetCallerIdentityCommand();
    try {
      const response = await client.send(command);
      if (!response.Account) {
        throw new Error('Failed to fetch account ID from profile');
      }
      return { account: response.Account };
    } catch (ex) {
      console.error(`Failed to access profile: ${profile}`);
      throw ex;
    }
  });

  /**
   * Get the caller identity of the specified profile. If the profile is not valid,
   * reject the promise and let the caller behave appropriately.
   */
  public static async getCallerIdentity(profile: string): Promise<{ account: string }> {
    return this.cachedGetCallerIdentity(profile);
  }
}