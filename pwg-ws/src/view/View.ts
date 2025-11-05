export default abstract class View extends HTMLElement{

	constructor(htmlTemplate: string, cssStyle: string){
		super();

		const shadow = this.attachShadow({mode: "open"});

		const template = document.createElement("template");
		template.innerHTML = htmlTemplate.replaceAll(/[\n\r\t]/g, "");
		const style = document.createElement("style");
		style.innerHTML = cssStyle;

		shadow.append(template, style, template.content.cloneNode(true));
	}

	// GETTERS
	public get shadow(): ShadowRoot{
		return this.shadowRoot!;
	}
}