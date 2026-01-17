import {type Password} from "@p/model";

type PEventMap = "mutation" | "generation";
type PEventInit = EventInit;

type PLEventMap = "add" | "remove";
type PLEventInit = EventInit & {
	changed: Password[]
};

export type {
	PEventMap, PEventInit,
	PLEventMap, PLEventInit
};