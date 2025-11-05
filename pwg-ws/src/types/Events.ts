import {Password} from "@p/model";

type PEventMap = "mutation" | "generation";
type PEventInit = EventInit;

type PLEventMap = "add" | "remove";
type PLEventInit = EventInit & {
	changed: Password[]
};

export {
	PEventMap, PEventInit,
	PLEventMap, PLEventInit
};