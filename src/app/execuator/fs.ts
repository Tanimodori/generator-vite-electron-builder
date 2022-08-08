import fs from 'fs';

export const transformFile = async (
  path: string,
  transform: (src: string) => string | Promise<string>,
) => {
  const buffer = await fs.promises.readFile(path);
  const src = buffer.toString();
  const dest = await transform(src);
  await fs.promises.writeFile(path, dest);
};
