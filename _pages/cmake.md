---
author_profile: true
layout: single
permalink: /cmake/
title: "CMake"
last_modified_at: 2023-06-12T22:32:00-00:00
toc: true
---

\#TODO: INSERT A FIGURE

## What is CMake?
[CMake](https://cmake.org/) is a compiler toolkit that generates the required make files to compile C/C++/C#/Cuda (C-based programming languages) codes. It is cross-platform compatible, meaning it can generate the required make files for Windows/MacOS/Linux with the same cmake script known as `CMakeLists.txt`.

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
```
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
Assume we have the above folder structure and `CMakeLists.txt`, we can use cmake to compile the 'project'. To compile we follow the following steps [2]:
- `cd project`
  - go to the root "project" folder
- `cmake -S . -B build -DSOME_DEFINITION=something`
  - performs "build" operation. Generates cmake cache files (with make files).
  - `-S` specify the source directory, which in this case is '.' because of the first step.
  - `-B` specify the directory to generate cmake cache, which in this case is the folder called "build".
  - `-DXXX=YYYY`: XXX refers to a build flag, while YYY refers to the value of the flag.
- `cmake --build build --cfg <Release/Debug>`
  - builds and compiles (invokes `make` command) the project.
  - `--build` specify the directory to generate cmake cache & binary files, which in this case is the folder called "build".
  - <Release/Debug> determines whether to compile the code in release or debug mode. As the name implies, we need to compile in Debug mode to run debuggers/setting breakpoints and pause the program at breakpoint.
- `cmake --install install --cfg <Release/Debug>`
  - installs the compiled project into a folder. The folder will contain all the binaries/headers/libraries needed to run an executable file.
  - `--install` specify the directory to install the compiled project, which in this case is the folder called "install".
  - <Release/Debug> determines whether to compile the code in release or debug mode. As the name implies, we need to compile in Debug mode to run debuggers/setting breakpoints and pause the program at breakpoint.


## Is that all there is to CMake?
Of course no. There is an entire [website](https://cmake.org/cmake/help/latest/) [1] dedicated to it !!! But the info here are the bare basic to get you started with cmake. If something goes wrong, cmake usually tells you which line causes the error and you can probably solve it from StackOverflow.

## References
[1] Official cmake documentation: [https://cmake.org/cmake/help/latest/](https://cmake.org/cmake/help/latest/)  
[2] Basic cmake syntax: [https://cmake.org/cmake/help/latest/manual/cmake.1.html](https://cmake.org/cmake/help/latest/manual/cmake.1.html)  
[3] Cmake tutorials: [https://coderefinery.github.io/cmake-workshop/](https://coderefinery.github.io/cmake-workshop/)
[4] Cmake tutorials: [https://matgomes.com/category/cmake/](https://matgomes.com/category/cmake/)