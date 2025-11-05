import {PLEventInit} from "@/types/Events";
import {Password} from "@p/model";

export default class PasswordListEvent extends Event{

	private readonly changedPasswords: Password[] = [];

	constructor(type: string, eventInitDict?: PLEventInit){
		super(type, eventInitDict);

		if(eventInitDict != undefined)
			this.changedPasswords.push(...eventInitDict.changed);
	}

	// GETTERS
	public get changed(): Password[]{ return this.changedPasswords; }
}