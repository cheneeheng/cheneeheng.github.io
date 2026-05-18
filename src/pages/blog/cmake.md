---
layout: ../../layouts/BlogPost.astro
title: CMake
date: 2023-06-12
description: A short primer on CMake — what it is, how to use it, and the bare minimum to get a C++ project building.
---

## What is CMake?

- [CMake](https://cmake.org/) is a compiler toolkit that generates the required makefiles to compile C/C++/C#/Cuda (C-based programming languages) codes.
- Makefile can be viewed as a form of configuration/setting file to tell the compiler how to compile a program from codes.
- A compiler is a program that translates codes to machine instructions for the processing hardware, aka microprocessor/CPU.
- It is cross-platform compatible, meaning it can generate the required makefiles for Windows/MacOS/Linux with the same cmake script known as `CMakeLists.txt`.
- It only looks for `CMakeLists.txt` !!!

## So how do I use CMake?

```
########################
#   FOLDER STRUCTURE   #
########################
project/
├── build/
├── install/
├── include/
|   └── someheader.hpp
├── dummy.cpp
├── dummy.hpp
└── CMakeLists.txt
```

```cmake
######################
#   CMakeLists.txt   #
######################
# Minimum cmake version
cmake_minimum_required(VERSION 3.26.0)
# Project uses C++
project(<INSERT_PROJECT_NAME> LANGUAGES CXX)
# Use C++17
set(CMAKE_CXX_STANDARD 17)
# Require C++17 to be used
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# Prevent the use of compiler specific extension
set(CMAKE_CXX_EXTENSIONS OFF)
# Creates an executable binary file <INSERT_EXE_FILENAME>
add_executable(<INSERT_EXE_FILENAME> dummy.cpp)
# Links external libraries to the binary file <INSERT_EXE_FILENAME>
target_link_libraries(<INSERT_EXE_FILENAME> PUBLIC <INSERT_LIBRARY_NAME>)
# Points to the directory where the header files are located
# for the binary file <INSERT_EXE_FILENAME>
target_include_directories(<INSERT_EXE_FILENAME> PUBLIC
                           "${CMAKE_SOURCE_DIR}/include")
```

Assume we have the above folder structure and `CMakeLists.txt`, we can use cmake to compile the project. To compile we follow the following steps:

- `cd project`
  - go to the root "project" folder.
- `cmake -S . -B build -DSOME_DEFINITION=something`
  - performs the "build" operation. Generates cmake cache files (with make files).
  - `-S` specifies the source directory, which in this case is `.` because of the first step.
  - `-B` specifies the directory to generate cmake cache, which in this case is the folder called `build`.
  - `-DXXX=YYYY`: `XXX` refers to a build flag, while `YYYY` refers to the value of the flag.
- `cmake --build build --cfg <Release/Debug>`
  - builds and compiles (invokes `make` under the hood) the project.
  - `--build` specifies the directory to generate cmake cache and binary files (`build`).
  - `<Release/Debug>` determines whether to compile in release or debug mode. We need Debug mode to run debuggers / set breakpoints.
- `cmake --install install --cfg <Release/Debug>`
  - installs the compiled project into a folder. The folder will contain all the binaries, headers, and libraries needed to run the executable.
  - `--install` specifies the install directory (`install`).
  - `<Release/Debug>` as above.

### Good to know

- You can create a nested cmake structure by placing a `CMakeLists.txt` in each child folder of the project root. This gives you "compartmentalized" compilation configuration per folder rather than one giant `CMakeLists.txt`. It pays off once the project grows.

## Is that all there is to CMake?

Of course not. There is an entire [website](https://cmake.org/cmake/help/latest/) dedicated to it. But the info here is the bare minimum to get you started. If something goes wrong, cmake usually tells you which line caused the error and you can probably solve it from StackOverflow.

## References

1. Official cmake documentation: <https://cmake.org/cmake/help/latest/>
2. Basic cmake syntax: <https://cmake.org/cmake/help/latest/manual/cmake.1.html>
3. Cmake tutorials: <https://coderefinery.github.io/cmake-workshop/>
4. Cmake tutorials: <https://matgomes.com/category/cmake/>
