import {Project, getSubprojectIdentifier} from "../webpack.config.base.mjs";

export default (env, argv) => {
	const project = new Project(
		argv.mode,
		getSubprojectIdentifier(import.meta.url)
	);
	return project.export();
};