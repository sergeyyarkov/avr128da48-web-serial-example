#include "command.h"
#include "usart.h"

struct Command commands[COMMAND_SIZE];
uint8_t cmd_idx = 0;

uint8_t command_define(void *fp, char name[COMMAND_MAX_NAME_LENGTH]) {
  size_t name_length = strlen(name);
  if (name_length > COMMAND_MAX_NAME_LENGTH) {
    return 0;
  }

  if (cmd_idx >= COMMAND_SIZE) {
    cmd_idx = 0;
  }

  struct Command command;
  command.addr = fp;
  strcpy(command.name, name);
  commands[cmd_idx++] = command;
  return 1;
}

uint8_t command_process(char *cmd_name) {
  uint8_t i = 0;

  do {
    if (strcmp(cmd_name, commands[i].name) == 0) {
      int (*execute)();
      execute = commands[i].addr;
      execute();
      USART1_SendString("[LOG]: Command completed successfully with code \"0\".\n");
      USART1_SendChar(EOT);
      return 0;
    }
  } while (i++ < COMMAND_SIZE);

  USART1_SendString("[LOG]: Invalid command name!\n");
  USART1_SendChar(EOT);

  return 1;
}

void command_list(void) {
  USART1_SendString("[LOG]: List of available commands:\n");
  for (uint8_t i = 0; i < COMMAND_SIZE; i++) {
    if (commands[i].addr) {
      USART1_SendChar((i + 1) + '0');
      USART1_SendString(". ");
      USART1_SendString(commands[i].name);
      USART1_SendChar('\n');
    }
  }
}
