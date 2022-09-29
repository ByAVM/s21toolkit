import { basename, join } from "path";
import { tmpdir } from "os";
import { Command } from "../Command";
import { execSync } from "child_process";
import { copy, remove, readJSONSync, existsSync, writeJSON } from "fs-extra";
import { Config } from "../../modules/Config";
import { updateHash } from "../../modules/CommonTools";

type DependencyRecord = Record<string, string>;

export class UpdateCommand extends Command {
  private TEMP = ".s21toolkittemp";

  protected async run() {
    this.checkConfig();

    const tempDir = join(tmpdir(), this.TEMP);

    const files = this.config.get("files") as string[];
    const updateConfig = this.config.get("updateConfig") as boolean;

    execSync(`git clone ${this.config.get("template")} ${tempDir}`);

    if (updateConfig && !files.includes(Config.CONFIG_PATH)) {
      files.push(Config.CONFIG_PATH);
    }

    try {
      await Promise.all(
        files.map((file) => {
          return copy(join(tempDir, file), join(".", file), {
            filter: (filename) => {
              return updateConfig || basename(filename) !== Config.CONFIG_PATH;
            },
          });
        })
      );

      if (
        this.config!.get("updateDependencies") &&
        !files.includes("package.json")
      ) {
        console.info("Updating dependencies");
        await this.updateDependencies();
        console.info("Updating dependencies complete");
      }

      await updateHash(this.config.get("template") as string);

      console.info("Update complete");
    } catch (e) {
      console.error("Update failed");
      console.error((e as Error).message);
    }

    await remove(tempDir);
    console.info("Temp removed");
  }

  private async updateDependencies() {
    const tempDir = join(tmpdir(), this.TEMP);
    const currentPackageJsonPath = join(".", "package.json");
    const updatePackageJsonPath = join(tempDir, "package.json");

    if (!existsSync(updatePackageJsonPath)) {
      throw new Error("New package.json not provided");
    }

    if (!existsSync(currentPackageJsonPath)) {
      await copy(updatePackageJsonPath, currentPackageJsonPath);
      return;
    }

    const currentPackageJson = readJSONSync(currentPackageJsonPath);
    const updatePackageJson = readJSONSync(updatePackageJsonPath);

    const syncDeps = (
      currentDeps?: DependencyRecord,
      updateDeps?: DependencyRecord
    ) => {
      if (currentDeps && updateDeps) {
        const updateDepsEntries = Object.entries<string>(updateDeps);

        updateDepsEntries.forEach(([packageName, version]) => {
          currentDeps[packageName] = version;
        });

        if (this.config!.get("deletePackages")) {
          const currentDepsEntries = Object.entries(currentDeps);

          currentDepsEntries.forEach(([packageName]) => {
            if (!updateDeps[packageName]) {
              delete currentDeps[packageName];
            }
          });
        }
      }
    };

    syncDeps(currentPackageJson.dependencies, updatePackageJson.dependencies);
    syncDeps(
      currentPackageJson.devDependencies,
      updatePackageJson.devDependencies
    );
    syncDeps(
      currentPackageJson.peerDependencies,
      updatePackageJson.peerDependencies
    );

    await writeJSON(currentPackageJsonPath, currentPackageJson, {
      spaces: 4,
    });
  }
}
