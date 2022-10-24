#include "constants.h"

#ifndef USART_H
#define	USART_H
#define BAUD_RATE   (9600)
#define USART1_BAUD_RATE(BAUD_RATE) ((float)(64 * F_CPU / (16 * (float)BAUD_RATE)) + 0.5)

#include <avr/io.h>
#include <stdio.h>
#include <string.h>

void USART1_Initialize(void);
void USART1_SendChar(char c);
void USART1_SendString(char *str);

#endif	/* USART_H */

