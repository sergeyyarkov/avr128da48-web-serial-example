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
    if ('serial' in navigator) {
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
    } else {
      console.error('Web Serial API is not supported in your browser.');
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
    const chunks = [];
    while (true) {
      const { value, done } = await reader.read();
      const decoded = this.decoder.decode(value);

      chunks.push(decoded);

      if (done || decoded.includes('\u0004')) {
        console.log('done');
        reader.releaseLock();
        break;
      }
    }

    return chunks.join('');
  }

  #setupListeners() {
    if ('serial' in navigator) {
      navigator.serial.addEventListener('connect', this.onConnect);
      navigator.serial.addEventListener('disconnect', this.onDisconnected);
    }
  }
}

const $connectButton = document.getElementById('connect');
const $disconnectButton = document.getElementById('disconnect');
const $terminalForm = document.getElementById('terminal_form');
const $serialLog = document.getElementById('serial_log');
const $status = document.getElementById('status');
const $vendorId = document.getElementById('vendorId');
const $productId = document.getElementById('productId');

const onConnected = (e) => console.log('device inserted!');
const onDisconnected = (e) => console.log('device ejected!');

const serialPortHandler = new SerialPortHandler(
  { baudRate: 9600 },
  onConnected,
  onDisconnected
);

async function onConnect() {
  try {
    if (serialPortHandler.isOpened) return;
    const info = await serialPortHandler.open();
    console.log('Port opened: ', info);
    $terminalForm.elements.input.removeAttribute('disabled');
    $vendorId.textContent = '0x' + info.usbVendorId.toString(16);
    $productId.textContent = '0x' + info.usbProductId.toString(16);
    $status.textContent = 'CONNECTED';
  } catch (error) {
    $status.textContent = 'ERROR';
  }
}

async function onDisconnect() {
  if (!serialPortHandler.isOpened) return;
  await serialPortHandler.close();
  $vendorId.textContent = '-';
  $productId.textContent = '-';
  $status.textContent = 'NOT CONNECTED';
}

async function onSend(e) {
  e.preventDefault();
  const $form = e.target;
  const data = $form.elements.input.value;
  $form.reset();
  if (serialPortHandler.isOpened && data) {
    $serialLog.innerHTML += data + '\n';
    await serialPortHandler.write(data + '\n');
    const message = await serialPortHandler.read();
    $serialLog.textContent += message;
    $serialLog.textContent += '\n';
    console.log(message);
  }
  $serialLog.scrollTo(0, $serialLog.scrollHeight);
}

$connectButton.addEventListener('click', onConnect);
$disconnectButton.addEventListener('click', onDisconnect);
$terminalForm.addEventListener('submit', onSend);

// const program1 = setInterval(async () => {
//   if (serialPortHandler.isOpened) {
//     await serialPortHandler.write('led_toggle' + '\n');
//   }
// }, 50);

// setInterval(() => {
//   clearInterval(program1);
// }, 5000);
