import {MasterPasswordListener} from "@p/controller";
import {View, PasswordTableView} from "@p/view";

import mpvTemplate from "@r/template/masterpassword-view.html?string";
import mpvStyle from "@r/style/masterpassword-view.css?string"

export default class MasterPasswordView extends View{

	private static readonly TABLE_ATTRIBUTE_NAME = "table";

	public static readonly MASTER_INPUT_NAME = "master";

	// HTML ELEMENTS
	private errorParagraph: HTMLParagraphElement;

	constructor(){
		super(mpvTemplate, mpvStyle);

		this.errorParagraph = (
			this.shadow.getElementById("mpv-error") as HTMLParagraphElement
		);

		// Listeners
		const listener = new MasterPasswordListener(this);

		this.shadow.getElementById("mpv-form")?.addEventListener("submit",
			listener.onFormSubmitted.bind(listener)
		);
	}

	// GETTERS
	public getTable(): PasswordTableView | null | undefined{
		const id = this.getAttribute(MasterPasswordView.TABLE_ATTRIBUTE_NAME);
		if(id == null) return undefined;

		const element = document.getElementById(id);
		if(element != null && element instanceof PasswordTableView)
			return element;
		else
			return null;
	}
}