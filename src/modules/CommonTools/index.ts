import { execSync } from "child_process";
import { ensureFile, readFile, writeFile } from "fs-extra";
import { join } from "path";
import { Config } from "../Config";

export const getLastHash = (repo: string) => {
  const result = execSync(`git ls-remote ${repo} HEAD`).toString();
  const hash = result.split(/\s/).shift();

  return hash;
};

export const writeHash = async (hash: string, root = ".") => {
  const filePath = join(root, Config.HASH_PATH);
  await ensureFile(filePath);
  await writeFile(filePath, hash);
};

export const readHash = async () => {
  const filePath = join(".", Config.HASH_PATH);
  await ensureFile(filePath);

  const data = await readFile(filePath);

  return data.toString();
};

export const updateHash = async (repo: string, root = ".") => {
  const hash = await getLastHash(repo);

  if (hash) {
    await writeHash(hash, root);
  } else {
    throw new Error("Can't get fresh repo commit hash");
  }
};
