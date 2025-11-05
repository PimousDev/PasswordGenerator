/* Project Utils (Build tools and Utility libraries/classes)
Copyright © 2025 - Pimous Dev. (https://www.pimous.dev/)

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
import url from "url";
import path from "path";
import fs from "fs";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

// BUG: Workaround
import.meta.filename = url.fileURLToPath(import.meta.url);
import.meta.dirname = path.dirname(import.meta.filename);

// ---
class Mode{

	static get DEVELOPMENT(){ return new Mode("development", "dev"); }
	static get PRODUCTION(){ return new Mode("production", "prod"); }

	#name;
	#identifier;

	constructor(name, identifier){
		this.#name = name;
		this.#identifier = identifier;
	}

	// GETTERS
	static getByName(name){
		const mode = Mode.values.find(m => m.name === name);
		if(mode === undefined)
			throw new Error(`No such mode named "${name}";`);

		return mode;
	}

	get name(){ return this.#name; }
	get identifier(){ return this.#identifier; }

	// FUNCTIONS
	static get values(){
		return [
			Mode.DEVELOPMENT,
			Mode.PRODUCTION
		];
	}
}

class Project{

	#mode;
	#folder;

	constructor(mode, folder){
		this.#mode = Mode.getByName(mode.toLowerCase());
		this.#folder = folder;

		if(!fs.existsSync(this.outputDir))
			fs.mkdirSync(this.outputDir, { recursive: true });
	}

	// GETTERS
	static get NODE_MODULES_DIR(){
		return `${import.meta.dirname}/node_modules/`;
	}
	static get INDEX_SOURCE_FILE(){ return "index.ts"; }
	static get INDEX_MARKUP_FILE(){ return "index.html"; }
	static get INDEX_STYLE_FILE(){ return "index.css"; }

	static get DEVELOPMENT_OUT_DIR(){ return "dev"; }
	static get PRODUCTION_OUT_DIR(){ return "prod"; }
	static get MARKUP_OUT_FILE(){ return "index.html"; }

	get sourceDir(){ return path.resolve("src"); }

	get resourceDir(){ return path.resolve("resource"); }
	get publicResourceDir(){ return `${this.resourceDir}/public`; }
	get templateResourceDir(){ return `${this.resourceDir}/template`; }
	get styleResourceDir(){ return `${this.resourceDir}/style`; }
	get langResourceDir(){ return `${this.resourceDir}/lang`; }
	get imageResourceDir(){ return `${this.resourceDir}/image`; }

	get outputDir(){
		return `${import.meta.dirname}/out/${this.#folder}/${this.#mode.identifier}`;
	}
	get publicOutputDir(){ return `${this.outputDir}/public`; }
	get styleOutFile(){
		return this.#mode === Mode.DEVELOPMENT ?
			"style.css" : "style.[contenthash].css";
	}
	get scriptOutFile(){
		return this.#mode === Mode.DEVELOPMENT ?
			"script.js" : "script.[contenthash].js";
	}
	get assetOutFile(){
		return "asset/" + (this.#mode === Mode.DEVELOPMENT ?
			"[name].[ext]" : "[contenthash].[ext]"
		);
	}

	// FUNCTIONS
	exportAliases(){
		return {
			"@/*": `${this.sourceDir}/*`,

			"@p/*": `${this.sourceDir}/*/index.ts`,

			"@r/template/*": `${this.templateResourceDir}/*`,
			"@r/style/*": `${this.styleResourceDir}/*`,
			"@r/lang/*": `${this.langResourceDir}/*`,
			"@r/image/*": `${this.imageResourceDir}/*`
		};
	}

	export(){
		return {
			mode: this.#mode.name,

			entry: [
				path.resolve(this.sourceDir, Project.INDEX_SOURCE_FILE),
				path.resolve(this.styleResourceDir, Project.INDEX_STYLE_FILE)
			],
			resolve: {
				extensions: [".ts"],
				alias: this.exportAliases()
			},

			module: {
				rules: [
					{
						test: /\.ts$/u,
						use: [{
							loader: "ts-loader",
							options: {
								compilerOptions: {
									outDir: this.outputDir
								}
							}
						}],
						exclude: Project.NODE_MODULES_DIR
					},
					{
						test: /\.html$/u,
						resourceQuery: /string/,
						loader: "html-loader"
					},
					{
						test: /\.css/u,
						oneOf: [
							{
								resourceQuery: /string/,
								loader: "css-loader",
								options: {
									exportType: "string"
								}
							},
							{
								use: [MiniCssExtractPlugin.loader, "css-loader"]
							}
						]
					},
					{
						test: /\.svg/u,
						type: "asset/resource"
					}
				]
			},
			plugins: [
				new HtmlWebpackPlugin({
					template: `${this.publicResourceDir}/${Project.INDEX_MARKUP_FILE}`
				}),
				new MiniCssExtractPlugin({
					filename: this.styleOutFile,
				})
			],
			optimization: {
				minimizer: [
					`...`, // JS minimizer
					new CssMinimizerPlugin()
				]
			},

			output: {
				path: this.publicOutputDir,

				filename: this.scriptOutFile,
				assetModuleFilename: this.assetOutFile,

				clean: true
			}
		};
	}
}

// ---
function getSubprojectIdentifier(fileURL){
	return path.basename(path.dirname(url.fileURLToPath(fileURL)));
}

// ---
export {
	Mode,
	Project,

	getSubprojectIdentifier
};