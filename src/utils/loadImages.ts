export async function loadImages(
  imageModules: Record<string, () => Promise<{ default: ImageMetadata }>>,
) {
  return Promise.all(
    Object.entries(imageModules).map(async ([path, importer]) => {
      const mod = await importer();
      return {
        ...mod.default,
      };
    }),
  );
}
