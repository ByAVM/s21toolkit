import { resolve, parse, join } from "path";
import { writeJSON, readdirSync, ensureDir, remove } from "fs-extra";

import { Command } from "../Command";
import { Config } from "../../modules/Config";
import { execSync } from "child_process";
import { updateHash } from "../../modules/CommonTools";

export class CreateCommand extends Command {
  protected async run(repo: string, path?: string) {
    const projectName = parse(repo).name;
    const projectPath = path ? resolve(path) : join(".", projectName);
    const configPath = join(projectPath, Config.CONFIG_PATH);

    await ensureDir(projectPath);

    if (readdirSync(projectPath).length) {
      throw new Error("Project directory is not empty");
    }

    execSync(`git clone "${repo}" "${projectPath}"`);

    await writeJSON(configPath, Config.create(repo), { spaces: 2 });

    await remove(join(".", ".git"));

    await updateHash(repo, projectPath)

    console.info("Done");
  }
}
