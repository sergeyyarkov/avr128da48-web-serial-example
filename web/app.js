var EOT = '\u0004';

class SerialPortHandler {
  constructor(options, onConnect, onDisconnect) {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.options = options;
    this.port = null;
    this.isOpened = false;
    this.#setupListeners();
  }

  async open() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open(this.options);

      this.port = port;
      this.isOpened = true;

      return this.port.getInfo();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async close() {
    await this.port.close();
    this.isOpened = false;
  }

  async write(data) {
    const writer = this.port.writable.getWriter();
    const encoded = this.encoder.encode(data);
    await writer.write(encoded);
    writer.releaseLock();
  }

  async read() {
    const reader = this.port.readable.getReader();
    let chunks = '';
    while (true) {
      const { value, done } = await reader.read();
      const decoded = this.decoder.decode(value);

      chunks += decoded;

      if (done || decoded.includes('\u0004')) {
        console.log('Reading done.');
        reader.releaseLock();
        break;
      }
    }

    return chunks;
  }

  #setupListeners() {
    navigator.serial.addEventListener('connect', this.onConnect);
    navigator.serial.addEventListener('disconnect', this.onDisconnected);
  }
}

class Application {
  constructor(root) {
    if (!('serial' in navigator)) {
      console.error('Web Serial API is not supported in your browser.');
      return;
    }

    this.serialPortHandler = new SerialPortHandler({ baudRate: 9600 });

    /**
     * DOM Elements
     */
    this.$root = root;
    this.$connectButton = this.$root.querySelector('#connect');
    this.$disconnectButton = this.$root.querySelector('#disconnect');
    this.$terminalForm = this.$root.querySelector('#terminal_form');
    this.$serialLog = this.$root.querySelector('#serial_log');
    this.$status = this.$root.querySelector('#status');
    this.$vendorId = this.$root.querySelector('#vendorId');
    this.$productId = this.$root.querySelector('#productId');

    this.#setupEvents();
  }

  /**
   * Handlers for connecting, disconnecting and sending a command
   */
  #setupEvents() {
    this.$connectButton.addEventListener('click', this.#connectHandler.bind(this));
    this.$disconnectButton.addEventListener('click', this.#disconnectHandler.bind(this));
    this.$terminalForm.addEventListener('submit', this.#submitHandler.bind(this));
  }

  /**
   * Open serial port and notify user of connection status
   * @returns {Promise<void>}
   */
  async #connectHandler() {
    try {
      if (this.serialPortHandler.isOpened) return;
      const info = await this.serialPortHandler.open();
      console.log('Port opened: ', info);
      this.$terminalForm.elements.input.removeAttribute('disabled');
      this.$vendorId.textContent = '0x' + info.usbVendorId.toString(16);
      this.$productId.textContent = '0x' + info.usbProductId.toString(16);
      this.$status.textContent = 'CONNECTED';
    } catch (error) {
      this.$status.textContent = 'ERROR';
    }
  }

  /**
   * Closes the serial port and updates the connection status.
   * @returns {Promise<void>}
   */
  async #disconnectHandler() {
    if (!this.serialPortHandler.isOpened) return;
    await this.serialPortHandler.close();
    this.$vendorId.textContent = '-';
    this.$productId.textContent = '-';
    this.$status.textContent = 'NOT CONNECTED';
  }

  /**
   * Writes data to the serial port and reads the response
   * @param {SubmitEvent} e - Form submit event
   */
  async #submitHandler(e) {
    e.preventDefault();
    const $form = e.target;
    const data = $form.elements.input.value;
    $form.reset();
    if (this.serialPortHandler.isOpened && data) {
      this.$serialLog.innerHTML += data + '\n';
      await this.serialPortHandler.write(data + '\n');
      const message = await this.serialPortHandler.read();
      this.$serialLog.textContent += message;
      this.$serialLog.textContent += '\n';
      console.log(message);
    }
    this.$serialLog.scrollTo(0, this.$serialLog.scrollHeight);
  }
}

new Application(document.getElementById('app'));
