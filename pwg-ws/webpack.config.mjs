/* Project Utils (Build tools and Utility libraries/classes)
Copyright © 2026 - Pimous Dev. (https://www.pimous.dev/)

These programs are free software: you can redistribute them and/or modify them
under the terms of the GNU Lesser General Public License version 3 as published
by the Free Software Foundation.

The latters are distributed in the hope that they will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
details.

You should have received a copy of the GNU General Public License and the GNU
Lesser General Public License along with the programs. If not,
see https://www.gnu.org/licenses/.
*/
import {Project, getSubprojectIdentifier} from "../webpack.config.base.mjs";

export default (env, argv) => {
	const project = new Project(
		argv.mode,
		getSubprojectIdentifier(import.meta.url)
	);
	return project.export();
};