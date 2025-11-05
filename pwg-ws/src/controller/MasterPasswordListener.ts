import {MasterPasswordView} from "@p/view";

export default class MasterPasswordListener{

	private readonly component: MasterPasswordView;

	constructor(component: MasterPasswordView){
		this.component = component;
	}

	// LISTENERS
	public onFormSubmitted(event: SubmitEvent){
		event.preventDefault();
		if(!(event.target instanceof HTMLFormElement)) return;

		const masterInput = event.target.elements.namedItem(
			MasterPasswordView.MASTER_INPUT_NAME
		);
		if(!(masterInput instanceof HTMLInputElement)) return;

		const table = this.component.getTable();
		if(table == null){
			console.error("<masterpassword-view> isn't associated with a <passwordtable-view> table;");
			return;
		}

		// TODO: Add a wrapper to secure master password.
		table.passwords?.generatePassword(masterInput.value);
	}
}