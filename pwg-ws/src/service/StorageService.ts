export default abstract class StorageService{

	// GETTERS
	public abstract get(id: string): Promise<string | null>;
	public getJSONList(id: string): Promise<any[] | null>{
		return this.get(id).then(
			v => typeof v === "string" ? JSON.parse(v) : null
		);
	}

	// SETTERS
	public abstract set(id: string, value: string | null): void;
	public setJSON(id: string, value: any): void{
		this.set(id, JSON.stringify(value));
	}
	public add(id: string, element: any): void{
		this.getJSONList(id).then(v => {
			const table = v ?? [];
			table.push(element);
			this.setJSON(id, table);
		})
	}
}