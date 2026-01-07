#!/bin/bash
# VNC Server Startup Script
# Starts Xvfb, x11vnc, and noVNC for remote browser access

set -e

# Configuration
DISPLAY_NUM=99
VNC_PORT=5900
NOVNC_PORT=6080
RESOLUTION="1400x900x24"

# Check if already running
if pgrep -x "Xvfb" > /dev/null; then
    echo "VNC already running"
    exit 0
fi

echo "Starting VNC server..."

# Start Xvfb (Virtual Framebuffer)
Xvfb :${DISPLAY_NUM} -screen 0 ${RESOLUTION} &
sleep 2

export DISPLAY=:${DISPLAY_NUM}

# Start x11vnc
x11vnc -display :${DISPLAY_NUM} -forever -nopw -shared -rfbport ${VNC_PORT} &
sleep 2

# Start noVNC (web-based VNC client)
/usr/share/novnc/utils/novnc_proxy --vnc localhost:${VNC_PORT} --listen ${NOVNC_PORT} &
sleep 1

echo "VNC server started!"
echo "  - Display: :${DISPLAY_NUM}"
echo "  - VNC Port: ${VNC_PORT}"
echo "  - noVNC Port: ${NOVNC_PORT}"
