export class AccessToken {
  constructor (private readonly value: string) {}

  static get expirationInMs(): number {
    // 1 s = 1000 ms
    // 1s * 60 = 1m
    // 1m * 30 = 30m
    return 30 * 60 * 1000
  }
}
