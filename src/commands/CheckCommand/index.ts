import { getLastHash, readHash } from "../../modules/CommonTools";
import { Command } from "../Command";

export class CheckCommand extends Command {

    protected async run() {
        this.checkConfig()

        const hash = getLastHash(this.config.get('template') as string)

        const currentHash = await readHash()
        
        if (currentHash !== hash) {
            console.info('Has updates')
        } else {
            console.info('Current version is up to date')
        }
    }
}
