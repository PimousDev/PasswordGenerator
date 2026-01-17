#!/bin/bash

SCRIPT_DIR=$(realpath "$(dirname "${BASH_SOURCE[0]}")")

#shellcheck source=../dockerUtils.sh
source "bin/dockerUtils.sh"

source "$SCRIPT_DIR"/config.sh

# ---
mode=${1-"debug"}
resourceDir=${2-$SCRIPT_DIR}

# ---
stop "$DOCKER_CONTAINER_NAME"

removeImage "$DOCKER_IMAGE_REFERENCE"
buildImage "$DOCKER_IMAGE_REFERENCE" "$DOCKER_FILE" "$resourceDir"

createVolumes "$DOCKER_CONFIG_VOLUME_NAME" "$DOCKER_DATA_VOLUME_NAME"

createContainer \
	"$DOCKER_CONTAINER_NAME" "$DOCKER_IMAGE_REFERENCE" "$mode" \
	--mount "type=bind,src=$SUBPROJECT_DEV_OUTPUT_DIR,dst=/usr/share/caddy,readonly"