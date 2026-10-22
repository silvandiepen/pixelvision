// Metro turns an imported image into an asset id for `Asset.fromModule`.
declare module "*.jpg" {
  const asset: number;
  export default asset;
}
