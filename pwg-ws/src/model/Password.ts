import JSONPassword from "@/types/JSONPassword";
import {PEventMap} from "@/types/Events";
import {PasswordEvent} from "@p/event";
import Model from "@/model/Model";

interface Password extends Model{
	addEventListener(
		type: PEventMap,
		listener: (this: Password, event: PasswordEvent) => any,
		options?: boolean | EventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;

	removeEventListener(
		type: PEventMap,
		callback: (this: Password, event: PasswordEvent) => any,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

class Password extends Model{

	public static readonly MUTATION_EVENT_NAME = "mutation";
	public static readonly GENERATION_EVENT_NAME = "generation";

	private static readonly CHARS_RANGE = {
		start: 33,
		end: 126
	};
	/** Banned chars joined with an offset to the next allowed char. */
	private static readonly BANNED_CHARS: Map<string, number> = new Map([
		['"', 1], ['\'', 1], ['<', 1], ['>', 1], ['`', 1]
	]);
	private static readonly PASSWORD_DEFAULT_LENGTH = 32;
	private static readonly DIGEST_ALOGRITHM = "SHA-512";

	public readonly website: string;
	public readonly length: number;
	private _number: number = 1;
	#password?: string;

	constructor(website: string, length?: number, number?: number){
		super();

		Password.assertLength(length);
		Password.assertNumber(number);

		this.website = website;
		this.length = length ?? Password.PASSWORD_DEFAULT_LENGTH;
		if(number != undefined) this._number = number;
	}

	// GETTERS
	public get number(): number{ return this._number; }
	public get password(): string | undefined{ return this.#password; }
	public generated(): boolean{ return this.#password != undefined; }

	private static getCharInRange(code: number): string{
		const char = String.fromCharCode(
			code%(Password.CHARS_RANGE.end + 1 - Password.CHARS_RANGE.start)
			+ Password.CHARS_RANGE.start
		);

		if(Password.BANNED_CHARS.has(char))
			return String.fromCharCode(
				char.charCodeAt(0) + Password.BANNED_CHARS.get(char)!
			);

		return char;
	}

	// SETTERS
	public setNumber(number: number){
		Password.assertNumber(number);

		this._number = number;

		this.dispatchEvent(new PasswordEvent(Password.MUTATION_EVENT_NAME, {
			cancelable: false
		}))
	}
	public async generatePassword(mainPassword?: string): Promise<void>{
		if(mainPassword == undefined || mainPassword.length == 0){
			this.#password = undefined;
			return;
		}

		const encoder = new TextEncoder().encode(
			`${mainPassword}.${this.website}.${this.number.toString()}`
		);
		this.#password = await crypto.subtle.digest(
			Password.DIGEST_ALOGRITHM, encoder
		).then(out => {
			const outView = new Uint8Array(out);

			return Array.from(outView)
				.map(n => Password.getCharInRange(n))
				.join("")
				.substring(0, this.length);
		});

		this.dispatchEvent(new PasswordEvent(Password.GENERATION_EVENT_NAME, {
			cancelable: false
		}));
	}

	// FUNCTIONS
	public static from(table: any): Password{
		switch(typeof table){
			case "string":
				table = JSON.parse(table) as JSONPassword;
				break;
			case "object":
				table = table as JSONPassword;
				break;
			default:
				throw new Error("Unrecognizable data;");
		}

		if(typeof table.website != "string"
			|| (table.length !== undefined && typeof table.length != "number")
			|| (table.number !== undefined && typeof table.number != "number")
		)
			throw new Error(
				`Password can't be recognized (Got "${JSON.stringify(table)}");`
			);

		return new Password(table.website, table.length, table.number);
	}

	public toEntry(): JSONPassword{
		return {
			website: this.website,
			length: this.length,
			number: this.number
		};
	}

	// ASSERTIONS
	private static assertLength(length?: number){
		if(length != undefined && length < 16)
			throw new RangeError(
				`Length must be superior or equal to 16 (Got ${length.toString()});`
			);
	}
	private static assertNumber(number?: number){
		if(number != undefined && number < 1)
			throw new RangeError(
				`Number must be strictly positive (Got ${number.toString()});`
			);
	}
}

export default Password;