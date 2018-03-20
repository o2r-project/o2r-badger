# Badger demo

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1199272.svg)](https://doi.org/10.5281/zenodo.1199272)

This repository contains demo data and means to download the required software to enhance research websites with badges for reproducible research papers.
It includes a test dataset (see directory `./data`) and automated steps to build and execute the required software components, namely the [`o2r-muncher`](https://github.com/o2r-project/o2r-muncher) web service to provide access to [ERC](https://github.com/o2r-project/erc-spec) metadata for some badge types.

## Requirements

* GNU make (optional)
* Docker
* docker-compose
* git
* zip 
* unzip
* wget
* Chrome or Chromium

## Usage

### Creating the reproducibility package

Run `make create_package` from this directory to generate a package containing the required components for badger demo.
If you do not have `make` then manually execute the commands of the `create_package` target in `Makefile`.

This will execute the following steps:

*   Download stable versions of [`o2r-badger`](https://github.com/o2r-project/o2r-badger), [`o2r-muncher`](https://github.com/o2r-project/o2r-muncher), and [`o2r-extender`](https://github.com/o2r-project/o2r-extender)
*   Build Docker images of `o2r-badger` and `o2r-muncher`
*   Save Docker images and the source code in a single zip file
*   Remove the downloaded files and created Docker images

Then manually upload the file `badger_demo.zip` to a suitable data repository.

### Reproduction instructions

Download the reproduction package from https://zenodo.org/record/1199272 unzip it.

Run `make reproduce` to load images and run containers of `o2r-badger` and `o2r-muncher`.
If you do not have `make` then manually execute the commands of the respective target in `Makefile`.

The required services are started via `docker-compose`.
The compose configuration starts (a) a database instance and inserts the test data, (b) the web services, and (c) an [Nginx](https://en.wikipedia.org/wiki/Nginx) web server to make both web services available under port `80`.

Visit [http://localhost/index.html](http://localhost/index.html) for instructions on installing the `o2r-extender` Chrome extension and exploring the examples.

### Cleanup

To stop the services run `make cleanup` or execute the commands of the respective target in `Makefile`.