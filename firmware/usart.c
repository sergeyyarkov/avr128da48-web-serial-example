#include "usart.h"

void USART1_Initialize(void) {
  /* set baud rate */
  USART1.BAUD = (uint16_t) (USART1_BAUD_RATE(BAUD_RATE));

  /* set char size in a frame to 8 bit */
  USART1.CTRLC = USART_CHSIZE0_bm | USART_CHSIZE1_bm;

  /* config pins for TX and RX */
  PORTC.DIRSET = PIN0_bm;
  PORTC.DIRCLR = PIN1_bm;

  /* enable reveice complete interrupt */
  USART1.CTRLA = USART_RXCIE_bm;

  /* enable transmitter and receiver */
  USART1.CTRLB = USART_TXEN_bm | USART_RXEN_bm;

}

void USART1_SendChar(char c) {
  while (!(USART1.STATUS & USART_DREIF_bm)) {
    ;
  }

  USART1.TXDATAL = c;
}

void USART1_SendString(char *str) {
  for (size_t i = 0; i < strlen(str); i++) {
    USART1_SendChar(str[i]);
  }
}

