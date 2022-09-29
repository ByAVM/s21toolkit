#! /usr/bin/env node

import { program } from "commander";
import { CheckCommand } from "./commands/CheckCommand";
import { CreateCommand } from "./commands/CreateCommand";
import { UpdateCommand } from "./commands/UpdateCommand";
import { Config } from "./modules/Config";

/**
 * Утилита для обновления базовой конфигурации проекта.
 * Запрашивает актуальную версию шаблона и обновляет конфигурацию,
 * в соответствие с шаблоном.
 *
 * Список команд:
 * create - инициализирует новый проект
 * check - проверяет наличие обновлений
 * update - выполняет обновление
 * help - выводит подсказку
 */


program
  .command("create")
  .argument('<repo>', 'адрес репозитория шаблона')
  .argument('[path]', 'путь для проекта')
  .description("инициализирует новый проект")
  .action((repo: string, path?: string) => {
    const createCommand = new CreateCommand()
    createCommand.exec(repo, path)
  });

program
  .command('check')
  .description('проверяет наличие обновлений шаблона')
  .action(async () => {
    const config = new Config()
    await config.init();

    const checkCommand = new CheckCommand(config)
    checkCommand.exec()
  })

program
  .command('update')
  .description('выполняет обновление')
  .action(async () => {
    const config = new Config()
    await config.init();

    const updateCommand = new UpdateCommand(config)
    updateCommand.exec()
  })

program.parse(process.argv);
