import View from "@/view/View";
import MasterPasswordView from "@/view/MasterPasswordView";
import PasswordTableView from "@/view/PasswordTableView";
import PasswordView from "@/view/PasswordView";

customElements.define("password-view", PasswordView);
customElements.define("passwordtable-view", PasswordTableView);
customElements.define("masterpassword-view", MasterPasswordView);

export {
	View,
	MasterPasswordView,
	PasswordTableView,
	PasswordView
};
