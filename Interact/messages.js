// Messages is used to enable the agent to communicate within an area
// Messages takes the agent events and translates it to messages for the billboard

import Billboard from "../../Utils/Messages/billboard.js";

export default class Messages{
    constructor(billboard){
        if(!billboard || !(billboard instanceof Billboard) ){
            throw Error("ERROR: billboard required!")
        }
        this.board = billboard;
    }

    set send(payload) {
        this.board.publish = payload;
    }
}