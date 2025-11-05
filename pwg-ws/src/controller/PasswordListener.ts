import {PasswordView} from "@p/view";

export default class PasswordController{

	private readonly component: PasswordView;

	constructor(component: PasswordView){
		this.component = component;
	}

	// LISTENERS
	public onNumberInputChanged(event: Event){
		if(!(event instanceof InputEvent)
			|| !(event.target instanceof HTMLInputElement)
		) return;

		if(this.component.password != undefined && event.data != null){
			const num = Number.parseInt(event.data);

			if(Number.isNaN(num))
				alert(`Password number must be a number (Got ${event.data}).`);
			else{
				try{
					this.component.password.setNumber(num);
					return;
				}catch(e){
					alert(`Invalid password number (${e}).`);
				}
			}

			event.target.value = `${this.component.password.number}`;
		}
	}
	public onCopyButtonClicked(event: PointerEvent){
		if(this.component.password != undefined
			&& this.component.password.generated()
		)
			navigator.clipboard.writeText(this.component.password.password!);
	}
}