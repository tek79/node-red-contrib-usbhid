# node-red-contrib-usbhid

A node-hid (USB HID device access library) wrapper for nodered

Credit goes to node-hid. 

You can look up either git to find information on setup, Prerequisites and Platforms to get the node working:
https://github.com/node-hid/node-hid


### Prerequisites:

* [Node.js](https://nodejs.org/) v0.8 - v4.x+
* Mac OS X 10.8, Linux (kernel 2.6+), and Windows XP+
* libudev-dev, libusb-1.0-0-dev (if Linux, see Compile below)
* [git](https://git-scm.com/)

node-hid uses node-pre-gyp to store pre-built binary bundles, so usually no compiler is needed to install.

Platforms we pre-build binaries for:
- Mac OS X x64: v0.10, v0.12, v4.2.x
- Windows x64 & x86: v0.10, v0.12, v4.2.x
- Linux Debian/Ubuntu x64: v4.2.x
- Raspberry Pi arm: v4.2.x

## How to Use

### HID ( USB ) read/write access for non root users ( in my case for user pi on an raspberry pi 4 running nodered )

The Pd-extended [hid] object allows you to access Human Interface Devices such as mice, keyboards, and joysticks. However, in most Linux distributions, these devices are setup to where they cannot be read/written directly by Pd unless you run it as root.

Running a non-system process as root is considered a security risk, so an alternative is to change the permissions of the input devices so that pd can read/write them.

```
sudo mkdir -p /etc/udev/rules.d
sudo nano /etc/udev/rules.d/51-blink1.rules
```
Now add the following rules to /etc/udev/rules.d/51-blink1.rules:

```
SUBSYSTEM=="input", GROUP="input", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="27b8", ATTRS{idProduct}=="01ed", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="27b8", ATTRS{idProduct}=="01ed", MODE="0666", GROUP="plugdev"
```

And replace `27b8` and `01ed` with your device idVendor/idProduct or add this generic rules for ALL devices:

```
SUBSYSTEM=="input", GROUP="input", MODE="0777"
SUBSYSTEM=="usb", MODE:="777", GROUP="plugdev"
KERNEL=="hidraw*", MODE="0777", GROUP="plugdev"
```

Reload udev rules

```
sudo udevadm control --reload-rules
```

Unplug and plug back your HID device

Then create an "input" group and add yourself to it:

```
sudo groupadd -f input
sudo gpasswd -a $USER input
```
Reboot your machine for the rules to take effect.
Your nodejs / nodered has now FULL ACCESS !! to you usb devides. Feel free to adjust the permissions to fit your needs.

### Parse keys

The buffer that is sent to the output needs to be parsed in order to detect the key pressed. To detect the key you can use a function node with this code:

```js
var keymap = {'04':'A','05':'B','06':'C','07':'D','08':'E','09':'F','0a':'G','0b':'H','0c':'I','0d':'J','0e':'K','0f':'L','10':'M','11':'N','12':'O','13':'P','14':'Q','15':'R','16':'S','17':'T','18':'U','19':'V','1a':'W','1b':'X','1c':'Y','1d':'Z','1e':'1','1f':'2','20':'3','21':'4','22':'5','23':'6','24':'7','25':'8','26':'9','27':'0','00':''}
var hex = Buffer.from([msg.payload[3]]).toString('hex');

var key = keymap[hex]
```


For more info check:

- https://github.com/node-hid/node-hid/issues/228#issuecomment-408710289
- https://github.com/imyelo/hid-scanner
- https://github.com/imyelo/hid-scanner/blob/master/lib/keymap.raw.json
