#define F_CPU           (4000000UL)
#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <string.h>
#include "command.h"
#include "usart.h"

#define BUFFER_SIZE     20

char buffer[BUFFER_SIZE];
volatile uint8_t buff_idx = 0;

void led_toggle(void);
void hello_world(void);

ISR(USART1_RXC_vect) {
  char c;
  c = USART1.RXDATAL;

  if (c != ' ' && c != '\n' && c != '\r') {
    buffer[buff_idx++] = c;
  }

  if (c == '\n') {
    command_process(buffer);
    buff_idx = 0;
    memset(buffer, 0, strlen(buffer));
  }
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

  while (1) {
  }
}

void led_toggle(void) {
  PORTC.OUTTGL = PIN6_bm;
}

void hello_world(void) {
  USART1_SendString("Hello world!\n");
}