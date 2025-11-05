import {Password, PasswordList} from "@p/model";
import {PasswordListEvent} from "@p/event";
import {PasswordTableListener} from "@p/controller";
import {View, PasswordView} from "@p/view";

import ptvTemplate from "@r/template/passwordtable-view.html?string";
import ptvStyle from "@r/style/passwordtable-view.css?string";

export default class PasswordTableView extends View{

	public static readonly WEBSITE_INPUT_NAME = "website";
	public static readonly LENGTH_INPUT_NAME = "length";

	private readonly listener: PasswordTableListener;
	private _passwords?: PasswordList = undefined;

	/* HTML Elements */
	private tableBody: HTMLTableSectionElement;

	constructor(){
		super(ptvTemplate, ptvStyle);

		this.tableBody = (
			this.shadow.getElementById("ptv-tableBody") as HTMLTableSectionElement
		);

		// Listeners
		this.listener = new PasswordTableListener(this);

		this.shadow.getElementById("ptv-load")?.addEventListener("click",
			this.listener.onLoadButtonClicked.bind(this.listener)
		);
		this.shadow.getElementById("ptv-save")?.addEventListener("click",
			this.listener.onSaveButtonClicked.bind(this.listener)
		);

		this.shadow.getElementById("ptv-upload")?.addEventListener("click",
			this.listener.onUploadButtonCLicked.bind(this.listener)
		);
		this.shadow.getElementById("ptv-download")?.addEventListener("click",
			this.listener.onDownloadButtonCLicked.bind(this.listener)
		);

		this.shadow.getElementById("ptv-reset")?.addEventListener("click",
			this.listener.onResetButtonClicked.bind(this.listener)
		);

		this.shadow.getElementById("ptv-form")?.addEventListener("submit",
			this.listener.onAddingFormSubmitted.bind(this.listener)
		);
	}

	// GETTERS
	public get passwords(): PasswordList | undefined{ return this._passwords; }

	// SETTERS
	public setPasswordList(passwords: PasswordList){
		if(this.passwords != undefined){
			this.passwords.removeEventListener(PasswordList.ADD_EVENT_NAME,
				this.onPaswordListAdd.bind(this)
			);
			this.passwords.removeEventListener(PasswordList.REMOVE_EVENT_NAME,
				this.onPasswordListRemove.bind(this)
			);

			this.passwords.getPasswords().forEach(p => this.removeLine(p));
		}

		this._passwords = passwords;

		if(this.passwords != undefined){
			this.passwords.addEventListener(PasswordList.ADD_EVENT_NAME,
				this.onPaswordListAdd.bind(this)
			);
			this.passwords.addEventListener(PasswordList.REMOVE_EVENT_NAME,
				this.onPasswordListRemove.bind(this)
			);

			this.passwords.getPasswords().forEach(p => this.addLine(p));
		}
	}

	public addLine(password: Password){
		const pv = document.createElement("password-view") as PasswordView;
		pv.setPassword(password);
		// XXX: Workaround because we need to bind 'this' to the object from which the function is called (And here, this.listener may be undefined; I prefer so much Java...).
		pv.addEventListener(PasswordView.DELETION_EVENT_NAME,
			(e) => this.listener.onLineDeletion.bind(this.listener)(e)
		);

		this.tableBody.append(pv);
	}
	public removeLine(password: Password){
		for(const child of this.tableBody.children)
			if(child instanceof PasswordView && child.password === password)
				this.tableBody.removeChild(child);
	}

	// LISTENERS
	public onPaswordListAdd(event: PasswordListEvent){
		event.changed.forEach(p => this.addLine(p));
	}
	public onPasswordListRemove(event: PasswordListEvent){
		event.changed.forEach(p => this.removeLine(p));
	}
}