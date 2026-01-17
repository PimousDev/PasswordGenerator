#!/bin/bash
# Pimous Servers (Scripts and Docker files)
# Copyright &copy; 2025 - Pimous Dev. (https://www.pimous.dev/)
#
# This script is free software: you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by the Free
# Software Foundation, either version 3 of the License, or (at your option) any
# later version.
#
# The latter are distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# No copy of the license is bundled with the script (As it is posted in a GitHub
# gist). Please see https://www.gnu.org/licenses/.

LOG_MAX_SIZE=10MiB
LOG_MAX_FILE=10

# ---
isContainerExist(){
	docker container inspect "$1" &>/dev/null
	return
}
isVolumeExist(){
	docker volume inspect "$1" &>/dev/null
	return
}

buildImage(){
	image=$1
	file=$2
	dir=$3

	removeImage "$image"

	echo "# BUILDING IMAGE ($image)"
	docker build -t "$image" -f "$file" \
		--progress=plain \
		"$dir"
}
createContainer(){
	container=$1
	image=$2
	debug=$([[ $3 == "debug" ]] && echo 1 || echo 2)
	args=()

	for i in $(seq 4 $#); do
		args+=("${!i}")
	done

	echo "# RUNNING CONTAINER ($container; With image $image)"
	if ! isContainerExist "$container"; then
		docker run "${args[@]}" \
			"$([[ $debug == 1 ]] && echo "-it" || echo "-d")" \
			--log-driver local \
				--log-opt max-size=$LOG_MAX_SIZE \
				--log-opt max-file=$LOG_MAX_FILE \
			--name "$container" --rm \
			"$image"
	else
		echo "$container container already exist."
	fi
}
createVolumes(){
	volumes=("${@}")

	echo "${volumes[@]}"

	echo "# CREATING VOLUMES (${volumes[*]})"
	for v in "${volumes[@]}"; do
		if ! isVolumeExist "$v"; then
			docker volume create "$v"
		else
			echo "$v volume already exist."
		fi
	done
}

stop(){
	container=$1

	echo "# STOPPING CONTAINER ($container)"
	if isContainerExist "$container"; then
		docker container stop "$container"
	else
		echo "$container wasn't started."
	fi
}

removeImage(){
	image=$1

	echo "# DELETING OLD IMAGE ($image)"
	docker image rm -f "$image"
}
clean(){
	container=$1
	volumes=()

	for i in $(seq 2 $#); do
		volumes+=("${!i}")
	done

	stop "$container"

	echo "# DELETING CONTAINER VOLUMES ($DOCKER_CONTAINER_NAME)"
	docker volume rm -f "${volumes[@]}"
}