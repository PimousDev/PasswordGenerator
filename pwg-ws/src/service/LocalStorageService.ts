import NavigatorStorageService from "@/service/NavigatorStorageService";

export default class LocalStorageService extends NavigatorStorageService{

	constructor(){
		super(localStorage);
	}
}