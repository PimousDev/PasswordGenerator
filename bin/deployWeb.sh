#!/bin/bash

DEFAULT_PROJECT_IDENTIFIER="pwg"
DEFAULT_SERVER="s0.net.pimous.dev"
DEFAULT_REMOTE_USER="xibitol"
DEFAULT_REMOTE_DIR="ps"
DEFAULT_REMOTE_DEPLOY_SCRIPT="fallback/src/deploy.sh"
DEFAULT_REMOTE_ROOT_DIR="fallback/resource/sites"

NODE_MODULES_DIR="node_modules"

# ---
printError(){
	echo "deploy: $1;" 1>&2

	return "${2:-1}"
}
printUsage(){
	echo "Usage: deploy <project> [server=$DEFAULT_SERVER]" 1>&2

	return 2
}

getOutputDir(){ printf "out/%s/prod" "$1"; }
getCompressOutputFile(){ printf "%s/%s.tar.gz" "$1" "$2"; }
getRemote(){ printf "%s@%s" "$2" "$1"; }
getDeployProgram(){ printf "%s/%s" "$1" "$2"; }
getDeployDir(){ printf "%s/%s/%s" "$1" "$2" "$3"; }

compileProject(){
	project=$1

	if [[ ! -d $project ]]; then
		printError "No such project $project" 3
		return
	fi

	if [[ -d $NODE_MODULES_DIR ]]; then
		echo "# REMOVING DEPENDENCIES"
		rm -r "$NODE_MODULES_DIR"
	fi

	echo "# INSTALLING DEPENDENCIES"
	npm i || return 1
	echo "# CLEANING $project"
	npm run -w "$project" clean || return 1
	echo "# COMPILING $project"
	npm run -w "$project" compile || return 1
}
compressProject(){
	project=$1

	echo "# COMPRESSING COMPILED $project"
	outputDir=$(getOutputDir "$project")

	if ! cd "$outputDir"; then
		printError "Can't change directory to $outputDir" 4
		return
	fi

	outputFile=$(getCompressOutputFile "$OLDPWD" "$project")

	tar -cvz -f "$outputFile" -- * || return 1

	if ! cd "-" 1>/dev/null; then
		printError "Can't change directory to $OLDPWD" 4
		return
	fi
}
pushProject(){
	project=$1
	server=$2

	deployDir=$(getDeployDir \
		"$DEFAULT_REMOTE_DIR" \
		"$DEFAULT_REMOTE_ROOT_DIR" \
		"$DEFAULT_PROJECT_IDENTIFIER" \
	)
	remote=$(getRemote "$server" "$DEFAULT_REMOTE_USER")

	echo "# CLEANING REMOTE DIRECTORY $deployDir TO $remote"
	ssh "$remote" rm -vr "$deployDir"
	ssh "$remote" mkdir -vp "$deployDir" || return 1

	outputFile=$(getCompressOutputFile "." "$project")
	if [[ ! -f $outputFile ]]; then
		printError "No such compressed project $outputFile" 3
		return
	fi

	echo "# PUSHING $outputFile TO $remote:$deployDir"
	scp "$outputFile" "$remote:$deployDir" || return 1

	echo "# EXTRACTING PUSHED $outputFile IN $remote:$deployDir"
	ssh "$remote" tar -xvz -f "$deployDir/$outputFile" -C "$deployDir" \
		|| return 1

	echo "# REMOVING PUSHED $outputFile FROM $remote:$deployDir"
	# shellcheck disable=SC2029
	ssh "$remote" rm -v "$deployDir/$outputFile" || return 1
}
deployProject(){
	project=$1
	server=$2

	remote=$(getRemote "$server" "$DEFAULT_REMOTE_USER")

	echo "## DEPLOYING PROJECT $project USING $DEFAULT_REMOTE_DEPLOY_SCRIPT"
	# shellcheck disable=SC2029
	ssh "$remote" "bash -c \"cd $DEFAULT_REMOTE_DIR; bash $DEFAULT_REMOTE_DEPLOY_SCRIPT\""
}

# ---
_main(){
	if [[ $# -lt 1 ]]; then
		printUsage
		return
	fi

	project=$1
	server=${2:-$DEFAULT_SERVER}

	compileProject "$project" \
		&& compressProject "$project" \
		&& pushProject "$project" "$server" \
		&& deployProject "$project" "$server"

	outputFile=$(getCompressOutputFile "." "$project")
	if [[ -f $outputFile ]]; then
		rm "$outputFile"
	fi
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
	_main "$@"
fi