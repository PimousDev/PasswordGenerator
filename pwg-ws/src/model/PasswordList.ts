import JSONPasswordList from "@/types/JSONPasswordList";
import {PLEventMap} from "@/types/Events";
import {StorageService} from "@p/service";
import Model from "@/model/Model";
import Password from "@/model/Password";
import {PasswordListEvent} from "@p/event";

interface PasswordList extends Model{
	addEventListener(
		type: PLEventMap,
		listener: (this: PasswordList, event: PasswordListEvent) => any,
		options?: boolean | EventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;

	removeEventListener(
		type: PLEventMap,
		callback: (this: PasswordList, event: PasswordListEvent) => any,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

class PasswordList extends Model{

	public static readonly ADD_EVENT_NAME = "add";
	public static readonly REMOVE_EVENT_NAME = "remove";

	private static STORAGE_ID = "pg-pl-passwords";

	private passwords: Password[] = [];

	constructor(passwords: Password[]){
		super();

		this.passwords.push(...passwords);
	}

	// GETTERS
	public getPasswords(): Password[]{ return this.passwords; }
	public indexOfWebsite(website: string): number{
		return this.passwords.findIndex(p => p.website === website);
	}
	public getByWebsite(website: string): Password | undefined{
		return this.passwords.at(this.indexOfWebsite(website));
	}
	public hasWithWebsite(website: string): boolean{
		return this.indexOfWebsite(website) !== -1;
	}

	// SETTERS
	public add(password: Password){
		if(this.hasWithWebsite(password.website))
			throw new Error(
				`Duplicate password on website ${password.website};`
			);

		this.passwords.push(password);

		this.dispatchEvent(new PasswordListEvent(PasswordList.ADD_EVENT_NAME, {
			changed: [password],
			cancelable: false
		}));
	}
	public removeByWebsite(website: string){
		if(!this.hasWithWebsite(website))
			throw new Error(
				`No such password with website ${website};`
			);

		this.dispatchEvent(new PasswordListEvent(PasswordList.REMOVE_EVENT_NAME,
			{
				changed: this.passwords.splice(this.indexOfWebsite(website), 1),
				cancelable: false
			}
		));
	}

	public generatePassword(mainPassword?: string){
		this.passwords.forEach(p => p.generatePassword(mainPassword));
	}

	// FUNCTIONS
	public static load(storage: StorageService): Promise<PasswordList>{
		return storage.getJSONList(this.STORAGE_ID).then(v =>
			new PasswordList(v !== null ? v.map(o => Password.from(o)) : [])
		);
	}

	public save(storage: StorageService): void{
		storage.setJSON(PasswordList.STORAGE_ID, this.toEntry());
	}

	public toEntry(): JSONPasswordList{
		return this.passwords.map(p => p.toEntry());
	}
}

export default PasswordList;