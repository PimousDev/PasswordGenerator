import {
	StorageService,
	NavigatorStorageService, FileSystemService,
	LocalStorageService, HTMLFileSystemService
} from "@p/service";
import {Password, PasswordList} from "@p/model";
import {PasswordView, PasswordTableView} from "@p/view";

export default class PasswordTableListener{

	private static readonly DOWNLOAD_FILENAME = "definitions_%t.pwg.json"

	private readonly navigatorStorage: NavigatorStorageService;
	private readonly fileSystemStorage: FileSystemService;
	private passwords: PasswordList = new PasswordList([
		new Password("google.com", 32, 1),
		new Password("microsoft.com", 32, 1),
		new Password("youtube.com", 32, 1),
		new Password("tiktok.com", 32, 1),
		new Password("facebook.com", 32, 1),
		new Password("x.com", 32, 1),
		new Password("instagram.com", 32, 1),
		new Password("discord.com", 32, 1),
		new Password("github.com", 32, 1)
	]);
	private readonly component: PasswordTableView;

	constructor(component: PasswordTableView){
		this.component = component;
		this.component.setPasswordList(this.passwords);

		this.navigatorStorage = new LocalStorageService();
		this.fileSystemStorage = new HTMLFileSystemService("pwg", "pdef");
	}

	// SETTERS
	public loadPasswords(storage: StorageService){
		PasswordList.load(storage).then(pl => {
			this.passwords = pl;
			this.component.setPasswordList(this.passwords);
		});
	}

	// FUNCTIONS
	public savePasswords(storage: StorageService){
		this.passwords.save(storage);
	}

	// LISTENERS
	public onLoadButtonClicked(event: PointerEvent){
		this.loadPasswords(this.navigatorStorage);
	}
	public onSaveButtonClicked(event: PointerEvent){
		this.savePasswords(this.navigatorStorage);
	}

	public onUploadButtonCLicked(event: PointerEvent){
		this.loadPasswords(this.fileSystemStorage);
	}
	public onDownloadButtonCLicked(event: PointerEvent){
		this.savePasswords(this.fileSystemStorage);
	}

	public onResetButtonClicked(event: PointerEvent){
		// TODO: Implement.
	}

	public onAddingFormSubmitted(event: SubmitEvent){
		event.preventDefault();
		if(!(event.target instanceof HTMLFormElement)) return;

		const websiteInput = event.target.elements.namedItem("website");
		const lengthInput = event.target.elements.namedItem("length");
		if(!(websiteInput instanceof HTMLInputElement)
			|| !(lengthInput instanceof HTMLInputElement)
		) return;

		const password = new Password(
			websiteInput.value,
			Number.parseInt(lengthInput.value)
		);

		try{
			this.passwords.add(password);
		}catch(e){
			alert(`This password website is already in the table (${e}).`)
		}
	}

	public onLineDeletion(event: Event){
		if(!(event.target instanceof PasswordView)
			|| event.target.password == undefined
		) return;

		this.passwords.removeByWebsite(event.target.password.website);
	}
}