#!/usr/bin/python3
# -*- encoding: utf-8 -*-

import frida, sys, signal, json, hexdump

# Constants
TARGET_PROCESS = 'e-Passport Reader'

def message_handler(message, data):
  if message['type'] == 'error':
    print('[E]', message)
  
  if message['type'] == 'send':
    hexdump.hexdump(data)      

def sig_handler(sig, frame):
  print('\n[!] Exiting')
  sys.exit(0)

if __name__ == '__main__':
  signal.signal(signal.SIGINT, sig_handler)
  print('[H] Attaching to USB device')
  device = frida.get_usb_device()
  print(f'[H] Attaching to target process: {TARGET_PROCESS}')
  process = device.attach(TARGET_PROCESS)
  with open('raw_apdu.js') as jscode:
    script = process.create_script(jscode.read())
  script.on('message', message_handler)
  print(f'[H] Loading JS Frida module')
  script.load()

  sys.stdin.read()