import {PasswordEvent} from "@p/event";
import {Password} from "@p/model";
import {PasswordListener} from "@p/controller";
import {View} from "@p/view";

import pvTemplate from "@r/template/password-view.html?string";
import pvStyle from "@r/style/password-view.css?string";

export default class PasswordView extends View{

	public static readonly DELETION_EVENT_NAME = "delete";

	private _password?: Password = undefined;

	/* HTML Elements */
	private websiteCol: HTMLTableCellElement;
	private lengthCol: HTMLTableCellElement;
	private numberInput: HTMLInputElement;
	private passwordCol: HTMLTableCellElement;

	constructor(){
		super(pvTemplate, pvStyle);

		this.websiteCol = (
			this.shadow.getElementById("pv-website") as HTMLTableCellElement
		);
		this.lengthCol = (
			this.shadow.getElementById("pv-length") as HTMLTableCellElement
		);
		this.numberInput = (
			this.shadow.getElementById("pv-number") as HTMLInputElement
		);
		this.passwordCol = (
			this.shadow.getElementById("pv-password") as HTMLTableCellElement
		);

		// Listeners
		const listener = new PasswordListener(this);

		this.numberInput.addEventListener("input",
			listener.onNumberInputChanged.bind(listener)
		);
		this.shadow.getElementById("pv-copy")?.addEventListener("click",
			listener.onCopyButtonClicked.bind(listener)
		);
		this.shadow.getElementById("pv-delete")?.addEventListener("click",
			this.onDeleteIconClicked.bind(this)
		);
	}

	// GETTERS
	public get password(): Password | undefined{ return this._password; }

	// SETTERS
	public setPassword(password: Password){
		if(this.password != undefined){
			this.password.removeEventListener(Password.MUTATION_EVENT_NAME,
				this.onPasswordMutation.bind(this)
			);
			this.password.removeEventListener(Password.GENERATION_EVENT_NAME,
				this.onPasswordGeneration.bind(this)
			);
		}

		this._password = password;

		if(this.password != undefined){
			this.websiteCol.textContent = this.password.website;
			this.lengthCol.textContent = `${this.password.length}`;
			this.setNumberInputValue(this.password.number);
			this.setPasswordColValue(this.password.password);

			this.password.addEventListener(Password.MUTATION_EVENT_NAME,
				this.onPasswordMutation.bind(this)
			);
			this.password.addEventListener(Password.GENERATION_EVENT_NAME,
				this.onPasswordGeneration.bind(this)
			);
		}else{
			this.websiteCol.textContent = "";
			this.lengthCol.textContent = "";
			this.setNumberInputValue();
			this.setPasswordColValue();
		}
	}

	private setNumberInputValue(value?: number){
		this.numberInput.value = value != undefined ? `${value}` : "";
	}
	private setPasswordColValue(pass?: string){
		this.passwordCol.textContent = pass != undefined ? pass : "";
	}

	// LISTENERS
	public onPasswordMutation(event: PasswordEvent){
		if(event.target instanceof Password)
			this.setNumberInputValue(event.target.number);
	}
	public onPasswordGeneration(event: PasswordEvent){
		if(event.target instanceof Password)
			this.setPasswordColValue(event.target.password);
	}

	public onDeleteIconClicked(event: PointerEvent){
		this.dispatchEvent(new Event(PasswordView.DELETION_EVENT_NAME));
	}
}