#ifndef COMMAND_H
#define	COMMAND_H

#include <avr/io.h>
#include <string.h>

#define COMMAND_SIZE 5
#define COMMAND_MAX_NAME_LENGTH 20

struct Command {
  void *addr;
  char name[COMMAND_MAX_NAME_LENGTH];
};

uint8_t command_define(void *fp, char name[COMMAND_MAX_NAME_LENGTH]);
uint8_t command_process(char *cmd_name);
void command_list(void);

#endif	/* COMMAND_H */

