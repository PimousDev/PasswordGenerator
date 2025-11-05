import StorageService from "@/service/StorageService";

export default abstract class FileSystemService extends StorageService{

	private readonly identifier: string;
	private readonly extension: string;

	constructor(identifier: string, extension: string){
		super();

		this.identifier = identifier;
		this.extension = extension;
	}

	// GETTERS
	public getFilename(id: string, extension: string = this.extension){
		return `${id}_${Date.now()}.${this.identifier}.${extension}`
	}
	public get(id: string): Promise<string | null>{
		return this.load().then(f => f.text());
	}

	// SETTERS
	public set(id: string, value: string | null): void{
		if(value === null) return;

		this.save(new File([new Blob([value])], this.getFilename(id)));
	}

	// FUNCTIONS
	public abstract save(file: File): void;
	public abstract load(): Promise<File>;
}