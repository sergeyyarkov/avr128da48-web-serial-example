#include <avr/io.h>
#include <avr/interrupt.h>
#include <string.h>
#include "constants.h"
#include "command.h"
#include "usart.h"

char buffer[BUFFER_SIZE];
volatile uint8_t buff_idx = 0;

void led_toggle(void);
void hello_world(void);

ISR(USART1_RXC_vect) {
  if (buff_idx > BUFFER_SIZE) buff_idx = 0;
  buffer[buff_idx] = USART1.RXDATAL;
  buff_idx++;
}

void MCU_Init_Ports(void) {
  /* led pin PC6 to output */
  PORTC.DIRSET = PIN6_bm;
}

int main(void) {
  MCU_Init_Ports();
  USART1_Initialize();
  sei();

  command_define(led_toggle, "led_toggle");
  command_define(hello_world, "hello");
  command_define(command_list, "list");

  while (1) {
    if (buff_idx >= 1) {
      if (buffer[buff_idx - 1] == '\n') {
        buffer[buff_idx - 1] = '\0';
        command_process(buffer);
        buff_idx = 0;
      }
    }
  }
}

void led_toggle(void) {
  PORTC.OUTTGL = PIN6_bm;
}

void hello_world(void) {
  USART1_SendString("Hello world!\n");
}