declare module 'iyzipay' {
  const Iyzipay: any;
  export default Iyzipay;
}
declare module 'iyzipay/lib/utils' {
  const utils: { calculateHmacSHA256Signature(params: unknown[], secretKey: string): string };
  export default utils;
}
