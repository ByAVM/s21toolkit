import { Config } from "../../modules/Config";

export class Command {
  protected config: Config;

  constructor(config?: Config) {
    this.config = config || new Config();
  }

  protected run(...args: unknown[]) {
    throw new Error("Not implemented");
  }

  protected checkConfig() {
    if (!this.config.isInitialized()) {
      throw new Error("Config is not initialized");
    }
  }

  exec(...args: unknown[]) {
    try {
      this.run(args);
    } catch (error) {
      console.error((error as Error).message);
    }
  }
}
