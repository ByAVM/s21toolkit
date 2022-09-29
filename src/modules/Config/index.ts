import { readJSON } from "fs-extra";
import { join } from "path";
import { ToolkitConfig } from "./interfaces";

export class Config {
  static HASH_PATH = ".s21toolkithash";
  static CONFIG_PATH = ".s21toolkitrc";

  private config: ToolkitConfig = {};
  private initialized = false;

  /** Инициализирует конфигурацию */
  async init() {
    const configPath = join(".", Config.CONFIG_PATH);
    try {
      this.config = await readJSON(configPath);
    } catch (e) {
      throw new Error(`${Config.CONFIG_PATH} file not found`);
    }

    if (!this.validateConfig()) {
      throw new Error("Configuration not valid");
    }

    this.initialized = true;
  }

  get(key: keyof ToolkitConfig) {
    const value = this.config[key];

    if (value === undefined) {
      throw new Error(`Value "${key}" is not configured`);
    }

    return value;
  }

  private validateConfig() {
    const checkType = (
      value: ToolkitConfig[keyof ToolkitConfig],
      type: "boolean" | "string"
    ) => {
      return typeof value === type || typeof value === "undefined";
    };

    return (
      (Array.isArray(this.config.files) ||
        typeof this.config.files === "undefined") &&
      checkType(this.config.updateConfig, "boolean") &&
      checkType(this.config.updateDependencies, "boolean") &&
      checkType(this.config.template, "string")
    );
  }

  isInitialized() {
    return this.initialized;
  }

  static create(repo: string): ToolkitConfig {
    return {
      template: repo,
      files: [],
      updateConfig: false,
      updateDependencies: true,
      deletePackages: false,
    };
  }
}
