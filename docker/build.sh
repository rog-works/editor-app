#!/bin/bash

set -eux

if [ $# -le 1 ]; then
	echo "invalid arguments. ${#}"
	echo "# Usage"
	echo "- $ bash build.sh <image-name> [options]"
	echo "# Descriptions"
	echo "- --all: build tab push"
	echo "- -b: build"
	echo "- -t: tag"
	echo "- -p: push"
	echo "# Examples"
	echo "- $ bash build.sh editor-app --all"
	exit 1
fi

image=$1
shift
targets=

while [ $# -gt 0 ]
do
	case $1 in
		"--all" )
			targets="build tag push"
		break ;;
		"-b" )
			targets="${targets} build"
		;;
		"-t" )
			targets="${targets} tag"
		;;
		"-p" )
			targets="${targets} push"
		;;
	esac
	shift
done

curr=$(cd $(dirname $0); pwd)

for C in ${targets}
do
	case $C in
		"build" )
			docker build --rm -t ${image} ${curr}
		;;
		"tag" )
			docker tag ${image} localhost:49000/${image}
		;;
		"push" )
			docker push localhost:49000/${image}
		;;
	esac
done
