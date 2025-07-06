#!/usr/bin/env python3

# joystick_RasPi4.py - Joystick movmnt read
# Reads a joystick connected to an MCP3008 ADC via I2C on a Raspberry Pi


import smbus
import time

# Setup
bus = smbus.SMBus(1)

# Run this to detect the device: sudo i2cdetect -y 1

# For example:
# address = 0x48
address = ""  # Replace with your detected address


def read_channel(channel):
    if channel > 3 or channel < 0:
        return -1
    bus.write_byte(address, 0x40 | channel)
    bus.read_byte(address)  # Dummy read (first read is unreliable)
    return bus.read_byte(address)


try:
    while True:
        x_val = read_channel(0)  # AIN0 (VRx)
        y_val = read_channel(1)  # AIN1 (VRy)

        # Normalize to -1 to 1 (optional)
        x = (x_val - 128) / 128
        y = (y_val - 128) / 128

        print(f"Joysticks = X:{x:.2f} and Y:{y:.2f}")
        time.sleep(0.2)


except KeyboardInterrupt:
    print("Exiting...")
