import URI from "urijs";

/**
 * Converts Bun asset import into a BunSai compatible URL.
 *
 * Must **NOT** be used in module scope.
 *
 *  **NOTE:** In some cases this function generates incorrect client side paths. Use {@link Asset.abs}
 *
 * @example
 * import logo from "./assets/logo.png";
 *
 * asset(logo); // /__bunsai__/assets/logo.png
 */
export default function createAssetGetter(meta: ImportMeta): Asset {
  const sourceURI = new URI(meta.url);

  if (sourceURI.protocol() == "file") {
    const asset = (asset: string) => {
      const rootURI = new URI(
        "file://" + $global.$$$bunsai_build_root.replaceAll("\\", "/") + "/"
      );

      const assetURI = new URI("file://" + asset.replaceAll("\\", "/"));

      const relative = assetURI.relativeTo(rootURI.href()).pathname();

      return URI.joinPaths(
        "/",
        $global.$$$bunsai_build_prefix,
        "/",
        relative
      ).pathname();
    };

    asset.abs = asset;

    return asset;
  }

  const asset = (asset: string) => {
    return URI.joinPaths(
      "/",
      sourceURI.segment(0) || "/",
      "/",
      new URI(asset).absoluteTo("/")
    ).pathname();
  };

  asset.abs = (asset: string) =>
    new URI(asset).absoluteTo(sourceURI).pathname();

  return asset;
}

/**
 * Converts Bun asset import into a BunSai compatible URL.
 *
 * Must **NOT** be used in module scope.
 *
 * **NOTE:** In some cases this function generates incorrect client side paths. Use {@link Asset.abs}
 *
 * @example
 * import logo from "./assets/logo.png";
 *
 * asset(logo); // /__bunsai__/assets/logo.png
 */
export interface Asset {
  (asset: string): string;

  /**
   * In some cases the main function generates incorrect client side paths.
   *
   * `abs` has a different client side implementation to handle assets that were not "pushed" to
   * a chunk (i.e. imported by multiple files).
   */
  abs(asset: string): string;
}

const $global: any = typeof global != "undefined" ? global : {};