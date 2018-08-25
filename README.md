# most Basic Media Center

A media center with only the essential functions.

The inspiration for this project comes from my experience using [Kodi](https://kodi.tv/), which is a very feature rich, cross platform media center application with available add-ons for every imaginable use case. I used kodi for years running on different machines connected to my good ol' CRT Tv.

I couldn't get used to the cluttered user interface, which is impossible to control from the remote control app without looking down at it. My other problem is I couldn't find a skin which is easily readable from a distance on my stunning low-res screen.

  

I'm fine with editing config files from time to time, what I'm not fine with is getting lost in a user interface every time I attempt to use it. So the project goals has been born:

- be able to list and open files

- control the GUI and playback from my phone without looking down

- stutter free playback on raspberry pi

- don't add any unnecessary functions

## Install
This app uses external video players to open the videos and then controls them via terminal in the background. [Mplayer](http://www.mplayerhq.hu) and [omxplayer](https://elinux.org/Omxplayer) are supported. On the raspberry pi omxplayer is required for hardver acceleration and thus for smooth playback. 

**Windows** 
On windows mplayer is has to be added to Environment variables. (Right click 'This PC' > Properties > Advanced system settings > Environment Variables... > System variables (lower box) > Path > add the directory of mplayer.exe)

**Linux**
```
sudo apt-get install mplayer
```
on raspberry pi:
```
sudo apt-get install omxplayer
```
