import {PEventInit} from "@/types/Events";

export default class PasswordEvent extends Event{

	constructor(type: string, eventInitDict?: PEventInit){
		super(type, eventInitDict);
	}
}