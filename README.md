Serious Sam: The Sequel (Public Beta)
-------------------------------------
[![Build status](https://github.com/tx00100xt/SE1-TSE-Sequel/actions/workflows/cibuild.yml/badge.svg)](https://github.com/tx00100xt/SE1-TSE-Sequel/actions/)
[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/tx00100xt/SE1-TSE-Sequel)](https://github.com/tx00100xt/SE1-TSE-Sequel/releases/tag/v1.1.0-beta)
[![Github downloads](https://img.shields.io/github/downloads/tx00100xt/SE1-TSE-Sequel/total.svg?logo=github&logoColor=white&style=flat-square&color=E75776)](https://github.com/tx00100xt/SE1-TSE-Sequel/releases/)

### Author modification: JesterOfDestiny

https://jesterofdestiny.itch.io/serious-sam-the-sequel-public-beta

#### Description from the author:
While Croteam is busy making more prequels, I decided to make that sequel we've all been waiting for. It's time for Mental to die.

"The Sequel" is a mod for classic Second Encounter, that adds loads of new features such as: 4 new weapons (Ghost Buster, Plasma Thrower, Devastator, Hydrogun), new gameplay mechanics (enhanced difficulty modifiers, secondary fire for some of the weapons), a huge new enemy roster (complete with advanced gibbing) and new tools for mappers (two new types of enemy spawner, new features for old entities and several new entities). This demo comes with its own demo map, along with an unfinished map pack, that's going to form the third episode of the upcoming four episode campaign. You can also check out the manual for story context and general tutorial for the new features and entities.

That is all. Full version coming in about a year or two. Have fun until then.
Credits:

Mod created by JesterOfDestiny

**Coding:**  
 - JesterOfdestiny, SeriousAlexej, Rakanishu, Dreamy Cecil, Uni Musuotankarep

**Apping:**  
 - JesterOfdestiny, Rakanishu (demo map)

**Modelling:**  
 - T-ReXx, Ar2R-devil-PiNKy, Dr. Trigger, zorgpro2013, RCK5_WSG45.DOS, LevC, Kote, Mazuto, Rakanishu, Kirill Kotliar, Ded Kadath, VadikZ, OmiTheYellow, Row Video Games, drinfested, KingJohaan, coremort, MaxBugor, JesterOfDestiny, ThinkingOnPause, LG_Labian, ervislilaj, shiva3d, Constantin Os, Kelli Ray, God Appeasers, Poly by Google

**Music:**  
 - Valery "Senmuth" Androsov, Aim To Head

**Sound design:**  
 - JesterOfDestiny, Mazzelmi, Maxsis_Specifications

**Textures:**  
 - JesterOfDestiny, Nifran Tay, Space Engine, Dall-E and other assorted AI image generators, RCK5_WSG45.DOS

**Additional:**
 - Zdzichu for the Alpha port
 - The303 for LithUnwrap
 - Andrey for the Blender tools
 - noam 2000 for the SS2 enemy ports

**Special thanks to:**  
 - Serious MkBewe, Thanadrax and everyone in the Serious Sam Classics Discord group  

![OW1](https://img.itch.zone/aW1hZ2UvMjM4NTMxMy8xNDE3NDk4OC5qcGc=/original/e7ixgy.jpg)

![OW2](https://img.itch.zone/aW1hZ2UvMjM4NTMxMy8xNDE3NDk4OS5qcGc=/original/Em8C77.jpg)

![OW1](https://img.itch.zone/aW1hZ2UvMjM4NTMxMy8xNDE3NDk5MC5qcGc=/original/ml1qXx.jpg)

![OW2](https://img.itch.zone/aW1hZ2UvMjM4NTMxMy8xNDE3NDk5MS5qcGc=/original/%2BEgNni.jpg)

![OW1](https://img.itch.zone/aW1hZ2UvMjM4NTMxMy8xNDE3NDk5Mi5qcGc=/original/ZcSwwj.jpg)

![OW2](https://img.itch.zone/aW1hZ2UvMjM4NTMxMy8xNDE3NDk5OC5qcGc=/original/%2Bqa1UM.jpg)


If you need a modification for game version 1.07, you can download it on the author's page.

This mod required https://github.com/tx00100xt/SeriousSamClassic or https://github.com/tx00100xt/SeriousSamClassic-VK to run.  
And https://github.com/tx00100xt/SE1-ParametricParticles  
**Note:**  
The release already contains the necessary libraries and resources from:  
https://github.com/tx00100xt/SE1-ParametricParticles

Download [SamTSE-Sequel.tar.xz] archive and unpack to  SeriousSamClassic/SamTSE/ directory.  
You can also download the archive using curl or wget:
```
wget https://archive.org/download/sam-tse-sequel/SamTSE-Sequel.tar.xz
```

Building Serious Sam: The Sequel
--------------------------------   

### Linux

Type this in your terminal:

```
git clone https://github.com/tx00100xt/SE1-TSE-Sequel.git SE1-TSE-Sequel
cd SE1-TSE-Sequel/Sources
mkdir build && cd build
cmake ..
make -j4
make install
```
After that , libraries will be collected in the Mods directory .   
Copy them to SeriousSamClassic/SamTSE/Mods/Sequel/Bin folder.

### Windows
* This project can be compiled starting from Windows 7 and higher.

1. Download and Install [Visual Studio 2015 Community Edition] or higher.
2. Download and Install [Windows 10 SDK 10.0.14393.795] or other.
3. Open the solution in the Sources folder, select Release x64 or Release Win32 and compile it.

Supported Architectures
----------------------
* `x86`

Supported OS
-----------
* `Linux`
* `Windows`

### Build status
|CI|Platform|Compiler|Configurations|Platforms|Status|
|---|---|---|---|---|---|
|GitHub Actions|Windows, Ubuntu, FreeBSD, Alpine, Raspberry PI OS Lite, macOS|MSVC, GCC, Clang|Release|x86, x64, armv7l, aarch64, riscv64, ppc64le, s390x|![GitHub Actions Build Status](https://github.com/tx00100xt/SE1-TSE-Sequel/actions/workflows/cibuild.yml/badge.svg)

You can download a the automatically build based on the latest commit.  
To do this, go to the [Actions tab], select the top workflows, and then Artifacts.

License
-------

* Serious Engine v1.10 is licensed under the GNU GPL v2 (see LICENSE file).


[SamTSE-Sequel.tar.xz]: https://drive.google.com/file/d/1np0R9wQOWa7ajyXR-oUmEcuaQfWMykbF/view?usp=sharing "Serious Sam Classic Sequel Mod"
[Visual Studio 2015 Community Edition]: https://go.microsoft.com/fwlink/?LinkId=615448&clcid=0x409 "Visual Studio 2015 Community Edition"
[Windows 10 SDK 10.0.14393.795]: https://go.microsoft.com/fwlink/p/?LinkId=838916 "Windows 10 SDK 10.0.14393.795"
[Actions tab]: https://github.com/tx00100xt/SE1-TSE-Sequel/actions "Download Artifacts"
