import FileSystemService from "@/service/FileSystemService";

export default class HTMLFileSystemService extends FileSystemService{

	private readonly anchorElement: HTMLAnchorElement = document.createElement(
		"a"
	);
	private readonly inputElement: HTMLInputElement = document.createElement(
		"input"
	);
	private inputCallback: ((event: Event) => void) | null = null;

	constructor(identifier: string, extension: string){
		super(identifier, extension);

		this.anchorElement.download = "";

		this.inputElement.type = "file";
		this.inputElement.accept = "application/json";
	}

	// FUNCTIONS
	public save(file: File): void{
		this.anchorElement.href = URL.createObjectURL(file);

		this.anchorElement.click();

		URL.revokeObjectURL(this.anchorElement.href);
		this.anchorElement.href = "";
	}
	public load(): Promise<File>{
		const promised = new Promise<File>((resolve, reject) => {
			this.inputCallback = this.fileInputChanged.bind(this,
				resolve, reject
			);
			this.inputElement.addEventListener("change", this.inputCallback);
		});

		this.inputElement.click();
		return promised;
	}

	// CALLBACKS
	private fileInputChanged(
		resolve: (value: File) => void, reject: (reason?: any) => void,
		event: Event
	){
		if(this.inputElement.files === null)
			return;
		else if(this.inputElement.files.length === 0){
			reject("No file selected;");
			return;
		}else if(this.inputElement.files.length > 1)
			console.warn("Too many files selected, defaulting to first one;")

		resolve(this.inputElement.files.item(0)!);

		if(this.inputCallback != null)
			this.inputElement.removeEventListener("change", this.inputCallback);
	}
}